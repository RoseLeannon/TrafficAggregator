const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment process...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer address: ${deployer.address}`);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  if (balance === 0n) {
    throw new Error("❌ Deployer account has no funds!");
  }

  // Deploy PrivateTrafficAggregator contract
  console.log("📝 Deploying PrivateTrafficAggregator contract...");

  const PrivateTrafficAggregator = await hre.ethers.getContractFactory("PrivateTrafficAggregator");
  const contract = await PrivateTrafficAggregator.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`✅ PrivateTrafficAggregator deployed to: ${contractAddress}`);
  console.log(`🔗 Transaction hash: ${contract.deploymentTransaction().hash}\n`);

  // Wait for block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Contract confirmed!\n");

  // Save deployment information
  const deploymentInfo = {
    network: network.name,
    chainId: Number(network.chainId),
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentBlock: contract.deploymentTransaction().blockNumber,
    deploymentTxHash: contract.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
    contractName: "PrivateTrafficAggregator"
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFilePath = path.join(deploymentsDir, `${network.name}-deployment.json`);
  fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`💾 Deployment info saved to: ${deploymentFilePath}\n`);

  // Generate ABI file for frontend
  const artifact = await hre.artifacts.readArtifact("PrivateTrafficAggregator");
  const abiPath = path.join(__dirname, "..", "public", "abi", "PrivateTrafficAggregator.json");

  // Create abi directory if it doesn't exist
  const abiDir = path.join(__dirname, "..", "public", "abi");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }

  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`💾 ABI saved to: ${abiPath}\n`);

  // Update config file for frontend
  const configContent = `// Auto-generated deployment configuration
// Generated at: ${new Date().toISOString()}

export const CONTRACT_CONFIG = {
  address: "${contractAddress}",
  network: "${network.name}",
  chainId: ${network.chainId},
  deploymentBlock: ${contract.deploymentTransaction().blockNumber}
};

export const NETWORK_CONFIG = {
  sepolia: {
    chainId: 8009,
    rpcUrl: "https://devnet.zama.ai/",
    blockExplorer: "https://sepolia.etherscan.io"
  },
  localhost: {
    chainId: 31337,
    rpcUrl: "http://localhost:8545",
    blockExplorer: ""
  }
};
`;

  const configPath = path.join(__dirname, "..", "public", "config", "contracts.js");
  const configDir = path.join(__dirname, "..", "public", "config");

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(configPath, configContent);
  console.log(`💾 Contract config saved to: ${configPath}\n`);

  // Display deployment summary
  console.log("📊 ========== DEPLOYMENT SUMMARY ==========");
  console.log(`Contract Name:      PrivateTrafficAggregator`);
  console.log(`Contract Address:   ${contractAddress}`);
  console.log(`Network:            ${network.name}`);
  console.log(`Chain ID:           ${network.chainId}`);
  console.log(`Deployer:           ${deployer.address}`);
  console.log(`Tx Hash:            ${contract.deploymentTransaction().hash}`);
  console.log(`Block Number:       ${contract.deploymentTransaction().blockNumber}`);
  console.log("==========================================\n");

  // Verification instructions
  if (network.chainId === 11155111n) { // Ethereum Sepolia
    console.log("📝 To verify on Etherscan, run:");
    console.log(`npx hardhat verify --network sepolia ${contractAddress}\n`);
  } else if (network.chainId === 8009n) { // Zama Sepolia
    console.log("📝 Contract deployed to Zama Sepolia testnet");
    console.log("🔗 Explorer: https://sepolia.etherscan.io\n");
  }

  console.log("✅ Deployment completed successfully!");

  return {
    contractAddress,
    deploymentInfo
  };
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

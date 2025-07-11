import { ethers } from "hardhat";

/**
 * Quick deployment and setup script
 * Alternative to using hardhat-deploy for simple deployments
 */
async function main() {
  console.log("========================================");
  console.log("Private Traffic Aggregator V2 Deployment");
  console.log("========================================\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy contract
  console.log("Deploying PrivateTrafficAggregatorV2...");
  const ContractFactory = await ethers.getContractFactory("PrivateTrafficAggregatorV2");
  const contract = await ContractFactory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✓ Contract deployed to:", address);
  console.log("✓ Transaction hash:", contract.deploymentTransaction()?.hash);
  console.log("");

  // Wait for confirmations on testnet
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 8009n) {
    console.log("Waiting for block confirmations...");
    await contract.deploymentTransaction()?.wait(6);
    console.log("✓ 6 confirmations received\n");
  }

  // Initialize with default regions
  console.log("Setting up default configuration...");

  const defaultRegions = [
    "Downtown",
    "Highway-101",
    "Suburban-Area",
    "Industrial-District",
    "Airport-Zone"
  ];

  console.log("\nRegistering regions:");
  for (const region of defaultRegions) {
    const tx = await contract.registerRegion(region);
    await tx.wait();
    console.log(`  ✓ ${region}`);
  }

  // Configure thresholds
  console.log("\nConfiguring alert thresholds:");
  const thresholdTx = await contract.setThresholds(80, 120);
  await thresholdTx.wait();
  console.log("  ✓ Congestion threshold: 80%");
  console.log("  ✓ Speed threshold: 120 km/h");

  // Set cycle interval
  console.log("\nConfiguring cycle interval:");
  const intervalTx = await contract.setCycleInterval(3600);
  await intervalTx.wait();
  console.log("  ✓ Cycle interval: 3600 seconds (1 hour)");

  // Display contract info
  console.log("\n========================================");
  console.log("Deployment Summary");
  console.log("========================================");
  console.log("Contract Address:", address);
  console.log("Admin:", await contract.admin());
  console.log("Current Cycle:", await contract.currentReportCycle());
  console.log("Cycle Interval:", await contract.cycleInterval(), "seconds");
  console.log("Paused:", await contract.paused());
  console.log("Registered Regions:", (await contract.getRegisteredRegions()).length);
  console.log("\nNetwork:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("========================================\n");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    contractAddress: address,
    admin: await contract.admin(),
    deploymentTime: new Date().toISOString(),
    deployer: deployer.address,
    regions: defaultRegions,
  };

  console.log("Deployment Info (save this):");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  console.log("\n✓ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

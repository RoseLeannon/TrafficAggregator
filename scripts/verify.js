const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification process...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Load deployment information
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  const deploymentFilePath = path.join(deploymentsDir, `${network.name}-deployment.json`);

  if (!fs.existsSync(deploymentFilePath)) {
    console.error(`❌ No deployment file found at: ${deploymentFilePath}`);
    console.log("\n💡 Please deploy the contract first using:");
    console.log(`   npm run deploy:${network.name}\n`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFilePath, "utf8"));
  const contractAddress = deploymentInfo.contractAddress;

  console.log(`📝 Contract Address: ${contractAddress}`);
  console.log(`📅 Deployed at: ${deploymentInfo.timestamp}\n`);

  // Verify on Etherscan (if supported)
  if (network.chainId === 11155111n) { // Ethereum Sepolia
    console.log("📝 Verifying contract on Etherscan...\n");

    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });

      console.log("\n✅ Contract verified successfully!");
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code\n`);

      // Update deployment info with verification status
      deploymentInfo.verified = true;
      deploymentInfo.verifiedAt = new Date().toISOString();
      deploymentInfo.explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;

      fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));
      console.log("💾 Deployment info updated with verification status\n");

    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Contract is already verified!");
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code\n`);
      } else {
        console.error("❌ Verification failed:", error.message);
        process.exit(1);
      }
    }

  } else if (network.chainId === 8009n) { // Zama Sepolia
    console.log("📝 Contract deployed to Zama Sepolia testnet");
    console.log("ℹ️  Note: Automatic verification not available for Zama Sepolia");
    console.log(`🔗 Contract Address: ${contractAddress}\n`);

    // Manual verification instructions
    console.log("📋 For manual verification, you'll need:");
    console.log("   1. Contract Address:", contractAddress);
    console.log("   2. Compiler Version: 0.8.24");
    console.log("   3. Optimization: Enabled (200 runs)");
    console.log("   4. EVM Version: cancun");
    console.log("   5. Constructor Arguments: None\n");

    // Update deployment info
    deploymentInfo.verified = false;
    deploymentInfo.explorerUrl = `https://sepolia.etherscan.io/address/${contractAddress}`;
    deploymentInfo.verificationNote = "Manual verification required for Zama Sepolia";

    fs.writeFileSync(deploymentFilePath, JSON.stringify(deploymentInfo, null, 2));

  } else {
    console.log("ℹ️  Verification not configured for this network");
    console.log(`   Network: ${network.name} (Chain ID: ${network.chainId})\n`);
  }

  // Display contract information
  console.log("📊 ========== CONTRACT INFORMATION ==========");
  console.log(`Contract Name:      PrivateTrafficAggregator`);
  console.log(`Contract Address:   ${contractAddress}`);
  console.log(`Network:            ${network.name}`);
  console.log(`Chain ID:           ${network.chainId}`);
  console.log(`Deployed At:        ${deploymentInfo.timestamp}`);
  console.log(`Deployment Tx:      ${deploymentInfo.deploymentTxHash}`);
  console.log(`Explorer URL:       ${deploymentInfo.explorerUrl || 'N/A'}`);
  console.log("=============================================\n");

  // Verify contract is accessible
  console.log("🔍 Checking contract accessibility...");
  try {
    const PrivateTrafficAggregator = await hre.ethers.getContractAt(
      "PrivateTrafficAggregator",
      contractAddress
    );

    const admin = await PrivateTrafficAggregator.admin();
    const currentCycle = await PrivateTrafficAggregator.currentReportCycle();

    console.log("✅ Contract is accessible");
    console.log(`   Admin: ${admin}`);
    console.log(`   Current Cycle: ${currentCycle}\n`);

  } catch (error) {
    console.error("❌ Failed to access contract:", error.message);
    process.exit(1);
  }

  console.log("✅ Verification process completed!");
}

// Execute verification
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification process failed:");
    console.error(error);
    process.exit(1);
  });

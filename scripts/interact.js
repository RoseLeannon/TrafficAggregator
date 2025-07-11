const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔗 Starting contract interaction...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get signer account
  const [signer] = await hre.ethers.getSigners();
  console.log(`👤 Signer address: ${signer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

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

  console.log(`📝 Contract Address: ${contractAddress}\n`);

  // Get contract instance
  const PrivateTrafficAggregator = await hre.ethers.getContractAt(
    "PrivateTrafficAggregator",
    contractAddress
  );

  console.log("📊 ========== CONTRACT STATE ==========");

  try {
    // Read admin
    const admin = await PrivateTrafficAggregator.admin();
    console.log(`Admin:              ${admin}`);

    // Read current cycle
    const currentCycle = await PrivateTrafficAggregator.currentReportCycle();
    console.log(`Current Cycle:      ${currentCycle}`);

    // Read cycle duration
    const cycleDuration = await PrivateTrafficAggregator.reportCycleDuration();
    console.log(`Cycle Duration:     ${cycleDuration} seconds (${Number(cycleDuration) / 60} minutes)`);

    // Get region count
    const regionCount = await PrivateTrafficAggregator.regionCount();
    console.log(`Region Count:       ${regionCount}`);

    console.log("=======================================\n");

    // Display regions if any exist
    if (regionCount > 0n) {
      console.log("📍 ========== REGISTERED REGIONS ==========");
      for (let i = 1n; i <= regionCount; i++) {
        try {
          const region = await PrivateTrafficAggregator.regions(i);
          console.log(`\nRegion ID: ${i}`);
          console.log(`  Name:     ${region.name}`);
          console.log(`  Active:   ${region.isActive}`);
        } catch (error) {
          console.log(`  Error reading region ${i}:`, error.message);
        }
      }
      console.log("==========================================\n");
    }

    // Interactive menu
    console.log("🎮 ========== INTERACTION MENU ==========");
    console.log("Available operations:");
    console.log("1. Register a new region (admin only)");
    console.log("2. Authorize a reporter (admin only)");
    console.log("3. Submit traffic report (authorized reporters)");
    console.log("4. Query region statistics");
    console.log("5. Update cycle duration (admin only)");
    console.log("6. Advance to next cycle (admin only)");
    console.log("==========================================\n");

    // Example: Register a new region (if signer is admin)
    if (signer.address.toLowerCase() === admin.toLowerCase()) {
      console.log("✅ You are the admin! You can perform admin operations.\n");

      // Example: Register a region
      console.log("📝 Example: Registering a new region...");
      console.log("   Region Name: 'Downtown Area'");

      // Uncomment to execute:
      // const tx = await PrivateTrafficAggregator.registerRegion("Downtown Area");
      // console.log(`   Transaction hash: ${tx.hash}`);
      // await tx.wait();
      // console.log(`   ✅ Region registered successfully!\n`);

      console.log("   (Commented out - uncomment to execute)\n");

      // Example: Authorize a reporter
      console.log("📝 Example: Authorizing a reporter...");
      console.log(`   Reporter Address: ${signer.address}`);

      // Uncomment to execute:
      // const tx2 = await PrivateTrafficAggregator.authorizeReporter(signer.address);
      // console.log(`   Transaction hash: ${tx2.hash}`);
      // await tx2.wait();
      // console.log(`   ✅ Reporter authorized successfully!\n`);

      console.log("   (Commented out - uncomment to execute)\n");

    } else {
      console.log("ℹ️  You are not the admin. Admin operations are restricted.\n");
    }

    // Check if user is authorized reporter
    const isAuthorized = await PrivateTrafficAggregator.authorizedReporters(signer.address);
    if (isAuthorized) {
      console.log("✅ You are an authorized reporter!\n");

      // Example: Submit traffic report
      if (regionCount > 0n) {
        console.log("📝 Example: Submitting a traffic report...");
        console.log("   Region ID: 1");
        console.log("   Congestion Level: 50 (encrypted)");
        console.log("   Vehicle Count: 100 (encrypted)");
        console.log("   Average Speed: 45 km/h (encrypted)");

        // Uncomment to execute (requires FHE encryption):
        // const encryptedCongestion = encryptUint8(50);
        // const encryptedVehicleCount = encryptUint32(100);
        // const encryptedAvgSpeed = encryptUint8(45);
        // const tx = await PrivateTrafficAggregator.submitTrafficReport(
        //   1,
        //   encryptedCongestion,
        //   encryptedVehicleCount,
        //   encryptedAvgSpeed
        // );
        // console.log(`   Transaction hash: ${tx.hash}`);
        // await tx.wait();
        // console.log(`   ✅ Traffic report submitted successfully!\n`);

        console.log("   (Commented out - requires FHE encryption)\n");
      }
    } else {
      console.log("ℹ️  You are not an authorized reporter.\n");
    }

    // Display useful commands
    console.log("📚 ========== USEFUL COMMANDS ==========");
    console.log("To interact with the contract, you can:");
    console.log("1. Edit this script to uncomment example operations");
    console.log("2. Use Hardhat console:");
    console.log(`   npx hardhat console --network ${network.name}`);
    console.log("3. Use the frontend application");
    console.log("4. Create custom interaction scripts");
    console.log("==========================================\n");

    console.log("✅ Interaction completed successfully!");

  } catch (error) {
    console.error("❌ Error during interaction:", error.message);
    throw error;
  }
}

// Execute interaction
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });

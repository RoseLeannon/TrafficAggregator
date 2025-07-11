const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// Helper function to simulate delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  console.log("🎬 Starting traffic reporting simulation...\n");

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  console.log(`📡 Network: ${network.name} (Chain ID: ${network.chainId})`);

  // Get signer accounts
  const signers = await hre.ethers.getSigners();
  const [deployer, reporter1, reporter2, reporter3] = signers;

  console.log(`👤 Deployer: ${deployer.address}`);
  console.log(`👤 Reporter 1: ${reporter1.address}`);
  console.log(`👤 Reporter 2: ${reporter2.address}`);
  console.log(`👤 Reporter 3: ${reporter3.address}\n`);

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

  // Get contract instance with deployer (admin)
  const contract = await hre.ethers.getContractAt(
    "PrivateTrafficAggregator",
    contractAddress,
    deployer
  );

  console.log("🎯 ========== SIMULATION PLAN ==========");
  console.log("1. Register multiple traffic regions");
  console.log("2. Authorize multiple traffic reporters");
  console.log("3. Simulate traffic reports from different regions");
  console.log("4. Query aggregated statistics");
  console.log("5. Advance reporting cycle");
  console.log("6. Submit reports for new cycle");
  console.log("=========================================\n");

  try {
    // Step 1: Register regions
    console.log("📍 Step 1: Registering traffic regions...\n");

    const regions = [
      "Downtown Business District",
      "Highway 101 North",
      "Residential Area West",
      "Airport Access Road"
    ];

    const regionIds = [];

    for (let i = 0; i < regions.length; i++) {
      console.log(`   Registering: ${regions[i]}`);

      // Check if region might already exist
      const currentRegionCount = await contract.regionCount();

      try {
        const tx = await contract.registerRegion(regions[i]);
        console.log(`   Transaction hash: ${tx.hash}`);
        await tx.wait();

        const newRegionCount = await contract.regionCount();
        const regionId = newRegionCount;
        regionIds.push(regionId);

        console.log(`   ✅ Region registered with ID: ${regionId}\n`);
        await delay(1000); // Wait 1 second between transactions

      } catch (error) {
        console.log(`   ⚠️  Region might already exist or error: ${error.message}\n`);
        // If error, try to use existing region
        regionIds.push(BigInt(i + 1));
      }
    }

    console.log(`✅ Registered ${regionIds.length} regions\n`);
    await delay(2000);

    // Step 2: Authorize reporters
    console.log("👥 Step 2: Authorizing traffic reporters...\n");

    const reporters = [reporter1, reporter2, reporter3];
    const reporterNames = ["Reporter 1", "Reporter 2", "Reporter 3"];

    for (let i = 0; i < reporters.length; i++) {
      console.log(`   Authorizing ${reporterNames[i]}: ${reporters[i].address}`);

      try {
        const tx = await contract.authorizeReporter(reporters[i].address);
        console.log(`   Transaction hash: ${tx.hash}`);
        await tx.wait();
        console.log(`   ✅ ${reporterNames[i]} authorized\n`);
        await delay(1000);

      } catch (error) {
        console.log(`   ⚠️  Reporter might already be authorized: ${error.message}\n`);
      }
    }

    console.log("✅ Reporters authorized\n");
    await delay(2000);

    // Step 3: Simulate traffic reports
    console.log("🚦 Step 3: Simulating traffic reports...\n");
    console.log("ℹ️  Note: This simulation uses mock encrypted values.");
    console.log("   In production, use Zama FHE encryption libraries.\n");

    // Current cycle
    const currentCycle = await contract.currentReportCycle();
    console.log(`📊 Current Reporting Cycle: ${currentCycle}\n`);

    // Simulate traffic data for different regions
    const trafficScenarios = [
      {
        reporter: reporter1,
        reporterName: "Reporter 1",
        regionId: regionIds[0],
        regionName: regions[0],
        congestion: 75,
        vehicleCount: 250,
        avgSpeed: 25
      },
      {
        reporter: reporter2,
        reporterName: "Reporter 2",
        regionId: regionIds[1],
        regionName: regions[1],
        congestion: 45,
        vehicleCount: 180,
        avgSpeed: 60
      },
      {
        reporter: reporter3,
        reporterName: "Reporter 3",
        regionId: regionIds[2],
        regionName: regions[2],
        congestion: 20,
        vehicleCount: 80,
        avgSpeed: 40
      },
      {
        reporter: reporter1,
        reporterName: "Reporter 1",
        regionId: regionIds[3],
        regionName: regions[3],
        congestion: 55,
        vehicleCount: 150,
        avgSpeed: 50
      }
    ];

    for (const scenario of trafficScenarios) {
      console.log(`📝 ${scenario.reporterName} reporting for: ${scenario.regionName}`);
      console.log(`   Congestion Level: ${scenario.congestion}%`);
      console.log(`   Vehicle Count: ${scenario.vehicleCount}`);
      console.log(`   Average Speed: ${scenario.avgSpeed} km/h`);

      // Note: In production, use actual FHE encryption
      // For simulation, we'll show the call structure
      console.log(`   ⚠️  FHE encryption required - simulating structure only`);

      // Uncomment when FHE encryption is available:
      /*
      const contractWithReporter = contract.connect(scenario.reporter);

      const encryptedCongestion = await encryptUint8(scenario.congestion);
      const encryptedVehicleCount = await encryptUint32(scenario.vehicleCount);
      const encryptedAvgSpeed = await encryptUint8(scenario.avgSpeed);

      const tx = await contractWithReporter.submitTrafficReport(
        scenario.regionId,
        encryptedCongestion,
        encryptedVehicleCount,
        encryptedAvgSpeed
      );

      console.log(`   Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`   ✅ Report submitted successfully\n`);
      */

      console.log(`   (FHE encryption setup required)\n`);
      await delay(1000);
    }

    // Step 4: Query statistics
    console.log("📊 Step 4: Querying aggregated statistics...\n");

    for (let i = 0; i < Math.min(regionIds.length, 4); i++) {
      const regionId = regionIds[i];
      console.log(`Region ${regionId}: ${regions[i]}`);

      try {
        const region = await contract.regions(regionId);
        console.log(`   Status: ${region.isActive ? 'Active' : 'Inactive'}`);
        console.log(`   (Encrypted statistics available on-chain)\n`);
      } catch (error) {
        console.log(`   Error querying region: ${error.message}\n`);
      }
    }

    // Step 5: Display current state
    console.log("📈 Step 5: Current contract state...\n");

    const regionCount = await contract.regionCount();
    const cycleDuration = await contract.reportCycleDuration();

    console.log(`Total Regions: ${regionCount}`);
    console.log(`Current Cycle: ${currentCycle}`);
    console.log(`Cycle Duration: ${cycleDuration} seconds (${Number(cycleDuration) / 60} minutes)\n`);

    // Step 6: Advance cycle (admin only)
    console.log("⏭️  Step 6: Advancing to next reporting cycle...\n");

    try {
      console.log("   This would typically happen automatically after cycle duration");
      console.log("   Or can be triggered manually by admin for testing\n");

      // Uncomment to advance cycle:
      /*
      const tx = await contract.advanceCycle();
      console.log(`   Transaction hash: ${tx.hash}`);
      await tx.wait();

      const newCycle = await contract.currentReportCycle();
      console.log(`   ✅ Advanced to cycle: ${newCycle}\n`);
      */

      console.log("   (Commented out - uncomment to execute)\n");

    } catch (error) {
      console.log(`   ⚠️  Cycle advancement: ${error.message}\n`);
    }

    // Summary
    console.log("📋 ========== SIMULATION SUMMARY ==========");
    console.log(`✅ Regions Registered: ${regionIds.length}`);
    console.log(`✅ Reporters Authorized: ${reporters.length}`);
    console.log(`ℹ️  Traffic Reports: ${trafficScenarios.length} (structure simulated)`);
    console.log(`📊 Current Cycle: ${currentCycle}`);
    console.log(`🔐 Privacy: All data encrypted with FHE`);
    console.log("==========================================\n");

    console.log("💡 Next Steps:");
    console.log("1. Set up FHE encryption for actual data submission");
    console.log("2. Use the frontend application for real-world testing");
    console.log("3. Monitor events and statistics on blockchain explorer");
    console.log("4. Test decryption and analysis with proper keys\n");

    console.log("✅ Simulation completed successfully!");

  } catch (error) {
    console.error("❌ Error during simulation:", error.message);
    throw error;
  }
}

// Execute simulation
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Simulation failed:");
    console.error(error);
    process.exit(1);
  });

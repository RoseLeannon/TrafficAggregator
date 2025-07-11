import { ethers } from "hardhat";

/**
 * Interactive script to test contract functions
 * Useful for manual testing and demonstration
 */
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC";

  console.log("Connecting to contract:", contractAddress);
  const contract = await ethers.getContractAt("PrivateTrafficAggregatorV2", contractAddress);

  const [signer] = await ethers.getSigners();
  console.log("Using account:", signer.address);
  console.log("");

  // Get current cycle info
  console.log("=== Current Cycle Info ===");
  const [cycle, timeRemaining, totalRegions, isPaused] = await contract.getCurrentCycleInfo();
  console.log("Current Cycle:", cycle.toString());
  console.log("Time Remaining:", timeRemaining.toString(), "seconds");
  console.log("Total Regions:", totalRegions.toString());
  console.log("Is Paused:", isPaused);
  console.log("");

  // Get registered regions
  console.log("=== Registered Regions ===");
  const regions = await contract.getRegisteredRegions();
  console.log("Total:", regions.length);
  regions.forEach((region, idx) => {
    console.log(`  ${idx + 1}. ${region}`);
  });
  console.log("");

  // Check if current user is authorized
  console.log("=== Authorization Status ===");
  const isAuthorized = await contract.isReporterAuthorized(signer.address);
  console.log("Is Authorized Reporter:", isAuthorized);
  const isAdmin = (await contract.admin()) === signer.address;
  console.log("Is Admin:", isAdmin);
  const isPauser = await contract.pausers(signer.address);
  console.log("Is Pauser:", isPauser);
  console.log("");

  // Get cycle aggregates
  console.log("=== Cycle Statistics ===");
  const [totalReports, activeRegions, timestamp, isFinalized] = await contract.getCycleAggregate(cycle);
  console.log("Total Reports:", totalReports.toString());
  console.log("Active Regions:", activeRegions.toString());
  console.log("Timestamp:", timestamp.toString());
  console.log("Is Finalized:", isFinalized);
  console.log("");

  // Get region stats if there are any
  if (regions.length > 0 && totalReports > 0n) {
    console.log("=== Region Details ===");
    for (const region of regions.slice(0, 3)) {
      // Show first 3 regions
      const stats = await contract.getRegionStats(region, cycle);
      if (stats[0] > 0n) {
        // Has reports
        console.log(`\n${region}:`);
        console.log("  Total Reports:", stats[0].toString());
        console.log("  Last Update:", new Date(Number(stats[1]) * 1000).toLocaleString());
        console.log("  Has Data:", stats[2]);
        console.log("  Is Decrypted:", stats[3]);
        if (stats[3]) {
          console.log("  Avg Congestion:", stats[4].toString());
          console.log("  Avg Vehicles:", stats[5].toString());
          console.log("  Avg Speed:", stats[6].toString());
        }
      }
    }
    console.log("");
  }

  // Demo: Submit a traffic report (if authorized)
  if (isAuthorized && regions.length > 0 && !isPaused) {
    console.log("=== Submitting Test Report ===");
    const testRegion = regions[0];
    const hasReported = await contract.hasReported(testRegion, signer.address, cycle);

    if (!hasReported) {
      console.log(`Submitting report for ${testRegion}...`);
      try {
        const tx = await contract.submitTrafficReport(
          testRegion,
          65, // congestion: 65%
          150, // vehicles: 150
          75 // speed: 75 km/h
        );
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("✓ Report submitted successfully!");
      } catch (error: any) {
        console.log("❌ Failed to submit report:", error.message);
      }
    } else {
      console.log("Already reported for this cycle");
    }
    console.log("");
  }

  console.log("✓ Interaction complete");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

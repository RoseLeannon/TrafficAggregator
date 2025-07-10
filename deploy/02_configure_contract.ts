import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Configure PrivateTrafficAggregatorV2 after deployment
 * Sets up reporters, pausers, and other configuration
 */
const configureContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { log, get } = deployments;
  const { deployer, admin } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Configuring PrivateTrafficAggregatorV2...");

  const deployment = await get("PrivateTrafficAggregatorV2");
  const contract = await ethers.getContractAt(
    "PrivateTrafficAggregatorV2",
    deployment.address
  );

  // Configuration parameters
  const config = {
    cycleInterval: 3600, // 1 hour
    congestionThreshold: 80, // 80%
    speedThreshold: 120, // 120 km/h
  };

  try {
    // Set cycle interval
    log(`Setting cycle interval to ${config.cycleInterval} seconds...`);
    const currentInterval = await contract.cycleInterval();
    if (currentInterval !== BigInt(config.cycleInterval)) {
      const tx1 = await contract.setCycleInterval(config.cycleInterval);
      await tx1.wait();
      log("  Cycle interval updated ✓");
    } else {
      log("  Cycle interval already set ✓");
    }

    // Set thresholds
    log(`Setting thresholds (congestion: ${config.congestionThreshold}, speed: ${config.speedThreshold})...`);
    const tx2 = await contract.setThresholds(
      config.congestionThreshold,
      config.speedThreshold
    );
    await tx2.wait();
    log("  Thresholds updated ✓");

    // Add additional pausers (if on testnet/mainnet)
    if (hre.network.name === "sepolia") {
      log("Adding emergency pausers...");
      // Add specific pauser addresses here
      const pausers = [
        // Add pauser addresses for production
      ];

      for (const pauser of pausers) {
        if (pauser !== deployer) {
          const isPauser = await contract.pausers(pauser);
          if (!isPauser) {
            const tx = await contract.addPauser(pauser);
            await tx.wait();
            log(`  Added pauser: ${pauser} ✓`);
          }
        }
      }
    }

    log("Configuration complete!");
  } catch (error) {
    log(`Error during configuration: ${error}`);
    throw error;
  }

  log("----------------------------------------------------");
};

export default configureContract;

configureContract.tags = ["configure", "all"];
configureContract.dependencies = ["PrivateTrafficAggregatorV2"];

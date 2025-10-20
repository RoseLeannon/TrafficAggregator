import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploy PrivateTrafficAggregatorV2 contract
 * Uses hardhat-deploy for deployment management
 */
const deployTrafficAggregator: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("----------------------------------------------------");
  log("Deploying PrivateTrafficAggregatorV2...");
  log(`Deployer: ${deployer}`);
  log(`Network: ${hre.network.name}`);

  const deployResult = await deploy("PrivateTrafficAggregatorV2", {
    from: deployer,
    args: [], // Constructor has no arguments
    log: true,
    waitConfirmations: hre.network.name === "sepolia" ? 6 : 1,
    autoMine: true, // Speed up deployment on local network
  });

  if (deployResult.newlyDeployed) {
    log(`Contract deployed at: ${deployResult.address}`);
    log(`Gas used: ${deployResult.receipt?.gasUsed.toString()}`);
    log(`Block: ${deployResult.receipt?.blockNumber}`);

    // Initialize contract with default regions (optional)
    if (hre.network.name === "localfhe" || hre.network.name === "hardhat") {
      log("Initializing contract with default regions...");
      const contract = await hre.ethers.getContractAt(
        "PrivateTrafficAggregatorV2",
        deployResult.address
      );

      const defaultRegions = [
        "Downtown",
        "Highway-101",
        "Suburban-Area",
        "Industrial-District",
        "Airport-Zone"
      ];

      for (const region of defaultRegions) {
        const tx = await contract.registerRegion(region);
        await tx.wait();
        log(`  Registered region: ${region}`);
      }

      log("Contract initialization complete!");
    }
  } else {
    log(`Contract already deployed at: ${deployResult.address}`);
  }

  log("----------------------------------------------------");
};

export default deployTrafficAggregator;

// Tags allow selective deployment
deployTrafficAggregator.tags = ["PrivateTrafficAggregatorV2", "all"];

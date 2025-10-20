import { run } from "hardhat";

/**
 * Verify contract on block explorer
 * Usage: npx hardhat run scripts/verify-contract.ts --network sepolia
 */
async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS || "0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC";

  console.log("Verifying contract at:", contractAddress);
  console.log("This may take a few minutes...\n");

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: [], // No constructor arguments
      contract: "contracts/PrivateTrafficAggregatorV2.sol:PrivateTrafficAggregatorV2"
    });

    console.log("✓ Contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract already verified!");
    } else {
      console.error("❌ Verification failed:");
      console.error(error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

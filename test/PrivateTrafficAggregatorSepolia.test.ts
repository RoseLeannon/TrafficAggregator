import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { PrivateTrafficAggregator } from "../typechain-types";

type Signers = {
  deployer: HardhatEthersSigner;
};

describe("PrivateTrafficAggregatorSepolia", function () {
  let signers: Signers;
  let contract: PrivateTrafficAggregator;
  let contractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`  ${++step}/${steps} ${message}`);
  }

  before(async function () {
    // Check if running on Sepolia
    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
      console.warn(`⚠️  This test suite can only run on Sepolia Testnet (Chain ID: 11155111)`);
      console.warn(`   Current network: ${network.name} (Chain ID: ${network.chainId})`);
      console.warn(`   Run: npx hardhat test --network sepolia`);
      this.skip();
    }

    // Get the deployed contract address
    try {
      // Try to read deployment info
      const deploymentInfo = require("../deployment-info.json");
      contractAddress = deploymentInfo.contract;
      contract = await ethers.getContractAt("PrivateTrafficAggregator", contractAddress);
      console.log(`✅ Connected to deployed contract at: ${contractAddress}`);
    } catch (e) {
      console.error(`❌ Failed to connect to deployed contract`);
      console.error(`   Make sure the contract is deployed on Sepolia`);
      console.error(`   Run: npx hardhat run scripts/deploy.js --network sepolia`);
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0] };

    console.log(`\n📊 Test Configuration:`);
    console.log(`   Network: Sepolia (${network.chainId})`);
    console.log(`   Contract: ${contractAddress}`);
    console.log(`   Deployer: ${signers.deployer.address}`);
    console.log(``);
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  describe("Deployment Verification", function () {
    it("should verify contract is deployed on Sepolia", async function () {
      steps = 3;
      this.timeout(60000); // 60 seconds

      progress("Checking contract address...");
      expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);

      progress("Verifying contract code...");
      const code = await ethers.provider.getCode(contractAddress);
      expect(code).to.not.equal("0x");

      progress("Contract verified ✅");
    });

    it("should verify admin is set correctly", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Querying admin address...");
      const admin = await contract.admin();

      progress(`Admin: ${admin}`);
      expect(admin).to.be.properAddress;
    });

    it("should query current cycle", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Querying current report cycle...");
      const cycle = await contract.currentReportCycle();

      progress(`Current cycle: ${cycle}`);
      expect(cycle).to.be.gte(0);
    });

    it("should query region count", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Querying region count...");
      const regionCount = await contract.regionCount();

      progress(`Total regions: ${regionCount}`);
      expect(regionCount).to.be.gte(0);
    });
  });

  describe("Read Operations on Sepolia", function () {
    it("should read all registered regions", async function () {
      steps = 3;
      this.timeout(120000); // 2 minutes

      progress("Getting region count...");
      const regionCount = await contract.regionCount();

      if (regionCount > 0) {
        progress(`Reading ${regionCount} regions...`);
        for (let i = 0; i < regionCount; i++) {
          const regionName = await contract.regions(i);
          console.log(`     Region ${i}: ${regionName}`);
        }
      } else {
        progress("No regions registered yet");
      }

      progress("Read complete ✅");
    });

    it("should check reporter authorization status", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Checking deployer authorization...");
      const isAuthorized = await contract.authorizedReporters(signers.deployer.address);

      progress(`Deployer authorized: ${isAuthorized}`);
      expect(isAuthorized).to.be.a("boolean");
    });

    it("should query contract state", async function () {
      steps = 4;
      this.timeout(120000);

      progress("Querying admin...");
      const admin = await contract.admin();

      progress("Querying current cycle...");
      const cycle = await contract.currentReportCycle();

      progress("Querying region count...");
      const regionCount = await contract.regionCount();

      progress("State query complete ✅");
      console.log(`     Admin: ${admin}`);
      console.log(`     Cycle: ${cycle}`);
      console.log(`     Regions: ${regionCount}`);
    });
  });

  describe("Write Operations on Sepolia (Admin Only)", function () {
    before(async function () {
      // Check if signer is admin
      const admin = await contract.admin();
      if (admin.toLowerCase() !== signers.deployer.address.toLowerCase()) {
        console.warn(`⚠️  Skipping write tests - deployer is not admin`);
        console.warn(`   Admin: ${admin}`);
        console.warn(`   Deployer: ${signers.deployer.address}`);
        this.skip();
      }
    });

    it("should register a new region on Sepolia", async function () {
      steps = 5;
      this.timeout(180000); // 3 minutes

      progress("Getting initial region count...");
      const initialCount = await contract.regionCount();

      const testRegionName = `TestRegion_${Date.now()}`;
      progress(`Registering region: ${testRegionName}...`);

      const tx = await contract.connect(signers.deployer).registerRegion(testRegionName);

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      progress(`Transaction confirmed in block ${receipt?.blockNumber}`);
      console.log(`     TX Hash: ${receipt?.hash}`);
      console.log(`     Gas Used: ${receipt?.gasUsed}`);

      progress("Verifying region registration...");
      const newCount = await contract.regionCount();
      expect(newCount).to.equal(initialCount + 1n);

      console.log(`✅ Region registered successfully on Sepolia`);
    });

    it("should authorize a reporter on Sepolia", async function () {
      steps = 5;
      this.timeout(180000);

      // Use a test address
      const testReporter = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

      progress("Checking initial authorization status...");
      const initialStatus = await contract.authorizedReporters(testReporter);

      progress(`Authorizing reporter: ${testReporter}...`);
      const tx = await contract.connect(signers.deployer).authorizeReporter(testReporter);

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      progress(`Transaction confirmed in block ${receipt?.blockNumber}`);
      console.log(`     TX Hash: ${receipt?.hash}`);

      progress("Verifying authorization...");
      const newStatus = await contract.authorizedReporters(testReporter);
      expect(newStatus).to.be.true;

      console.log(`✅ Reporter authorized successfully on Sepolia`);
    });

    it("should advance report cycle on Sepolia", async function () {
      steps = 5;
      this.timeout(180000);

      progress("Getting current cycle...");
      const initialCycle = await contract.currentReportCycle();

      progress(`Advancing from cycle ${initialCycle}...`);
      const tx = await contract.connect(signers.deployer).advanceReportCycle();

      progress("Waiting for transaction confirmation...");
      const receipt = await tx.wait();

      progress(`Transaction confirmed in block ${receipt?.blockNumber}`);
      console.log(`     TX Hash: ${receipt?.hash}`);

      progress("Verifying cycle advancement...");
      const newCycle = await contract.currentReportCycle();
      expect(newCycle).to.equal(initialCycle + 1n);

      console.log(`✅ Cycle advanced successfully: ${initialCycle} → ${newCycle}`);
    });
  });

  describe("Event Verification on Sepolia", function () {
    before(async function () {
      // Check if signer is admin
      const admin = await contract.admin();
      if (admin.toLowerCase() !== signers.deployer.address.toLowerCase()) {
        console.warn(`⚠️  Skipping event tests - deployer is not admin`);
        this.skip();
      }
    });

    it("should emit RegionRegistered event on Sepolia", async function () {
      steps = 3;
      this.timeout(180000);

      const testRegionName = `EventTest_${Date.now()}`;

      progress(`Registering region for event test...`);
      const tx = await contract.connect(signers.deployer).registerRegion(testRegionName);

      progress("Waiting for transaction...");
      const receipt = await tx.wait();

      progress("Checking events...");
      const events = receipt?.logs || [];
      expect(events.length).to.be.gt(0);

      console.log(`✅ Event emitted: ${events.length} event(s) found`);
    });
  });

  describe("Gas Cost Analysis on Sepolia", function () {
    before(async function () {
      const admin = await contract.admin();
      if (admin.toLowerCase() !== signers.deployer.address.toLowerCase()) {
        console.warn(`⚠️  Skipping gas tests - deployer is not admin`);
        this.skip();
      }
    });

    it("should measure gas cost for region registration", async function () {
      steps = 3;
      this.timeout(180000);

      const testRegionName = `GasTest_${Date.now()}`;

      progress("Executing transaction...");
      const tx = await contract.connect(signers.deployer).registerRegion(testRegionName);

      progress("Waiting for receipt...");
      const receipt = await tx.wait();

      progress("Gas analysis complete");
      console.log(`     Gas Used: ${receipt?.gasUsed}`);
      console.log(`     Gas Price: ${receipt?.gasPrice}`);

      const totalCost = (receipt?.gasUsed || 0n) * (receipt?.gasPrice || 0n);
      console.log(`     Total Cost: ${ethers.formatEther(totalCost)} ETH`);

      expect(receipt?.gasUsed).to.be.lt(500000); // Should be < 500k gas
    });

    it("should measure gas cost for reporter authorization", async function () {
      steps = 3;
      this.timeout(180000);

      const testReporter = `0x${Math.floor(Math.random() * 1e16).toString(16).padStart(40, '0')}`;

      progress("Executing transaction...");
      const tx = await contract.connect(signers.deployer).authorizeReporter(testReporter);

      progress("Waiting for receipt...");
      const receipt = await tx.wait();

      progress("Gas analysis complete");
      console.log(`     Gas Used: ${receipt?.gasUsed}`);

      expect(receipt?.gasUsed).to.be.lt(200000); // Should be < 200k gas
    });
  });

  describe("Network Integration Tests", function () {
    it("should verify Sepolia network parameters", async function () {
      steps = 4;
      this.timeout(60000);

      progress("Getting network info...");
      const network = await ethers.provider.getNetwork();

      progress("Getting block number...");
      const blockNumber = await ethers.provider.getBlockNumber();

      progress("Getting gas price...");
      const feeData = await ethers.provider.getFeeData();

      progress("Network check complete");
      console.log(`     Chain ID: ${network.chainId}`);
      console.log(`     Block Number: ${blockNumber}`);
      console.log(`     Gas Price: ${ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} gwei`);

      expect(network.chainId).to.equal(11155111n);
    });

    it("should verify contract has bytecode on Sepolia", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Fetching contract bytecode...");
      const code = await ethers.provider.getCode(contractAddress);

      progress(`Bytecode size: ${code.length} bytes`);
      expect(code).to.not.equal("0x");
      expect(code.length).to.be.gt(100);
    });

    it("should check deployer balance on Sepolia", async function () {
      steps = 2;
      this.timeout(60000);

      progress("Getting deployer balance...");
      const balance = await ethers.provider.getBalance(signers.deployer.address);

      progress(`Balance: ${ethers.formatEther(balance)} ETH`);
      expect(balance).to.be.gte(0);

      if (balance < ethers.parseEther("0.01")) {
        console.warn(`     ⚠️  Low balance - get testnet ETH from faucet`);
      }
    });
  });
});

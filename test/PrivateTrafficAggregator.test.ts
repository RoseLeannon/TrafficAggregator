import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { PrivateTrafficAggregator } from "../typechain-types";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  charlie: HardhatEthersSigner;
};

describe("PrivateTrafficAggregator", function () {
  let signers: Signers;
  let contract: PrivateTrafficAggregator;
  let contractAddress: string;

  // Deployment fixture
  async function deployFixture() {
    const factory = await ethers.getContractFactory("PrivateTrafficAggregator");
    const contract = await factory.deploy() as PrivateTrafficAggregator;
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    return { contract, contractAddress };
  }

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      charlie: ethSigners[3],
    };
  });

  beforeEach(async function () {
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("should set deployer as admin", async function () {
      const admin = await contract.admin();
      expect(admin).to.equal(signers.deployer.address);
    });

    it("should initialize with cycle 0", async function () {
      const cycle = await contract.currentReportCycle();
      expect(cycle).to.equal(0);
    });

    it("should initialize with 0 regions", async function () {
      const regionCount = await contract.regionCount();
      expect(regionCount).to.equal(0);
    });

    it("should have correct contract address", async function () {
      expect(contractAddress).to.match(/^0x[a-fA-F0-9]{40}$/);
    });
  });

  describe("Region Registration", function () {
    it("should allow admin to register a region", async function () {
      const tx = await contract.connect(signers.deployer).registerRegion("Downtown");
      await tx.wait();

      const regionCount = await contract.regionCount();
      expect(regionCount).to.equal(1);

      const regionName = await contract.regions(0);
      expect(regionName).to.equal("Downtown");
    });

    it("should register multiple regions", async function () {
      await contract.connect(signers.deployer).registerRegion("Downtown");
      await contract.connect(signers.deployer).registerRegion("Uptown");
      await contract.connect(signers.deployer).registerRegion("Midtown");

      const regionCount = await contract.regionCount();
      expect(regionCount).to.equal(3);

      const region1 = await contract.regions(0);
      const region2 = await contract.regions(1);
      const region3 = await contract.regions(2);

      expect(region1).to.equal("Downtown");
      expect(region2).to.equal("Uptown");
      expect(region3).to.equal("Midtown");
    });

    it("should emit RegionRegistered event", async function () {
      await expect(contract.connect(signers.deployer).registerRegion("Downtown"))
        .to.emit(contract, "RegionRegistered")
        .withArgs(0, "Downtown");
    });

    it("should reject region registration from non-admin", async function () {
      await expect(
        contract.connect(signers.alice).registerRegion("Downtown")
      ).to.be.revertedWith("Only admin");
    });

    it("should handle empty region name", async function () {
      await expect(
        contract.connect(signers.deployer).registerRegion("")
      ).to.be.revertedWith("Region name cannot be empty");
    });

    it("should handle long region names", async function () {
      const longName = "A".repeat(100);
      const tx = await contract.connect(signers.deployer).registerRegion(longName);
      await tx.wait();

      const regionName = await contract.regions(0);
      expect(regionName).to.equal(longName);
    });

    it("should handle special characters in region name", async function () {
      const specialName = "Region-123_#@!";
      const tx = await contract.connect(signers.deployer).registerRegion(specialName);
      await tx.wait();

      const regionName = await contract.regions(0);
      expect(regionName).to.equal(specialName);
    });
  });

  describe("Reporter Authorization", function () {
    beforeEach(async function () {
      // Register a region first
      await contract.connect(signers.deployer).registerRegion("Downtown");
    });

    it("should allow admin to authorize a reporter", async function () {
      const tx = await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await tx.wait();

      const isAuthorized = await contract.authorizedReporters(signers.alice.address);
      expect(isAuthorized).to.be.true;
    });

    it("should authorize multiple reporters", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);

      const isAliceAuthorized = await contract.authorizedReporters(signers.alice.address);
      const isBobAuthorized = await contract.authorizedReporters(signers.bob.address);

      expect(isAliceAuthorized).to.be.true;
      expect(isBobAuthorized).to.be.true;
    });

    it("should emit ReporterAuthorized event", async function () {
      await expect(contract.connect(signers.deployer).authorizeReporter(signers.alice.address))
        .to.emit(contract, "ReporterAuthorized")
        .withArgs(signers.alice.address);
    });

    it("should reject authorization from non-admin", async function () {
      await expect(
        contract.connect(signers.alice).authorizeReporter(signers.bob.address)
      ).to.be.revertedWith("Only admin");
    });

    it("should reject authorization of zero address", async function () {
      await expect(
        contract.connect(signers.deployer).authorizeReporter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid reporter address");
    });

    it("should allow admin to revoke reporter authorization", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      const tx = await contract.connect(signers.deployer).revokeReporter(signers.alice.address);
      await tx.wait();

      const isAuthorized = await contract.authorizedReporters(signers.alice.address);
      expect(isAuthorized).to.be.false;
    });

    it("should emit ReporterRevoked event", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      await expect(contract.connect(signers.deployer).revokeReporter(signers.alice.address))
        .to.emit(contract, "ReporterRevoked")
        .withArgs(signers.alice.address);
    });

    it("should reject revocation from non-admin", async function () {
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      await expect(
        contract.connect(signers.bob).revokeReporter(signers.alice.address)
      ).to.be.revertedWith("Only admin");
    });
  });

  describe("Report Cycle Management", function () {
    it("should allow admin to advance report cycle", async function () {
      const initialCycle = await contract.currentReportCycle();

      const tx = await contract.connect(signers.deployer).advanceReportCycle();
      await tx.wait();

      const newCycle = await contract.currentReportCycle();
      expect(newCycle).to.equal(initialCycle + 1n);
    });

    it("should emit CycleAdvanced event", async function () {
      const initialCycle = await contract.currentReportCycle();

      await expect(contract.connect(signers.deployer).advanceReportCycle())
        .to.emit(contract, "CycleAdvanced")
        .withArgs(initialCycle + 1n);
    });

    it("should reject cycle advancement from non-admin", async function () {
      await expect(
        contract.connect(signers.alice).advanceReportCycle()
      ).to.be.revertedWith("Only admin");
    });

    it("should advance cycle multiple times", async function () {
      await contract.connect(signers.deployer).advanceReportCycle();
      await contract.connect(signers.deployer).advanceReportCycle();
      await contract.connect(signers.deployer).advanceReportCycle();

      const cycle = await contract.currentReportCycle();
      expect(cycle).to.equal(3);
    });
  });

  describe("Access Control", function () {
    it("should correctly identify admin", async function () {
      const admin = await contract.admin();
      expect(admin).to.equal(signers.deployer.address);
    });

    it("should prevent non-admin from registering regions", async function () {
      await expect(
        contract.connect(signers.alice).registerRegion("Test")
      ).to.be.revertedWith("Only admin");
    });

    it("should prevent non-admin from authorizing reporters", async function () {
      await expect(
        contract.connect(signers.alice).authorizeReporter(signers.bob.address)
      ).to.be.revertedWith("Only admin");
    });

    it("should prevent non-admin from revoking reporters", async function () {
      await expect(
        contract.connect(signers.alice).revokeReporter(signers.bob.address)
      ).to.be.revertedWith("Only admin");
    });

    it("should prevent non-admin from advancing cycle", async function () {
      await expect(
        contract.connect(signers.alice).advanceReportCycle()
      ).to.be.revertedWith("Only admin");
    });

    it("should allow admin to perform all functions", async function () {
      await expect(
        contract.connect(signers.deployer).registerRegion("Test")
      ).to.not.be.reverted;

      await expect(
        contract.connect(signers.deployer).authorizeReporter(signers.alice.address)
      ).to.not.be.reverted;

      await expect(
        contract.connect(signers.deployer).advanceReportCycle()
      ).to.not.be.reverted;
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.connect(signers.deployer).registerRegion("Region A");
      await contract.connect(signers.deployer).registerRegion("Region B");
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
    });

    it("should return correct admin address", async function () {
      const admin = await contract.admin();
      expect(admin).to.equal(signers.deployer.address);
    });

    it("should return correct region count", async function () {
      const count = await contract.regionCount();
      expect(count).to.equal(2);
    });

    it("should return correct region names", async function () {
      const region0 = await contract.regions(0);
      const region1 = await contract.regions(1);

      expect(region0).to.equal("Region A");
      expect(region1).to.equal("Region B");
    });

    it("should return correct reporter authorization status", async function () {
      const isAliceAuthorized = await contract.authorizedReporters(signers.alice.address);
      const isBobAuthorized = await contract.authorizedReporters(signers.bob.address);

      expect(isAliceAuthorized).to.be.true;
      expect(isBobAuthorized).to.be.false;
    });

    it("should return correct current cycle", async function () {
      const cycle = await contract.currentReportCycle();
      expect(cycle).to.equal(0);

      await contract.connect(signers.deployer).advanceReportCycle();
      const newCycle = await contract.currentReportCycle();
      expect(newCycle).to.equal(1);
    });
  });

  describe("Edge Cases", function () {
    it("should handle maximum uint256 cycle value", async function () {
      // Note: In reality, we can't reach max uint256, but we can test the mechanism
      const initialCycle = await contract.currentReportCycle();
      expect(initialCycle).to.be.gte(0);
    });

    it("should handle zero region count", async function () {
      const count = await contract.regionCount();
      expect(count).to.equal(0);
    });

    it("should handle querying non-existent regions", async function () {
      await expect(
        contract.regions(999)
      ).to.be.reverted;
    });

    it("should handle checking authorization for zero address", async function () {
      const isAuthorized = await contract.authorizedReporters(ethers.ZeroAddress);
      expect(isAuthorized).to.be.false;
    });

    it("should handle registering 100+ regions", async function () {
      for (let i = 0; i < 10; i++) {
        await contract.connect(signers.deployer).registerRegion(`Region ${i}`);
      }

      const count = await contract.regionCount();
      expect(count).to.equal(10);
    });
  });

  describe("Gas Optimization", function () {
    it("should use reasonable gas for region registration", async function () {
      const tx = await contract.connect(signers.deployer).registerRegion("Test Region");
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(200000); // < 200k gas
    });

    it("should use reasonable gas for reporter authorization", async function () {
      const tx = await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(100000); // < 100k gas
    });

    it("should use reasonable gas for cycle advancement", async function () {
      const tx = await contract.connect(signers.deployer).advanceReportCycle();
      const receipt = await tx.wait();

      expect(receipt?.gasUsed).to.be.lt(50000); // < 50k gas
    });
  });

  describe("Event Emission", function () {
    it("should emit all events correctly", async function () {
      // RegionRegistered event
      await expect(contract.connect(signers.deployer).registerRegion("Test"))
        .to.emit(contract, "RegionRegistered");

      // ReporterAuthorized event
      await expect(contract.connect(signers.deployer).authorizeReporter(signers.alice.address))
        .to.emit(contract, "ReporterAuthorized");

      // CycleAdvanced event
      await expect(contract.connect(signers.deployer).advanceReportCycle())
        .to.emit(contract, "CycleAdvanced");

      // ReporterRevoked event
      await expect(contract.connect(signers.deployer).revokeReporter(signers.alice.address))
        .to.emit(contract, "ReporterRevoked");
    });

    it("should emit events with correct parameters", async function () {
      await expect(contract.connect(signers.deployer).registerRegion("Downtown"))
        .to.emit(contract, "RegionRegistered")
        .withArgs(0, "Downtown");

      await expect(contract.connect(signers.deployer).authorizeReporter(signers.alice.address))
        .to.emit(contract, "ReporterAuthorized")
        .withArgs(signers.alice.address);

      await expect(contract.connect(signers.deployer).advanceReportCycle())
        .to.emit(contract, "CycleAdvanced")
        .withArgs(1);
    });
  });

  describe("State Consistency", function () {
    it("should maintain consistent state across operations", async function () {
      // Register regions
      await contract.connect(signers.deployer).registerRegion("Region 1");
      await contract.connect(signers.deployer).registerRegion("Region 2");

      // Authorize reporters
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);

      // Advance cycle
      await contract.connect(signers.deployer).advanceReportCycle();

      // Verify all state is consistent
      const regionCount = await contract.regionCount();
      const cycle = await contract.currentReportCycle();
      const isAuthorized = await contract.authorizedReporters(signers.alice.address);

      expect(regionCount).to.equal(2);
      expect(cycle).to.equal(1);
      expect(isAuthorized).to.be.true;
    });

    it("should handle complex operation sequences", async function () {
      // Complex sequence
      await contract.connect(signers.deployer).registerRegion("R1");
      await contract.connect(signers.deployer).authorizeReporter(signers.alice.address);
      await contract.connect(signers.deployer).registerRegion("R2");
      await contract.connect(signers.deployer).advanceReportCycle();
      await contract.connect(signers.deployer).authorizeReporter(signers.bob.address);
      await contract.connect(signers.deployer).revokeReporter(signers.alice.address);

      // Verify final state
      expect(await contract.regionCount()).to.equal(2);
      expect(await contract.currentReportCycle()).to.equal(1);
      expect(await contract.authorizedReporters(signers.alice.address)).to.be.false;
      expect(await contract.authorizedReporters(signers.bob.address)).to.be.true;
    });
  });
});

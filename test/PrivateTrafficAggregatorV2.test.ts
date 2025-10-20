import { expect } from "chai";
import { ethers } from "hardhat";
import { PrivateTrafficAggregatorV2 } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("PrivateTrafficAggregatorV2", function () {
  let contract: PrivateTrafficAggregatorV2;
  let admin: SignerWithAddress;
  let reporter1: SignerWithAddress;
  let reporter2: SignerWithAddress;
  let pauser: SignerWithAddress;
  let unauthorized: SignerWithAddress;

  const REGION_1 = "Downtown";
  const REGION_2 = "Highway-101";
  const REGION_3 = "Suburban-Area";

  beforeEach(async function () {
    [admin, reporter1, reporter2, pauser, unauthorized] = await ethers.getSigners();

    const ContractFactory = await ethers.getContractFactory("PrivateTrafficAggregatorV2");
    contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });

    it("Should initialize with cycle 1", async function () {
      expect(await contract.currentReportCycle()).to.equal(1);
    });

    it("Should authorize admin as reporter by default", async function () {
      expect(await contract.isReporterAuthorized(admin.address)).to.be.true;
    });

    it("Should set admin as pauser by default", async function () {
      expect(await contract.pausers(admin.address)).to.be.true;
    });

    it("Should not be paused initially", async function () {
      expect(await contract.paused()).to.be.false;
    });

    it("Should set default cycle interval", async function () {
      expect(await contract.cycleInterval()).to.equal(3600);
    });
  });

  describe("Region Management", function () {
    it("Should allow admin to register a region", async function () {
      await expect(contract.registerRegion(REGION_1))
        .to.emit(contract, "RegionRegistered")
        .withArgs(REGION_1, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await contract.validRegions(REGION_1)).to.be.true;
    });

    it("Should add region to registered regions list", async function () {
      await contract.registerRegion(REGION_1);
      const regions = await contract.getRegisteredRegions();
      expect(regions).to.include(REGION_1);
    });

    it("Should register multiple regions", async function () {
      await contract.registerRegion(REGION_1);
      await contract.registerRegion(REGION_2);
      await contract.registerRegion(REGION_3);

      const regions = await contract.getRegisteredRegions();
      expect(regions.length).to.equal(3);
      expect(regions).to.include.members([REGION_1, REGION_2, REGION_3]);
    });

    it("Should revert when non-admin tries to register region", async function () {
      await expect(
        contract.connect(reporter1).registerRegion(REGION_1)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("Should revert when registering duplicate region", async function () {
      await contract.registerRegion(REGION_1);
      await expect(
        contract.registerRegion(REGION_1)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert when registering empty region name", async function () {
      await expect(
        contract.registerRegion("")
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert when registering region name too long", async function () {
      const longName = "a".repeat(65);
      await expect(
        contract.registerRegion(longName)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert region registration when paused", async function () {
      await contract.pause();
      await expect(
        contract.registerRegion(REGION_1)
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });
  });

  describe("Reporter Authorization", function () {
    it("Should allow admin to authorize reporters", async function () {
      await expect(contract.authorizeReporter(reporter1.address))
        .to.emit(contract, "ReporterAuthorized")
        .withArgs(reporter1.address, admin.address);

      expect(await contract.isReporterAuthorized(reporter1.address)).to.be.true;
    });

    it("Should allow admin to revoke reporter authorization", async function () {
      await contract.authorizeReporter(reporter1.address);

      await expect(contract.revokeReporter(reporter1.address))
        .to.emit(contract, "ReporterRevoked")
        .withArgs(reporter1.address, admin.address);

      expect(await contract.isReporterAuthorized(reporter1.address)).to.be.false;
    });

    it("Should allow batch authorization of reporters", async function () {
      const reporters = [reporter1.address, reporter2.address];
      await contract.batchAuthorizeReporters(reporters);

      expect(await contract.isReporterAuthorized(reporter1.address)).to.be.true;
      expect(await contract.isReporterAuthorized(reporter2.address)).to.be.true;
    });

    it("Should skip zero addresses in batch authorization", async function () {
      const reporters = [reporter1.address, ethers.ZeroAddress, reporter2.address];
      await contract.batchAuthorizeReporters(reporters);

      expect(await contract.isReporterAuthorized(reporter1.address)).to.be.true;
      expect(await contract.isReporterAuthorized(reporter2.address)).to.be.true;
      expect(await contract.isReporterAuthorized(ethers.ZeroAddress)).to.be.false;
    });

    it("Should revert when non-admin tries to authorize reporter", async function () {
      await expect(
        contract.connect(reporter1).authorizeReporter(reporter2.address)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("Should revert when authorizing zero address", async function () {
      await expect(
        contract.authorizeReporter(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });
  });

  describe("Traffic Report Submission", function () {
    beforeEach(async function () {
      await contract.registerRegion(REGION_1);
      await contract.authorizeReporter(reporter1.address);
      await contract.authorizeReporter(reporter2.address);
    });

    it("Should allow authorized reporter to submit traffic report", async function () {
      const congestion = 50;
      const vehicles = 100;
      const speed = 60;

      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, congestion, vehicles, speed)
      ).to.emit(contract, "ReportSubmitted")
        .withArgs(reporter1.address, REGION_1, 1, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("Should update region statistics after report submission", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      const [totalReports, lastUpdate, hasData] = await contract.getRegionStats(REGION_1, 1);
      expect(totalReports).to.equal(1);
      expect(hasData).to.be.true;
      expect(lastUpdate).to.be.greaterThan(0);
    });

    it("Should allow multiple reporters for same region", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);
      await contract.connect(reporter2).submitTrafficReport(REGION_1, 60, 120, 55);

      const [totalReports] = await contract.getRegionStats(REGION_1, 1);
      expect(totalReports).to.equal(2);
    });

    it("Should track individual reporter status", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      expect(await contract.hasReported(REGION_1, reporter1.address, 1)).to.be.true;
      expect(await contract.hasReported(REGION_1, reporter2.address, 1)).to.be.false;
    });

    it("Should revert when reporter submits twice in same cycle", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 60, 120, 55)
      ).to.be.revertedWithCustomError(contract, "AlreadyReported");
    });

    it("Should revert when unauthorized reporter tries to submit", async function () {
      await expect(
        contract.connect(unauthorized).submitTrafficReport(REGION_1, 50, 100, 60)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("Should revert for invalid region", async function () {
      await expect(
        contract.connect(reporter1).submitTrafficReport("InvalidRegion", 50, 100, 60)
      ).to.be.revertedWithCustomError(contract, "InvalidRegion");
    });

    it("Should revert for congestion level > 100", async function () {
      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 101, 100, 60)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert for speed > 300", async function () {
      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 301)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert when contract is paused", async function () {
      await contract.pause();

      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60)
      ).to.be.revertedWithCustomError(contract, "ContractPaused");
    });

    it("Should accept boundary values", async function () {
      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 0, 0, 0)
      ).to.not.be.reverted;

      await expect(
        contract.connect(reporter2).submitTrafficReport(REGION_1, 100, 255, 300)
      ).to.not.be.reverted;
    });
  });

  describe("Cycle Management", function () {
    beforeEach(async function () {
      await contract.registerRegion(REGION_1);
      await contract.authorizeReporter(reporter1.address);
    });

    it("Should allow manual cycle finalization", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      await expect(contract.manuallyFinalizeCycle())
        .to.emit(contract, "CycleFinalized")
        .withArgs(1, 1, 1);

      const [, , , isFinalized] = await contract.getCycleAggregate(1);
      expect(isFinalized).to.be.true;
    });

    it("Should revert when finalizing already finalized cycle", async function () {
      await contract.manuallyFinalizeCycle();

      await expect(
        contract.manuallyFinalizeCycle()
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should force advance cycle", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      const cycleBefore = await contract.currentReportCycle();
      await contract.forceAdvanceCycle();
      const cycleAfter = await contract.currentReportCycle();

      expect(cycleAfter).to.equal(cycleBefore + 1n);
    });

    it("Should allow reporting in new cycle after advance", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);
      await contract.forceAdvanceCycle();

      await expect(
        contract.connect(reporter1).submitTrafficReport(REGION_1, 60, 120, 55)
      ).to.not.be.reverted;

      expect(await contract.hasReported(REGION_1, reporter1.address, 2)).to.be.true;
    });

    it("Should finalize cycle before advancing", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);
      await contract.forceAdvanceCycle();

      const [, , , isFinalized] = await contract.getCycleAggregate(1);
      expect(isFinalized).to.be.true;
    });
  });

  describe("Pausable Functionality", function () {
    it("Should allow pauser to pause contract", async function () {
      await expect(contract.pause())
        .to.emit(contract, "Paused")
        .withArgs(admin.address);

      expect(await contract.paused()).to.be.true;
    });

    it("Should allow pauser to unpause contract", async function () {
      await contract.pause();

      await expect(contract.unpause())
        .to.emit(contract, "Unpaused")
        .withArgs(admin.address);

      expect(await contract.paused()).to.be.false;
    });

    it("Should allow admin to add pauser", async function () {
      await expect(contract.addPauser(pauser.address))
        .to.emit(contract, "PauserAdded")
        .withArgs(pauser.address, admin.address);

      expect(await contract.pausers(pauser.address)).to.be.true;
    });

    it("Should allow admin to remove pauser", async function () {
      await contract.addPauser(pauser.address);

      await expect(contract.removePauser(pauser.address))
        .to.emit(contract, "PauserRemoved")
        .withArgs(pauser.address, admin.address);

      expect(await contract.pausers(pauser.address)).to.be.false;
    });

    it("Should allow added pauser to pause contract", async function () {
      await contract.addPauser(pauser.address);

      await expect(contract.connect(pauser).pause())
        .to.emit(contract, "Paused")
        .withArgs(pauser.address);
    });

    it("Should revert when unauthorized tries to pause", async function () {
      await expect(
        contract.connect(unauthorized).pause()
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("Should revert when adding zero address as pauser", async function () {
      await expect(
        contract.addPauser(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });
  });

  describe("Configuration", function () {
    it("Should allow admin to set cycle interval", async function () {
      const newInterval = 7200; // 2 hours
      await contract.setCycleInterval(newInterval);
      expect(await contract.cycleInterval()).to.equal(newInterval);
    });

    it("Should revert when setting interval < 5 minutes", async function () {
      await expect(
        contract.setCycleInterval(299)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should revert when setting interval > 24 hours", async function () {
      await expect(
        contract.setCycleInterval(86401)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should allow admin to set thresholds", async function () {
      await expect(contract.setThresholds(90, 150)).to.not.be.reverted;
    });

    it("Should revert when setting invalid congestion threshold", async function () {
      await expect(
        contract.setThresholds(101, 150)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await contract.registerRegion(REGION_1);
      await contract.registerRegion(REGION_2);
      await contract.authorizeReporter(reporter1.address);
    });

    it("Should return current cycle info", async function () {
      const [cycle, timeRemaining, totalRegions, isPaused] = await contract.getCurrentCycleInfo();

      expect(cycle).to.equal(1);
      expect(timeRemaining).to.be.greaterThan(0);
      expect(totalRegions).to.equal(2);
      expect(isPaused).to.be.false;
    });

    it("Should return region reporters", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);

      const reporters = await contract.getRegionReporters(REGION_1, 1);
      expect(reporters).to.include(reporter1.address);
      expect(reporters.length).to.equal(1);
    });

    it("Should return all registered regions", async function () {
      const regions = await contract.getRegisteredRegions();
      expect(regions.length).to.equal(2);
      expect(regions).to.include.members([REGION_1, REGION_2]);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin transfer", async function () {
      await expect(contract.transferAdmin(reporter1.address))
        .to.emit(contract, "AdminTransferred")
        .withArgs(admin.address, reporter1.address);

      expect(await contract.admin()).to.equal(reporter1.address);
    });

    it("Should revert when transferring to zero address", async function () {
      await expect(
        contract.transferAdmin(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "InvalidInput");
    });

    it("Should allow new admin to perform admin functions", async function () {
      await contract.transferAdmin(reporter1.address);

      await expect(
        contract.connect(reporter1).registerRegion(REGION_1)
      ).to.not.be.reverted;
    });

    it("Should prevent old admin from performing admin functions", async function () {
      await contract.transferAdmin(reporter1.address);

      await expect(
        contract.connect(admin).registerRegion(REGION_2)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow admin to emergency withdraw", async function () {
      // Send some ETH to contract
      await admin.sendTransaction({
        to: await contract.getAddress(),
        value: ethers.parseEther("1.0")
      });

      const balanceBefore = await ethers.provider.getBalance(admin.address);

      await expect(contract.emergencyWithdraw())
        .to.emit(contract, "EmergencyWithdraw");

      const balanceAfter = await ethers.provider.getBalance(admin.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);
    });

    it("Should handle emergency withdraw with zero balance", async function () {
      await expect(contract.emergencyWithdraw()).to.not.be.reverted;
    });
  });

  describe("Edge Cases", function () {
    beforeEach(async function () {
      await contract.registerRegion(REGION_1);
      await contract.authorizeReporter(reporter1.address);
    });

    it("Should handle finalization with no reports", async function () {
      await expect(contract.manuallyFinalizeCycle()).to.not.be.reverted;

      const [totalReports, totalRegions] = await contract.getCycleAggregate(1);
      expect(totalReports).to.equal(0);
      expect(totalRegions).to.equal(0);
    });

    it("Should handle multiple regions with varying reports", async function () {
      await contract.registerRegion(REGION_2);
      await contract.authorizeReporter(reporter2.address);

      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);
      await contract.connect(reporter2).submitTrafficReport(REGION_2, 60, 120, 55);

      await contract.manuallyFinalizeCycle();

      const [totalReports, totalRegions] = await contract.getCycleAggregate(1);
      expect(totalReports).to.equal(2);
      expect(totalRegions).to.equal(2);
    });

    it("Should maintain separate data per cycle", async function () {
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 50, 100, 60);
      await contract.forceAdvanceCycle();
      await contract.connect(reporter1).submitTrafficReport(REGION_1, 70, 150, 50);

      const [reports1] = await contract.getRegionStats(REGION_1, 1);
      const [reports2] = await contract.getRegionStats(REGION_1, 2);

      expect(reports1).to.equal(1);
      expect(reports2).to.equal(1);
    });
  });
});

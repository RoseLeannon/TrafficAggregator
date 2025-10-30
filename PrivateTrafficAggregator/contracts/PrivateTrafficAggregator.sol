// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint16, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract PrivateTrafficAggregator is SepoliaConfig {

    address public admin;
    uint256 public currentReportCycle;
    uint256 public cycleInterval = 3600; // 1 hour default
    uint256 public lastCycleTime;

    struct TrafficReport {
        euint8 congestionLevel;    // 0-100 (encrypted)
        euint8 vehicleCount;       // 0-255 (encrypted)
        euint16 averageSpeed;      // km/h (encrypted)
        uint256 timestamp;
        address reporter;
        bool isValid;
    }

    struct RegionData {
        uint256 totalReports;
        euint32 aggregatedCongestion;
        euint32 aggregatedVehicles;
        euint32 aggregatedSpeed;
        uint256 lastUpdate;
        address[] reporters;
        bool hasData;
    }

    struct CycleAggregate {
        uint256 totalReports;
        uint256 totalRegions;
        uint256 timestamp;
        bool isFinalized;
        mapping(string => bool) processedRegions;
    }

    mapping(uint256 => mapping(string => RegionData)) public regionData;
    mapping(uint256 => mapping(string => mapping(address => TrafficReport))) public reports;
    mapping(uint256 => CycleAggregate) public cycleAggregates;
    mapping(address => bool) public authorizedReporters;
    mapping(string => bool) public validRegions;

    string[] public registeredRegions;

    event ReportSubmitted(address indexed reporter, string region, uint256 cycle);
    event CycleFinalized(uint256 indexed cycle, uint256 totalReports);
    event RegionRegistered(string region);
    event ReporterAuthorized(address indexed reporter);
    event ReporterRevoked(address indexed reporter);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin allowed");
        _;
    }

    modifier onlyAuthorizedReporter() {
        require(authorizedReporters[msg.sender], "Not authorized reporter");
        _;
    }

    modifier validRegion(string memory region) {
        require(validRegions[region], "Invalid region");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentReportCycle = 1;
        lastCycleTime = block.timestamp;
        authorizedReporters[msg.sender] = true;
    }

    function registerRegion(string memory regionName) external onlyAdmin {
        require(!validRegions[regionName], "Region already registered");
        require(bytes(regionName).length > 0, "Region name cannot be empty");

        validRegions[regionName] = true;
        registeredRegions.push(regionName);

        emit RegionRegistered(regionName);
    }

    function authorizeReporter(address reporter) external onlyAdmin {
        require(reporter != address(0), "Invalid reporter address");
        authorizedReporters[reporter] = true;
        emit ReporterAuthorized(reporter);
    }

    function revokeReporter(address reporter) external onlyAdmin {
        authorizedReporters[reporter] = false;
        emit ReporterRevoked(reporter);
    }

    function submitTrafficReport(
        string memory region,
        uint8 congestionLevel,
        uint8 vehicleCount,
        uint16 averageSpeed
    ) external onlyAuthorizedReporter validRegion(region) {
        require(congestionLevel <= 100, "Congestion level must be 0-100");
        require(averageSpeed <= 300, "Speed limit exceeded");
        require(!reports[currentReportCycle][region][msg.sender].isValid, "Already reported this cycle");

        // Check if cycle should advance
        if (block.timestamp >= lastCycleTime + cycleInterval) {
            _finalizeCycle();
            _advanceCycle();
        }

        // Encrypt the traffic data
        euint8 encCongestion = FHE.asEuint8(congestionLevel);
        euint8 encVehicles = FHE.asEuint8(vehicleCount);
        euint16 encSpeed = FHE.asEuint16(averageSpeed);

        // Store the report
        reports[currentReportCycle][region][msg.sender] = TrafficReport({
            congestionLevel: encCongestion,
            vehicleCount: encVehicles,
            averageSpeed: encSpeed,
            timestamp: block.timestamp,
            reporter: msg.sender,
            isValid: true
        });

        // Update region aggregates
        RegionData storage regionStats = regionData[currentReportCycle][region];

        if (!regionStats.hasData) {
            regionStats.aggregatedCongestion = FHE.asEuint32(uint32(congestionLevel));
            regionStats.aggregatedVehicles = FHE.asEuint32(uint32(vehicleCount));
            regionStats.aggregatedSpeed = FHE.asEuint32(uint32(averageSpeed));
            regionStats.hasData = true;
        } else {
            regionStats.aggregatedCongestion = FHE.add(
                regionStats.aggregatedCongestion,
                FHE.asEuint32(uint32(congestionLevel))
            );
            regionStats.aggregatedVehicles = FHE.add(
                regionStats.aggregatedVehicles,
                FHE.asEuint32(uint32(vehicleCount))
            );
            regionStats.aggregatedSpeed = FHE.add(
                regionStats.aggregatedSpeed,
                FHE.asEuint32(uint32(averageSpeed))
            );
        }

        regionStats.totalReports++;
        regionStats.lastUpdate = block.timestamp;
        regionStats.reporters.push(msg.sender);

        // Set ACL permissions
        FHE.allowThis(encCongestion);
        FHE.allowThis(encVehicles);
        FHE.allowThis(encSpeed);
        FHE.allowThis(regionStats.aggregatedCongestion);
        FHE.allowThis(regionStats.aggregatedVehicles);
        FHE.allowThis(regionStats.aggregatedSpeed);

        emit ReportSubmitted(msg.sender, region, currentReportCycle);
    }

    function _finalizeCycle() internal {
        if (cycleAggregates[currentReportCycle].isFinalized) return;

        uint256 totalGlobalReports = 0;
        uint256 activeRegions = 0;

        // Count total reports and active regions for this cycle
        for (uint i = 0; i < registeredRegions.length; i++) {
            string memory region = registeredRegions[i];
            RegionData storage regionStats = regionData[currentReportCycle][region];

            if (regionStats.hasData && regionStats.totalReports > 0) {
                totalGlobalReports += regionStats.totalReports;
                activeRegions++;
            }
        }

        cycleAggregates[currentReportCycle].totalReports = totalGlobalReports;
        cycleAggregates[currentReportCycle].totalRegions = activeRegions;
        cycleAggregates[currentReportCycle].timestamp = block.timestamp;
        cycleAggregates[currentReportCycle].isFinalized = true;

        emit CycleFinalized(currentReportCycle, totalGlobalReports);
    }

    function _advanceCycle() internal {
        currentReportCycle++;
        lastCycleTime = block.timestamp;
    }

    function manuallyFinalizeCycle() external onlyAdmin {
        require(!cycleAggregates[currentReportCycle].isFinalized, "Cycle already finalized");
        _finalizeCycle();
    }

    function forceAdvanceCycle() external onlyAdmin {
        _finalizeCycle();
        _advanceCycle();
    }

    function setCycleInterval(uint256 newInterval) external onlyAdmin {
        require(newInterval >= 300, "Minimum 5 minutes");
        require(newInterval <= 86400, "Maximum 24 hours");
        cycleInterval = newInterval;
    }

    function getCurrentCycleInfo() external view returns (
        uint256 cycle,
        uint256 timeRemaining,
        uint256 totalRegions
    ) {
        uint256 elapsed = block.timestamp - lastCycleTime;
        uint256 remaining = elapsed >= cycleInterval ? 0 : cycleInterval - elapsed;

        return (
            currentReportCycle,
            remaining,
            registeredRegions.length
        );
    }

    function getRegionStats(string memory region, uint256 cycle) external view returns (
        uint256 totalReports,
        uint256 lastUpdate,
        bool hasData
    ) {
        RegionData storage regionStats = regionData[cycle][region];
        return (
            regionStats.totalReports,
            regionStats.lastUpdate,
            regionStats.hasData
        );
    }

    function getCycleAggregate(uint256 cycle) external view returns (
        uint256 totalReports,
        uint256 totalRegions,
        uint256 timestamp,
        bool isFinalized
    ) {
        CycleAggregate storage aggregate = cycleAggregates[cycle];
        return (
            aggregate.totalReports,
            aggregate.totalRegions,
            aggregate.timestamp,
            aggregate.isFinalized
        );
    }

    function hasReported(string memory region, address reporter, uint256 cycle) external view returns (bool) {
        return reports[cycle][region][reporter].isValid;
    }

    function getRegisteredRegions() external view returns (string[] memory) {
        return registeredRegions;
    }

    function getRegionReporters(string memory region, uint256 cycle) external view returns (address[] memory) {
        return regionData[cycle][region].reporters;
    }

    function isReporterAuthorized(address reporter) external view returns (bool) {
        return authorizedReporters[reporter];
    }

    function getReportTimestamp(string memory region, address reporter, uint256 cycle) external view returns (uint256) {
        return reports[cycle][region][reporter].timestamp;
    }

    // Emergency functions
    function emergencyPause() external onlyAdmin {
        // In a production system, this would pause contract operations
        // For now, we just emit an event
    }

    function emergencyWithdraw() external onlyAdmin {
        // In case any ETH gets stuck in the contract
        payable(admin).transfer(address(this).balance);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid admin address");
        admin = newAdmin;
    }
}
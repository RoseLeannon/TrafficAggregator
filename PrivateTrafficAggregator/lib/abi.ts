export const TRAFFIC_AGGREGATOR_ABI = [
  "function submitTrafficReport(string memory region, uint8 congestionLevel, uint8 vehicleCount, uint16 averageSpeed) external",
  "function registerRegion(string memory regionName) external",
  "function authorizeReporter(address reporter) external",
  "function revokeReporter(address reporter) external",
  "function setCycleInterval(uint256 newInterval) external",
  "function getCurrentCycleInfo() external view returns (uint256, uint256, uint256)",
  "function getRegisteredRegions() external view returns (string[] memory)",
  "function getRegionStats(string memory region, uint256 cycle) external view returns (uint256, uint256, bool)",
  "function getCycleAggregate(uint256 cycle) external view returns (uint256, uint256, uint256, bool)",
  "function hasReported(string memory region, address reporter, uint256 cycle) external view returns (bool)",
  "function getRegionReporters(string memory region, uint256 cycle) external view returns (address[] memory)",
  "function isReporterAuthorized(address reporter) external view returns (bool)",
  "function getReportTimestamp(string memory region, address reporter, uint256 cycle) external view returns (uint256)",
  "function manuallyFinalizeCycle() external",
  "function forceAdvanceCycle() external",
  "function transferAdmin(address newAdmin) external",
  "function admin() external view returns (address)"
];

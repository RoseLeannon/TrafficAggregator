import { BigNumberish } from 'ethers';

export interface CycleInfo {
  currentCycle: number;
  timeRemaining: number;
  cycleStartTime: number;
}

export interface RegionStats {
  reportCount: number;
  lastUpdate: number;
  isActive: boolean;
}

export interface CycleAggregate {
  totalReports: number;
  totalRegions: number;
  timestamp: number;
  isFinalized: boolean;
}

export interface TrafficReport {
  region: string;
  congestionLevel: number;
  vehicleCount: number;
  averageSpeed: number;
}

export interface NetworkConfig {
  contractAddress: string;
  networkName: string;
  chainId: number;
  rpcUrl: string;
}

export interface ConnectionStatus {
  connected: boolean;
  account?: string;
  message?: string;
}

export interface MessageType {
  text: string;
  type: 'success' | 'error' | 'info';
  timestamp: number;
}

export interface ContractMethods {
  submitTrafficReport: (
    region: string,
    congestionLevel: number,
    vehicleCount: number,
    averageSpeed: number
  ) => Promise<any>;
  registerRegion: (regionName: string) => Promise<any>;
  authorizeReporter: (reporter: string) => Promise<any>;
  revokeReporter: (reporter: string) => Promise<any>;
  setCycleInterval: (newInterval: BigNumberish) => Promise<any>;
  getCurrentCycleInfo: () => Promise<[BigNumberish, BigNumberish, BigNumberish]>;
  getRegisteredRegions: () => Promise<string[]>;
  getRegionStats: (region: string, cycle: BigNumberish) => Promise<[BigNumberish, BigNumberish, boolean]>;
  getCycleAggregate: (cycle: BigNumberish) => Promise<[BigNumberish, BigNumberish, BigNumberish, boolean]>;
  hasReported: (region: string, reporter: string, cycle: BigNumberish) => Promise<boolean>;
  getRegionReporters: (region: string, cycle: BigNumberish) => Promise<string[]>;
  isReporterAuthorized: (reporter: string) => Promise<boolean>;
  getReportTimestamp: (region: string, reporter: string, cycle: BigNumberish) => Promise<BigNumberish>;
  manuallyFinalizeCycle: () => Promise<any>;
  forceAdvanceCycle: () => Promise<any>;
  transferAdmin: (newAdmin: string) => Promise<any>;
  admin: () => Promise<string>;
}

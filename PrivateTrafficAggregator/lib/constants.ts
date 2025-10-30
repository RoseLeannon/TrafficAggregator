import { NetworkConfig } from '@/types';

export const CONTRACT_CONFIG: NetworkConfig = {
  contractAddress: "0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC",
  networkName: "FHEVM Devnet",
  chainId: 8009,
  rpcUrl: "https://devnet.zama.ai/"
};

export const DEFAULT_REGIONS = [
  "Downtown",
  "Highway-A1",
  "Highway-A2",
  "Industrial District",
  "Residential Area",
  "Shopping Center",
  "Airport Road",
  "City Center",
  "Business District",
  "Suburban Area"
];

export const CONGESTION_LEVELS = {
  LOW: 0,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90
} as const;

export const DEFAULT_VALUES = {
  CONGESTION_LEVEL: 50,
  VEHICLE_COUNT: 20,
  AVERAGE_SPEED: 60
} as const;

export const VALIDATION_LIMITS = {
  MIN_CONGESTION: 0,
  MAX_CONGESTION: 100,
  MIN_VEHICLE_COUNT: 0,
  MAX_VEHICLE_COUNT: 255,
  MIN_SPEED: 0,
  MAX_SPEED: 300,
  MIN_CYCLE_INTERVAL: 300,
  MAX_CYCLE_INTERVAL: 86400
} as const;

export const UPDATE_INTERVALS = {
  CYCLE_INFO: 30000, // 30 seconds
  REGION_DATA: 60000 // 1 minute
} as const;

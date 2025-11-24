# PrivateTrafficAggregator - API Documentation

## Smart Contract Functions

### Core Report Submission Functions

#### `submitTrafficReport()`

Submit plaintext traffic report (automatically encrypted).

```solidity
function submitTrafficReport(
    string memory region,
    uint8 congestionLevel,
    uint8 vehicleCount,
    uint16 averageSpeed
) external onlyAuthorizedReporter validRegion(region)
```

**Parameters:**
- `region` (string): Target region for the report
- `congestionLevel` (uint8): Traffic congestion level (0-100)
- `vehicleCount` (uint8): Number of vehicles counted (0-255)
- `averageSpeed` (uint16): Average vehicle speed in km/h (0-300)

**Events Emitted:**
- `ReportSubmitted(address indexed reporter, string region, uint256 cycle, uint256 timestamp)`

**Requirements:**
- Caller must be authorized reporter
- Region must be registered
- Values within valid ranges
- Not already reported this cycle

**Example:**
```javascript
await contract.submitTrafficReport(
    "Downtown-A",
    75,    // 75% congestion
    120,   // 120 vehicles
    45     // 45 km/h average
);
```

---

#### `submitEncryptedTrafficReport()`

Submit pre-encrypted traffic report with input proofs.

```solidity
function submitEncryptedTrafficReport(
    string memory region,
    externalEuint8 encCongestion,
    externalEuint8 encVehicles,
    externalEuint16 encSpeed,
    bytes calldata congestionProof,
    bytes calldata vehiclesProof,
    bytes calldata speedProof
) external onlyAuthorizedReporter validRegion(region)
```

**Parameters:**
- `region` (string): Target region
- `encCongestion` (externalEuint8): Encrypted congestion level
- `encVehicles` (externalEuint8): Encrypted vehicle count
- `encSpeed` (externalEuint16): Encrypted average speed
- `congestionProof` (bytes): Input proof for congestion
- `vehiclesProof` (bytes): Input proof for vehicles
- `speedProof` (bytes): Input proof for speed

**Events Emitted:**
- `ReportSubmitted(address indexed reporter, string region, uint256 cycle, uint256 timestamp)`

**Requirements:**
- Valid FHE input proofs
- Authorized reporter
- Valid region
- Not already reported this cycle

**Example:**
```javascript
const fheClient = await initFHE();
const congestionInput = fheClient.encrypt_uint8(75);
const vehiclesInput = fheClient.encrypt_uint8(120);
const speedInput = fheClient.encrypt_uint16(45);

await contract.submitEncryptedTrafficReport(
    "Downtown-A",
    congestionInput.handle,
    vehiclesInput.handle,
    speedInput.handle,
    congestionInput.proof,
    vehiclesInput.proof,
    speedInput.proof
);
```

---

### Gateway Callback Pattern - Decryption

#### `requestRegionDecryption()`

Request decryption of aggregated region data via Gateway.

```solidity
function requestRegionDecryption(string memory region, uint256 cycle)
    external
    validRegion(region)
    returns (uint256 requestId)
```

**Parameters:**
- `region` (string): Region to decrypt
- `cycle` (uint256): Cycle number

**Returns:**
- `requestId` (uint256): Unique decryption request identifier

**Events Emitted:**
- `DecryptionRequested(string region, uint256 cycle, uint256 requestId, uint256 timestamp)`

**Requirements:**
- Region has data for specified cycle
- Decryption not already requested
- Cycle is not a future cycle
- If previous request exists, timeout must have passed

**Example:**
```javascript
const currentCycle = await contract.currentReportCycle();
const requestId = await contract.requestRegionDecryption("Downtown-A", currentCycle);

// Listen for completion
contract.on("DecryptionCompleted", (region, cycle, congestion, vehicles, speed) => {
    console.log(`Decrypted data for ${region}:`, {
        congestion, vehicles, speed
    });
});
```

---

#### `fulfillRegionDecryption()`

Gateway callback to fulfill decryption request (Called by Gateway only).

```solidity
function fulfillRegionDecryption(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId` (uint256): The decryption request ID
- `cleartexts` (bytes): ABI-encoded decrypted values
- `decryptionProof` (bytes): Cryptographic proof from Gateway

**Events Emitted:**
- `DecryptionCompleted(string region, uint256 cycle, uint32 congestion, uint32 vehicles, uint32 speed)`

**Requirements:**
- Valid Gateway signatures (`FHE.checkSignatures`)
- Callback not too late (within MAX_CALLBACK_DELAY)
- Not already completed

---

### Refund Mechanism

#### `requestDecryptionRefund()`

Request refund for failed/stuck decryption.

```solidity
function requestDecryptionRefund(string memory region, uint256 cycle)
    external
    validRegion(region)
    returns (uint256 refundId)
```

**Parameters:**
- `region` (string): Region with failed decryption
- `cycle` (uint256): Cycle number

**Returns:**
- `refundId` (uint256): Unique refund request identifier

**Events Emitted:**
- `RefundRequested(uint256 indexed requestId, address indexed requester, string region, uint256 cycle)`

**Requirements:**
- Decryption was requested
- Decryption has not completed
- Timeout exceeded (30 minutes)
- Caller participated in this region/cycle

**Example:**
```javascript
const refundId = await contract.requestDecryptionRefund("Downtown-A", 1);
// Wait for admin approval
```

---

#### `processRefundRequest()`

Process refund requests (Admin only).

```solidity
function processRefundRequest(uint256 refundId, bool approve)
    external
    onlyAdmin
```

**Parameters:**
- `refundId` (uint256): The refund request ID
- `approve` (bool): Whether to approve the refund

**Events Emitted:**
- `RefundProcessed(uint256 indexed requestId, address indexed recipient, bool approved)`

**Requirements:**
- Caller is admin
- Refund not already processed

**Example:**
```javascript
await contract.processRefundRequest(1, true); // Approve
```

---

#### `claimRefund()`

Claim accumulated approved refunds.

```solidity
function claimRefund() external noReentrancy
```

**Events Emitted:**
- `RefundClaimed(address indexed recipient, uint256 amount)`

**Requirements:**
- Caller has pending refunds

**Example:**
```javascript
const pendingRefunds = await contract.pendingRefunds(userAddress);
if (pendingRefunds > 0) {
    await contract.claimRefund();
}
```

---

### Privacy-Preserving Calculations

#### `getPrivacyPreservingAverage()`

Calculate privacy-preserving average using random multiplier technique.

```solidity
function getPrivacyPreservingAverage(string memory region, uint256 cycle)
    external
    view
    validRegion(region)
    returns (uint256 avgCongestion, uint256 avgVehicles, uint256 avgSpeed)
```

**Parameters:**
- `region` (string): Region to calculate average for
- `cycle` (uint256): Cycle number

**Returns:**
- `avgCongestion` (uint256): Obfuscated average congestion
- `avgVehicles` (uint256): Obfuscated average vehicle count
- `avgSpeed` (uint256): Obfuscated average speed

**Requirements:**
- Data has been decrypted
- Region has reports

**Privacy Technique:**
Uses deterministic but unpredictable multiplier to obfuscate exact values while preserving ratios.

**Example:**
```javascript
const [avgCongestion, avgVehicles, avgSpeed] =
    await contract.getPrivacyPreservingAverage("Downtown-A", 1);

console.log(`Average Congestion: ${avgCongestion}%`);
console.log(`Average Vehicles: ${avgVehicles}`);
console.log(`Average Speed: ${avgSpeed} km/h`);
```

---

### Region & Reporter Management

#### `registerRegion()`

Register a new traffic monitoring region (Admin only).

```solidity
function registerRegion(string memory regionName) external onlyAdmin
```

**Parameters:**
- `regionName` (string): Name of the region (1-64 characters)

**Events Emitted:**
- `RegionRegistered(string region)`

**Requirements:**
- Caller is admin
- Region not already registered
- Valid name length

**Example:**
```javascript
await contract.registerRegion("Downtown-A");
await contract.registerRegion("Highway-101");
```

---

#### `authorizeReporter()`

Authorize a new traffic data reporter (Admin only).

```solidity
function authorizeReporter(address reporter) external onlyAdmin
```

**Parameters:**
- `reporter` (address): Address to authorize

**Events Emitted:**
- `ReporterAuthorized(address indexed reporter)`

**Requirements:**
- Caller is admin
- Valid address (not zero)
- Not already authorized

**Example:**
```javascript
await contract.authorizeReporter("0x1234...");
```

---

#### `revokeReporter()`

Revoke reporter authorization (Admin only).

```solidity
function revokeReporter(address reporter) external onlyAdmin
```

**Parameters:**
- `reporter` (address): Address to revoke

**Events Emitted:**
- `ReporterRevoked(address indexed reporter)`

**Requirements:**
- Caller is admin
- Reporter currently authorized

**Example:**
```javascript
await contract.revokeReporter("0x1234...");
```

---

### Cycle Management

#### `manuallyFinalizeCycle()`

Manually finalize the current reporting cycle (Admin only).

```solidity
function manuallyFinalizeCycle() external onlyAdmin
```

**Events Emitted:**
- `CycleFinalized(uint256 indexed cycle, uint256 totalReports)`

**Requirements:**
- Caller is admin
- Cycle not already finalized

**Example:**
```javascript
await contract.manuallyFinalizeCycle();
```

---

#### `forceAdvanceCycle()`

Force advance to next cycle (Admin only).

```solidity
function forceAdvanceCycle() external onlyAdmin
```

**Events Emitted:**
- `CycleFinalized(uint256 indexed cycle, uint256 totalReports)`
- `EmergencyAction(string action, address indexed admin, uint256 timestamp)`

**Requirements:**
- Caller is admin

**Example:**
```javascript
await contract.forceAdvanceCycle();
```

---

#### `setCycleInterval()`

Set the cycle interval duration (Admin only).

```solidity
function setCycleInterval(uint256 newInterval) external onlyAdmin
```

**Parameters:**
- `newInterval` (uint256): New interval in seconds (300-86400)

**Events Emitted:**
- `SecurityAlert(string alertType, address indexed actor, string details)`

**Requirements:**
- Caller is admin
- Interval between 5 minutes and 24 hours

**Example:**
```javascript
await contract.setCycleInterval(7200); // 2 hours
```

---

### View Functions

#### `getCurrentCycleInfo()`

Get current cycle information.

```solidity
function getCurrentCycleInfo() external view returns (
    uint256 cycle,
    uint256 timeRemaining,
    uint256 totalRegions
)
```

**Returns:**
- `cycle` (uint256): Current cycle number
- `timeRemaining` (uint256): Seconds until cycle ends
- `totalRegions` (uint256): Number of registered regions

**Example:**
```javascript
const [cycle, timeRemaining, totalRegions] = await contract.getCurrentCycleInfo();
console.log(`Cycle ${cycle}, ${timeRemaining}s remaining, ${totalRegions} regions`);
```

---

#### `getRegionStats()`

Get statistics for a specific region and cycle.

```solidity
function getRegionStats(string memory region, uint256 cycle) external view returns (
    uint256 totalReports,
    uint256 lastUpdate,
    bool hasData,
    bool decryptionRequested,
    bool decryptionCompleted
)
```

**Parameters:**
- `region` (string): Region name
- `cycle` (uint256): Cycle number

**Returns:**
- `totalReports` (uint256): Number of reports
- `lastUpdate` (uint256): Last update timestamp
- `hasData` (bool): Whether region has data
- `decryptionRequested` (bool): Decryption request status
- `decryptionCompleted` (bool): Decryption completion status

**Example:**
```javascript
const stats = await contract.getRegionStats("Downtown-A", 1);
console.log(`Total Reports: ${stats.totalReports}`);
console.log(`Decryption Status: ${stats.decryptionCompleted ? 'Complete' : 'Pending'}`);
```

---

#### `getDecryptedRegionData()`

Get decrypted region data (after decryption completes).

```solidity
function getDecryptedRegionData(string memory region, uint256 cycle)
    external
    view
    returns (
        uint32 congestion,
        uint32 vehicles,
        uint32 speed,
        bool isRevealed
    )
```

**Parameters:**
- `region` (string): Region name
- `cycle` (uint256): Cycle number

**Returns:**
- `congestion` (uint32): Total congestion aggregate
- `vehicles` (uint32): Total vehicle count aggregate
- `speed` (uint32): Total speed aggregate
- `isRevealed` (bool): Whether data has been decrypted

**Example:**
```javascript
const data = await contract.getDecryptedRegionData("Downtown-A", 1);
if (data.isRevealed) {
    console.log(`Aggregated congestion: ${data.congestion}`);
}
```

---

#### `getCycleAggregate()`

Get cycle-wide aggregate statistics.

```solidity
function getCycleAggregate(uint256 cycle) external view returns (
    uint256 totalReports,
    uint256 totalRegions,
    uint256 timestamp,
    bool isFinalized
)
```

**Parameters:**
- `cycle` (uint256): Cycle number

**Returns:**
- `totalReports` (uint256): Total reports across all regions
- `totalRegions` (uint256): Number of active regions
- `timestamp` (uint256): Finalization timestamp
- `isFinalized` (bool): Whether cycle is finalized

**Example:**
```javascript
const aggregate = await contract.getCycleAggregate(1);
console.log(`Cycle 1: ${aggregate.totalReports} reports from ${aggregate.totalRegions} regions`);
```

---

#### `getDecryptionStatus()`

Get detailed decryption status for a region.

```solidity
function getDecryptionStatus(string memory region, uint256 cycle)
    external
    view
    returns (
        bool requested,
        bool completed,
        uint256 requestId,
        uint256 requestTime,
        bool timedOut
    )
```

**Parameters:**
- `region` (string): Region name
- `cycle` (uint256): Cycle number

**Returns:**
- `requested` (bool): Whether decryption was requested
- `completed` (bool): Whether decryption completed
- `requestId` (uint256): Request identifier
- `requestTime` (uint256): Request timestamp
- `timedOut` (bool): Whether timeout occurred

**Example:**
```javascript
const status = await contract.getDecryptionStatus("Downtown-A", 1);
if (status.timedOut && !status.completed) {
    console.log("Decryption timed out - eligible for refund");
    await contract.requestDecryptionRefund("Downtown-A", 1);
}
```

---

#### `getRegisteredRegions()`

Get list of all registered regions.

```solidity
function getRegisteredRegions() external view returns (string[] memory)
```

**Returns:**
- `string[]`: Array of region names

**Example:**
```javascript
const regions = await contract.getRegisteredRegions();
console.log(`Registered regions:`, regions);
```

---

#### `hasReported()`

Check if a reporter has submitted a report.

```solidity
function hasReported(string memory region, address reporter, uint256 cycle)
    external view returns (bool)
```

**Parameters:**
- `region` (string): Region name
- `reporter` (address): Reporter address
- `cycle` (uint256): Cycle number

**Returns:**
- `bool`: true if reporter has submitted

**Example:**
```javascript
const reported = await contract.hasReported("Downtown-A", userAddress, 1);
if (!reported) {
    // Can submit report
}
```

---

#### `isReporterAuthorized()`

Check if an address is an authorized reporter.

```solidity
function isReporterAuthorized(address reporter) external view returns (bool)
```

**Parameters:**
- `reporter` (address): Address to check

**Returns:**
- `bool`: true if authorized

**Example:**
```javascript
const isAuthorized = await contract.isReporterAuthorized(userAddress);
```

---

#### `getRefundRequestInfo()`

Get information about a refund request.

```solidity
function getRefundRequestInfo(uint256 refundId)
    external
    view
    returns (
        address requester,
        string memory region,
        uint256 cycle,
        uint256 requestTime,
        bool processed,
        bool approved
    )
```

**Parameters:**
- `refundId` (uint256): Refund request ID

**Returns:**
- `requester` (address): Address that requested refund
- `region` (string): Region name
- `cycle` (uint256): Cycle number
- `requestTime` (uint256): Request timestamp
- `processed` (bool): Whether admin has processed
- `approved` (bool): Whether refund was approved

**Example:**
```javascript
const refundInfo = await contract.getRefundRequestInfo(1);
if (refundInfo.approved && !refundInfo.processed) {
    await contract.claimRefund();
}
```

---

### Emergency Functions (Admin Only)

#### `emergencyPause()`

Emergency pause mechanism.

```solidity
function emergencyPause() external onlyAdmin
```

**Events Emitted:**
- `EmergencyAction(string action, address indexed admin, uint256 timestamp)`
- `SecurityAlert(string alertType, address indexed actor, string details)`

**Requirements:**
- Caller is admin

**Example:**
```javascript
await contract.emergencyPause();
```

---

#### `emergencyWithdraw()`

Emergency withdrawal of stuck funds.

```solidity
function emergencyWithdraw() external onlyAdmin noReentrancy
```

**Events Emitted:**
- `EmergencyAction(string action, address indexed admin, uint256 timestamp)`

**Requirements:**
- Caller is admin
- Contract has balance

**Example:**
```javascript
await contract.emergencyWithdraw();
```

---

#### `transferAdmin()`

Transfer admin role to new address.

```solidity
function transferAdmin(address newAdmin) external onlyAdmin
```

**Parameters:**
- `newAdmin` (address): New admin address

**Events Emitted:**
- `SecurityAlert(string alertType, address indexed actor, string details)`

**Requirements:**
- Caller is admin
- Valid new admin address (not zero, not current)

**Example:**
```javascript
await contract.transferAdmin("0x5678...");
```

---

#### `forceTimeoutResolution()`

Force timeout resolution for stuck decryption.

```solidity
function forceTimeoutResolution(string memory region, uint256 cycle)
    external
    onlyAdmin
```

**Parameters:**
- `region` (string): Region with stuck decryption
- `cycle` (uint256): Cycle number

**Events Emitted:**
- `DecryptionTimeout(string region, uint256 cycle, uint256 requestId)`
- `EmergencyAction(string action, address indexed admin, uint256 timestamp)`

**Requirements:**
- Caller is admin
- Decryption requested but not completed
- Timeout period exceeded

**Example:**
```javascript
await contract.forceTimeoutResolution("Downtown-A", 1);
```

---

## Events Reference

### ReportSubmitted
```solidity
event ReportSubmitted(
    address indexed reporter,
    string region,
    uint256 cycle,
    uint256 timestamp
);
```

### CycleFinalized
```solidity
event CycleFinalized(
    uint256 indexed cycle,
    uint256 totalReports
);
```

### RegionRegistered
```solidity
event RegionRegistered(string region);
```

### ReporterAuthorized
```solidity
event ReporterAuthorized(address indexed reporter);
```

### ReporterRevoked
```solidity
event ReporterRevoked(address indexed reporter);
```

### DecryptionRequested
```solidity
event DecryptionRequested(
    string region,
    uint256 cycle,
    uint256 requestId,
    uint256 timestamp
);
```

### DecryptionCompleted
```solidity
event DecryptionCompleted(
    string region,
    uint256 cycle,
    uint32 congestion,
    uint32 vehicles,
    uint32 speed
);
```

### DecryptionTimeout
```solidity
event DecryptionTimeout(
    string region,
    uint256 cycle,
    uint256 requestId
);
```

### RefundRequested
```solidity
event RefundRequested(
    uint256 indexed requestId,
    address indexed requester,
    string region,
    uint256 cycle
);
```

### RefundProcessed
```solidity
event RefundProcessed(
    uint256 indexed requestId,
    address indexed recipient,
    bool approved
);
```

### RefundClaimed
```solidity
event RefundClaimed(
    address indexed recipient,
    uint256 amount
);
```

### SecurityAlert
```solidity
event SecurityAlert(
    string alertType,
    address indexed actor,
    string details
);
```

### EmergencyAction
```solidity
event EmergencyAction(
    string action,
    address indexed admin,
    uint256 timestamp
);
```

---

## Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "ACCESS_DENIED: Admin only" | Non-admin calling admin function | Use admin account |
| "ACCESS_DENIED: Not authorized reporter" | Unauthorized reporter | Get authorization first |
| "INVALID_REGION: Region not registered" | Invalid region name | Use registered region |
| "ALREADY_REPORTED: Already submitted for this cycle" | Duplicate submission | Wait for next cycle |
| "INVALID_INPUT: Congestion exceeds max" | Congestion > 100 | Use value 0-100 |
| "INVALID_INPUT: Speed exceeds limit" | Speed > 300 | Use value 0-300 |
| "NO_DATA: No data for this region/cycle" | Empty region data | Submit reports first |
| "ALREADY_REQUESTED: Decryption already requested" | Duplicate request | Wait for completion |
| "TIMEOUT_NOT_REACHED: Previous request still pending" | Too soon to retry | Wait for timeout |
| "ALREADY_COMPLETED: Already processed" | Duplicate callback | Already completed |
| "TIMEOUT_EXCEEDED: Callback too late" | Gateway too slow | Request refund |
| "NOT_PARTICIPANT: Did not contribute" | Non-reporter refund request | Must have reported |
| "REENTRANCY_DETECTED: Function locked" | Reentrancy attempt | Wait for completion |
| "OVERFLOW_PROTECTION: Max reached" | Counter overflow | System limit reached |

---

## Constants

```solidity
// Timeout protection
uint256 public constant DECRYPTION_TIMEOUT = 30 minutes;
uint256 public constant MAX_CALLBACK_DELAY = 1 hours;

// Security limits
uint256 public constant MAX_CONGESTION = 100;
uint256 public constant MAX_SPEED = 300; // km/h
uint256 public constant MIN_CYCLE_INTERVAL = 300; // 5 minutes
uint256 public constant MAX_CYCLE_INTERVAL = 86400; // 24 hours

// Privacy protection
uint256 private constant PRIVACY_MULTIPLIER_MIN = 1000;
uint256 private constant PRIVACY_MULTIPLIER_MAX = 10000;
```

---

## Complete Integration Example

```javascript
import { initFheInstance } from './utils/fheInstance';
import { ethers } from 'ethers';

// Setup
const contract = new ethers.Contract(contractAddress, abi, signer);

// 1. Admin: Register region
async function setupRegion() {
    await contract.registerRegion("Downtown-A");
    await contract.authorizeReporter(reporterAddress);
}

// 2. Reporter: Submit data
async function submitReport() {
    await contract.submitTrafficReport(
        "Downtown-A",
        75,   // congestion
        120,  // vehicles
        45    // speed km/h
    );
}

// 3. Monitor and request decryption
async function monitorAndDecrypt() {
    const currentCycle = await contract.currentReportCycle();
    const stats = await contract.getRegionStats("Downtown-A", currentCycle);

    if (stats.totalReports >= 10) {
        // Request decryption
        const requestId = await contract.requestRegionDecryption(
            "Downtown-A",
            currentCycle
        );

        // Listen for completion
        contract.on("DecryptionCompleted", async (region, cycle, data) => {
            console.log(`Region ${region} decrypted:`, data);

            // Get privacy-preserving averages
            const [avgCong, avgVeh, avgSpeed] =
                await contract.getPrivacyPreservingAverage(region, cycle);

            console.log(`Averages: ${avgCong}%, ${avgVeh} vehicles, ${avgSpeed} km/h`);
        });
    }
}

// 4. Handle timeout and refunds
async function handleTimeout() {
    const status = await contract.getDecryptionStatus("Downtown-A", 1);

    if (status.timedOut && !status.completed) {
        // Request refund
        const refundId = await contract.requestDecryptionRefund("Downtown-A", 1);

        // Admin approves
        await contract.processRefundRequest(refundId, true);

        // User claims
        await contract.claimRefund();
    }
}

// 5. Query and display data
async function queryData() {
    const regions = await contract.getRegisteredRegions();

    for (const region of regions) {
        const currentCycle = await contract.currentReportCycle();
        const stats = await contract.getRegionStats(region, currentCycle);

        console.log(`${region}: ${stats.totalReports} reports`);

        if (stats.decryptionCompleted) {
            const data = await contract.getDecryptedRegionData(region, currentCycle);
            console.log(`  Aggregated: ${data.congestion}, ${data.vehicles}, ${data.speed}`);
        }
    }
}
```

---

## Gas Cost Estimates

| Function | Gas (Approx) | HCU Cost | Notes |
|----------|--------------|----------|-------|
| `registerRegion()` | ~50,000 | 0 | Storage write |
| `authorizeReporter()` | ~45,000 | 0 | Mapping update |
| `submitTrafficReport()` | ~150,000 | 9 HCU | 3 encryptions + 3 additions |
| `submitEncryptedTrafficReport()` | ~120,000 | 6 HCU | 3 additions only |
| `requestRegionDecryption()` | ~80,000 | 3 HCU | 3 toBytes32 |
| `fulfillRegionDecryption()` | ~100,000 | 1 HCU | Signature verification |
| `getPrivacyPreservingAverage()` | ~30,000 | 0 | View function |

*HCU costs are approximate and may vary based on network*

---

**Version**: 2.0.0
**Last Updated**: 2025-11-24
**License**: MIT

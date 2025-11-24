# API Documentation

## Smart Contract Functions

### Core Trading Functions

#### `createTrade()`

Creates a new trading market with encrypted positions.

```solidity
function createTrade(
    string memory tradeId,
    uint256 duration,
    uint256 tradeStake
) external payable notBlacklisted nonReentrant
```

**Parameters:**
- `tradeId` (string): Unique identifier for the trade
- `duration` (uint256): Market duration in seconds (5 min - 30 days)
- `tradeStake` (uint256): Minimum stake amount per position

**Payable:** Must send >= 0.02 ETH platform fee

**Events Emitted:**
- `TradeCreated(string indexed tradeId, address indexed creator, uint256 expiryTime, uint256 minStake)`

**Requirements:**
- Caller not blacklisted
- TradeId must be unique
- Duration within valid range
- Sufficient platform fee

**Example:**
```javascript
await contract.createTrade(
    "BTC-PREDICTION-001",
    86400, // 1 day
    ethers.parseEther("0.01"),
    { value: ethers.parseEther("0.02") }
);
```

---

#### `openPosition()`

Opens a trading position with encrypted stake amount.

```solidity
function openPosition(
    string memory tradeId,
    bytes memory encryptedStake,
    bytes memory inputProof,
    uint8 positionType
) external payable
```

**Parameters:**
- `tradeId` (string): The trade identifier
- `encryptedStake` (bytes): FHE-encrypted stake amount
- `inputProof` (bytes): Cryptographic proof of encryption
- `positionType` (uint8): 0 = SHORT, 1 = LONG

**Payable:** Must send >= trade minimum stake

**Events Emitted:**
- `PositionOpened(string indexed tradeId, address indexed trader, uint8 positionType, uint256 amount, uint256 timestamp)`

**Requirements:**
- Trade exists and is active
- User doesn't already have position
- Valid position type (0 or 1)
- Sufficient stake amount

**Example:**
```javascript
const fhe = await initFheInstance();
const input = await fhe.createEncryptedInput(contractAddr, userAddr);
input.add64(stakeAmount);
const { handles, inputProof } = await input.encrypt();

await contract.openPosition(
    "BTC-PREDICTION-001",
    handles[0],
    inputProof,
    1, // LONG
    { value: ethers.parseEther("0.01") }
);
```

---

### Gateway Callback Functions

#### `requestDecryption()`

Requests oracle decryption after market expiry.

```solidity
function requestDecryption(string memory tradeId)
    external
    tradeExists(tradeId)
    tradeExpired(tradeId)
    nonReentrant
```

**Parameters:**
- `tradeId` (string): The trade to resolve

**Events Emitted:**
- `DecryptionRequested(string indexed tradeId, uint256 indexed requestId, uint256 timestamp)`

**Requirements:**
- Caller is creator or contract owner
- Trade has expired
- Decryption not already requested
- Trade not yet resolved

**Example:**
```javascript
await contract.requestDecryption("BTC-PREDICTION-001");
```

---

#### `resolveTradeCallback()`

Oracle callback function with signature verification (Called by Oracle only).

```solidity
function resolveTradeCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external
```

**Parameters:**
- `requestId` (uint256): The decryption request ID
- `cleartexts` (bytes): Decrypted values
- `decryptionProof` (bytes): Cryptographic proof

**Events Emitted:**
- `TradeResolved(string indexed tradeId, bool longWon, uint64 longCount, uint64 shortCount, uint256 prizePool)`

**Requirements:**
- Valid oracle signatures
- Valid request ID
- Callback not already executed

---

### Refund Functions

#### `claimTieRefund()`

Claims full refund when market results in a tie.

```solidity
function claimTieRefund(string memory tradeId)
    external
    nonReentrant
    tradeExists(tradeId)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Events Emitted:**
- `RefundIssued(string indexed tradeId, address indexed trader, uint256 amount, string reason)`

**Requirements:**
- Trade is resolved
- Result is a tie (revealedLong == revealedShort)
- User has position in trade
- Not already claimed

**Example:**
```javascript
await contract.claimTieRefund("BTC-PREDICTION-001");
```

---

#### `claimDecryptionTimeoutRefund()`

Claims refund if oracle fails to decrypt within 7 days.

```solidity
function claimDecryptionTimeoutRefund(string memory tradeId)
    external
    nonReentrant
    tradeExists(tradeId)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Events Emitted:**
- `RefundIssued(string indexed tradeId, address indexed trader, uint256 amount, string reason)`

**Requirements:**
- User has position
- Decryption was requested
- 7+ days since request
- Trade not resolved
- Not already claimed

**Example:**
```javascript
await contract.claimDecryptionTimeoutRefund("BTC-PREDICTION-001");
```

---

#### `emergencyRefund()`

Claims emergency refund after 14 days of market expiry.

```solidity
function emergencyRefund(string memory tradeId)
    external
    nonReentrant
    tradeExists(tradeId)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Events Emitted:**
- `RefundIssued(string indexed tradeId, address indexed trader, uint256 amount, string reason)`

**Requirements:**
- User has position
- Trade not resolved
- 14+ days since market expiry
- Not already claimed

**Example:**
```javascript
await contract.emergencyRefund("BTC-PREDICTION-001");
```

---

### Prize Distribution

#### `claimPrize()`

Claims prize for winning position with obfuscated calculation.

```solidity
function claimPrize(string memory tradeId)
    external
    nonReentrant
    tradeExists(tradeId)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Events Emitted:**
- `PrizeClaimed(string indexed tradeId, address indexed winner, uint256 amount)`

**Requirements:**
- Trade is resolved
- Not a tie
- User is winner
- Not already claimed

**Prize Calculation:**
```
prize = (prizePool * userStake) / totalWinningWeight
```
(with privacy-preserving obfuscation)

**Example:**
```javascript
await contract.claimPrize("BTC-PREDICTION-001");
```

---

### Administrative Functions (Owner Only)

#### `setBlacklist()`

Adds or removes address from blacklist.

```solidity
function setBlacklist(address account, bool status) external onlyOwner
```

**Parameters:**
- `account` (address): Address to modify
- `status` (bool): true = blacklist, false = remove

**Events Emitted:**
- `AddressBlacklisted(address indexed account, bool status)`

**Example:**
```javascript
await contract.setBlacklist("0x123...", true); // Blacklist
await contract.setBlacklist("0x123...", false); // Remove
```

---

#### `withdrawFees()`

Withdraws accumulated platform fees.

```solidity
function withdrawFees(uint256 amount) external onlyOwner nonReentrant
```

**Parameters:**
- `amount` (uint256): Amount to withdraw in wei

**Requirements:**
- Caller is owner
- Sufficient contract balance

**Example:**
```javascript
await contract.withdrawFees(ethers.parseEther("1.0"));
```

---

### View Functions

#### `getTradeInfo()`

Returns complete trade information.

```solidity
function getTradeInfo(string memory tradeId) external view returns (
    address creator,
    uint256 expiryTime,
    bool isResolved,
    uint64 revealedLong,
    uint64 revealedShort,
    uint256 prizePool
)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Returns:**
- `creator` (address): Market creator
- `expiryTime` (uint256): Expiration timestamp
- `isResolved` (bool): Resolution status
- `revealedLong` (uint64): Decrypted LONG count
- `revealedShort` (uint64): Decrypted SHORT count
- `prizePool` (uint256): Total prize pool

**Example:**
```javascript
const info = await contract.getTradeInfo("BTC-PREDICTION-001");
console.log(`Prize Pool: ${ethers.formatEther(info.prizePool)} ETH`);
```

---

#### `getUserPosition()`

Returns user's position in a trade.

```solidity
function getUserPosition(string memory tradeId, address user) external view returns (
    uint8 positionType,
    uint256 stakeAmount,
    bool claimed
)
```

**Parameters:**
- `tradeId` (string): The trade identifier
- `user` (address): User address

**Returns:**
- `positionType` (uint8): 0 = SHORT, 1 = LONG
- `stakeAmount` (uint256): Stake amount in wei
- `claimed` (bool): Claim status

**Example:**
```javascript
const position = await contract.getUserPosition("BTC-PREDICTION-001", userAddr);
console.log(`Position: ${position.positionType === 1 ? 'LONG' : 'SHORT'}`);
```

---

#### `isDecryptionTimedOut()`

Checks if decryption has timed out (7 days).

```solidity
function isDecryptionTimedOut(string memory tradeId) external view returns (bool)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Returns:**
- `bool`: true if timeout eligible for refund

**Example:**
```javascript
const timedOut = await contract.isDecryptionTimedOut("BTC-PREDICTION-001");
if (timedOut) {
    await contract.claimDecryptionTimeoutRefund("BTC-PREDICTION-001");
}
```

---

#### `canClaimEmergencyRefund()`

Checks if emergency refund is available (14 days).

```solidity
function canClaimEmergencyRefund(string memory tradeId) external view returns (bool)
```

**Parameters:**
- `tradeId` (string): The trade identifier

**Returns:**
- `bool`: true if emergency refund available

**Example:**
```javascript
const canRefund = await contract.canClaimEmergencyRefund("BTC-PREDICTION-001");
if (canRefund) {
    await contract.emergencyRefund("BTC-PREDICTION-001");
}
```

---

## Events Reference

### TradeCreated
```solidity
event TradeCreated(
    string indexed tradeId,
    address indexed creator,
    uint256 expiryTime,
    uint256 minStake
);
```

### PositionOpened
```solidity
event PositionOpened(
    string indexed tradeId,
    address indexed trader,
    uint8 positionType,
    uint256 amount,
    uint256 timestamp
);
```

### DecryptionRequested
```solidity
event DecryptionRequested(
    string indexed tradeId,
    uint256 indexed requestId,
    uint256 timestamp
);
```

### TradeResolved
```solidity
event TradeResolved(
    string indexed tradeId,
    bool longWon,
    uint64 longCount,
    uint64 shortCount,
    uint256 prizePool
);
```

### PrizeClaimed
```solidity
event PrizeClaimed(
    string indexed tradeId,
    address indexed winner,
    uint256 amount
);
```

### RefundIssued
```solidity
event RefundIssued(
    string indexed tradeId,
    address indexed trader,
    uint256 amount,
    string reason
);
```

### AddressBlacklisted
```solidity
event AddressBlacklisted(
    address indexed account,
    bool status
);
```

---

## Error Codes

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Address is blacklisted" | Caller is banned | Contact admin |
| "Trade does not exist" | Invalid trade ID | Check trade ID |
| "Trade has expired" | Market closed | Wait for resolution |
| "Already has position" | Duplicate entry | Use existing position |
| "Insufficient stake" | Too little ETH | Send more ETH |
| "Not authorized" | Access denied | Must be creator/owner |
| "Timeout not reached" | Too early | Wait for timeout |
| "Not a winner" | Position lost | No prize available |
| "Already claimed" | Double claim attempt | Already processed |

---

## Constants

```solidity
uint256 public constant MIN_TRADE_AMOUNT = 0.001 ether;
uint256 public constant PLATFORM_FEE = 0.02 ether;
uint256 public constant MIN_DURATION = 5 minutes;
uint256 public constant MAX_DURATION = 30 days;
uint256 public constant DECRYPTION_TIMEOUT = 7 days;
uint256 public constant REFUND_TIMEOUT = 14 days;
uint256 public constant MIN_OBFUSCATION_MULTIPLIER = 100;
uint256 public constant MAX_OBFUSCATION_MULTIPLIER = 1000;
```

---

## Complete Integration Example

```javascript
import { initFheInstance } from './utils/fheInstance';
import { ethers } from 'ethers';

// 1. Create market
async function createMarket() {
    const contract = new ethers.Contract(address, abi, signer);
    const tx = await contract.createTrade(
        "BTC-PREDICTION-001",
        86400, // 1 day
        ethers.parseEther("0.01"),
        { value: ethers.parseEther("0.02") }
    );
    await tx.wait();
}

// 2. Open position
async function openPosition() {
    const fhe = await initFheInstance();
    const input = await fhe.createEncryptedInput(contractAddr, userAddr);
    input.add64(BigInt(ethers.parseEther("0.01")));
    const { handles, inputProof } = await input.encrypt();

    const tx = await contract.openPosition(
        "BTC-PREDICTION-001",
        handles[0],
        inputProof,
        1, // LONG
        { value: ethers.parseEther("0.01") }
    );
    await tx.wait();
}

// 3. Request resolution
async function resolveMarket() {
    const tx = await contract.requestDecryption("BTC-PREDICTION-001");
    await tx.wait();

    // Listen for resolution
    contract.on("TradeResolved", (tradeId, longWon, longCount, shortCount, prizePool) => {
        console.log(`Market resolved: LONG ${longWon ? 'WON' : 'LOST'}`);
    });
}

// 4. Claim prize or refund
async function claimRewards() {
    const info = await contract.getTradeInfo("BTC-PREDICTION-001");

    if (info.revealedLong === info.revealedShort) {
        // Tie - claim refund
        await contract.claimTieRefund("BTC-PREDICTION-001");
    } else {
        // Check if winner
        const position = await contract.getUserPosition("BTC-PREDICTION-001", userAddr);
        const isWinner = (info.longWon && position.positionType === 1) ||
                         (!info.longWon && position.positionType === 0);

        if (isWinner) {
            await contract.claimPrize("BTC-PREDICTION-001");
        }
    }
}
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-24

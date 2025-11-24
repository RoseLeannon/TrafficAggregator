# SecureTradingPlatform - Architecture Documentation

## Overview

**SecureTradingPlatform** is an advanced privacy-preserving trading platform built on Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine). This platform enables users to create and participate in trading markets while maintaining complete privacy of their positions and stake amounts until market resolution.

## Core Features

### 1. Gateway Callback Pattern
The platform implements an asynchronous decryption workflow:

```
User Request → Encrypted Submission → Oracle Gateway → Callback → Resolution
```

**Flow Details:**
1. **Request Phase**: Market creator or owner calls `requestDecryption()` after market expiry
2. **Oracle Processing**: Gateway receives encrypted values and decrypts them off-chain
3. **Callback Execution**: Oracle calls `resolveTradeCallback()` with cryptographic proof
4. **Signature Verification**: `FHE.checkSignatures()` validates the decryption proof
5. **State Update**: Market is resolved with decrypted results

### 2. Multi-Tier Refund Mechanisms

#### A. Tie Refund
- **Trigger**: When `revealedLong == revealedShort`
- **Function**: `claimTieRefund()`
- **Result**: Full stake refund for all participants

#### B. Decryption Timeout Refund
- **Trigger**: 7 days after decryption request without callback
- **Function**: `claimDecryptionTimeoutRefund()`
- **Protection**: Prevents fund locking if oracle fails

#### C. Emergency Refund
- **Trigger**: 14 days after market expiry without resolution
- **Function**: `emergencyRefund()`
- **Purpose**: Ultimate failsafe for fund recovery

### 3. Timeout Protection System

| Timeout Type | Duration | Purpose |
|--------------|----------|---------|
| **Decryption Timeout** | 7 days | Protect against oracle failure |
| **Emergency Timeout** | 14 days | Ultimate fund recovery |
| **Market Duration** | 5 min - 30 days | Valid market lifespan |

### 4. Privacy-Preserving Division

Traditional division leaks information through precision. Our solution:

```solidity
// Standard (leaks info)
prize = (prizePool * userStake) / totalWinners;

// Privacy-Preserving (with obfuscation)
obfuscatedPool = prizePool * randomSeed;
obfuscatedStake = userStake * randomSeed;
prize = (obfuscatedPool * obfuscatedStake) / (obfuscatedStake * totalWinners);
// Random multiplier cancels out, but prevents precision leakage
```

**Obfuscation Seed**: Generated from `keccak256(timestamp + creator + tradeId)` → Range: 100-1000

### 5. Price Obfuscation Techniques

#### Temporal Obfuscation
- Individual stakes encrypted client-side
- Only aggregated totals stored on-chain
- Results hidden until market expiry

#### Mathematical Obfuscation
- Random seed per market
- Multiplier applied to all calculations
- Algebraic cancellation preserves correctness

### 6. Comprehensive Security Features

#### Input Validation
```solidity
function _validateTradeParams(uint256 duration, uint256 tradeStake)
function _validateEncryptedInput(bytes encryptedValue, bytes inputProof)
function _checkAddOverflow(uint256 a, uint256 b)
```

#### Access Control
- **Blacklist System**: Owner can ban malicious addresses
- **Authorization Checks**: Only creator/owner can request decryption
- **Position Limits**: One position per user per trade

#### Overflow Protection
- Unchecked blocks with explicit validation
- Safe math for critical operations
- Timestamp overflow prevention

#### Reentrancy Guards
- All state-changing functions use `nonReentrant`
- Checks-Effects-Interactions pattern
- State updates before external calls

### 7. Gas Optimization & HCU Management

**HCU (Homomorphic Computation Units)** are gas costs for FHE operations:

| Operation | HCU Cost | Usage |
|-----------|----------|-------|
| `FHE.asEuint64()` | 1 | Initialize encrypted values |
| `FHE.eq()` | 1 | Encrypted equality checks |
| `FHE.select()` | 1 | Conditional selection |
| `FHE.add()` | 1 | Encrypted addition |
| `FHE.toBytes32()` | 1 | Prepare for decryption |

**Optimization Strategies:**
1. **Batch Operations**: Process multiple FHE ops in single transaction
2. **Selective Encryption**: Only encrypt sensitive values (stake amounts)
3. **Lazy Decryption**: Delay decryption until absolutely necessary
4. **HCU Tracking**: Monitor total usage via `totalHCUUsed` variable

**Cost Analysis:**
- `createTrade()`: 2 HCU (initialize counters)
- `openPosition()`: 8 HCU (eq×2 + select×2 + add×2)
- `requestDecryption()`: 2 HCU (toBytes32×2)

## Technical Architecture

### Smart Contract Structure

```
SecureTradingPlatform
├── Ownable (Access Control)
├── ReentrancyGuard (Security)
└── Oracle (Gateway Callback)
```

### State Management

#### Trade Struct
```solidity
struct Trade {
    // Identity & Timing
    address creator;
    uint256 expiryTime;
    uint256 createdTime;

    // Financial
    uint256 platformStake;     // 0.02 ETH
    uint256 tradeStake;        // Min stake
    uint256 prizePool;         // Total pool

    // Encrypted State
    euint64 longPositions;     // Encrypted
    euint64 shortPositions;    // Encrypted

    // Resolved State
    uint64 revealedLong;
    uint64 revealedShort;
    bool longWon;

    // Status
    bool isResolved;
    bool isRefunded;

    // Gateway Callback
    uint256 decryptionRequestId;
    uint256 requestTimestamp;

    // Privacy
    uint256 obfuscationSeed;
}
```

#### Position Struct
```solidity
struct UserPosition {
    uint8 positionType;        // 0=SHORT, 1=LONG
    uint256 stakeAmount;
    bool claimed;
    uint256 entryTimestamp;
}
```

### State Diagrams

#### Market Lifecycle
```
┌─────────┐
│ Created │
└────┬────┘
     │
     ├─→ [Users open positions]
     │
┌────▼────┐
│ Active  │
└────┬────┘
     │
     ├─→ [Expiry reached]
     │
┌────▼──────────┐
│ Awaiting      │
│ Decryption    │
└────┬──────────┘
     │
     ├─→ [Oracle callback]
     │
┌────▼─────┐
│ Resolved │
└──────────┘
```

#### Refund Decision Tree
```
Market Expired?
├─ NO → Cannot refund
└─ YES → Check conditions
    ├─ Resolved?
    │  ├─ YES → Tie?
    │  │  ├─ YES → Tie Refund
    │  │  └─ NO → Prize Claim
    │  └─ NO → Check timeouts
    │      ├─ 7+ days since request → Decryption Timeout Refund
    │      └─ 14+ days since expiry → Emergency Refund
    └─ Not requested → Wait or Emergency
```

## Security Considerations

### Threat Model

| Threat | Mitigation |
|--------|------------|
| **Front-running** | All stakes encrypted client-side |
| **Oracle failure** | Multi-tier timeout refunds |
| **Reentrancy** | ReentrancyGuard + CEI pattern |
| **Integer overflow** | Explicit overflow checks |
| **Malicious users** | Blacklist system |
| **Gas griefing** | HCU optimization |

### Audit Recommendations

1. **FHE Operations**: Verify all `FHE.*` calls use correct types
2. **Callback Security**: Test oracle signature verification
3. **Refund Logic**: Ensure no double-claiming possible
4. **Math Operations**: Verify obfuscation doesn't break calculations
5. **Access Control**: Test blacklist and authorization

## Integration Guide

### Creating a Market

```javascript
const tx = await contract.createTrade(
    "trade-123",              // Unique ID
    86400,                    // 1 day duration
    ethers.parseEther("0.01"), // Min stake
    { value: ethers.parseEther("0.02") } // Platform fee
);
```

### Opening Position

```javascript
// 1. Initialize FHE instance
const fhe = await initFheInstance();

// 2. Encrypt stake amount
const encryptedInput = await fhe.createEncryptedInput(
    contractAddress,
    userAddress
);
encryptedInput.add64(stakeAmount);
const { handles, inputProof } = await encryptedInput.encrypt();

// 3. Submit transaction
const tx = await contract.openPosition(
    "trade-123",
    handles[0],    // Encrypted stake
    inputProof,    // Proof
    1,             // 1 = LONG, 0 = SHORT
    { value: ethers.parseEther("0.01") }
);
```

### Resolving Market

```javascript
// After expiry, request decryption
await contract.requestDecryption("trade-123");

// Oracle calls back automatically
// Wait for TradeResolved event

// Winners claim prizes
await contract.claimPrize("trade-123");
```

## Gas Cost Estimates

| Function | Regular Gas | HCU Cost | Total Est. |
|----------|-------------|----------|------------|
| `createTrade()` | ~150k | 2 | ~155k |
| `openPosition()` | ~200k | 8 | ~220k |
| `requestDecryption()` | ~100k | 2 | ~105k |
| `claimPrize()` | ~50k | 0 | ~50k |
| `claimRefund()` | ~45k | 0 | ~45k |

*Note: HCU costs converted at ~2.5k gas per unit (network dependent)*

## Future Enhancements

1. **Multi-Asset Support**: Accept ERC20 tokens
2. **Liquidity Pools**: Automated market making
3. **Cross-Chain**: Bridge to other chains
4. **Advanced Privacy**: Zero-knowledge proofs for claims
5. **Governance**: DAO for parameter updates

## Resources

- **Zama FHEVM Docs**: https://docs.zama.ai/fhevm
- **Oracle SDK**: https://github.com/zama-ai/fhevm-oracle
- **OpenZeppelin**: https://docs.openzeppelin.com/

## Support

For technical questions or security concerns:
- Review test suite in `/test`
- Check deployment scripts in `/scripts`
- Contact: [Your Contact Info]

---

**Version**: 1.0.0
**Last Updated**: 2025-11-24
**License**: MIT

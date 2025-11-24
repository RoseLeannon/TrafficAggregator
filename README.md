# SecureTradingPlatform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solidity](https://img.shields.io/badge/Solidity-^0.8.24-brightgreen.svg)
![FHE](https://img.shields.io/badge/Zama-FHEVM-purple.svg)

> Advanced privacy-preserving trading platform powered by Fully Homomorphic Encryption (FHE)

## Features

### Core Functionality
- **Privacy-Preserving Trading**: All position sizes encrypted using Zama FHEVM
- **Gateway Callback Pattern**: Asynchronous oracle decryption with cryptographic proof
- **Multi-Tier Refund System**: Comprehensive protection against fund locking
- **Timeout Protection**: Automatic refunds for oracle failures
- **Obfuscated Calculations**: Privacy-preserving division prevents information leakage

### Enhanced Security
- **Input Validation**: Comprehensive checks for all parameters
- **Access Control**: Blacklist system + role-based permissions
- **Overflow Protection**: Explicit validation for arithmetic operations
- **Reentrancy Guards**: Protection on all state-changing functions
- **Gas Optimization**: HCU (Homomorphic Computation Unit) tracking and optimization

Live Demo： https://traffic-aggregator.vercel.app/ 


## Architecture Highlights

### 1. Gateway Callback Pattern
```
User → Encrypted Request → Contract → Oracle → Callback → Resolution
```

### 2. Refund Mechanisms
- **Tie Refund**: Full refund when results are equal
- **Decryption Timeout** (7 days): Refund if oracle fails
- **Emergency Refund** (14 days): Ultimate failsafe

### 3. Privacy-Preserving Division
Uses random multiplier obfuscation to prevent precision leakage while maintaining calculation correctness.

### 4. HCU Gas Optimization
- `createTrade()`: 2 HCU
- `openPosition()`: 8 HCU
- `requestDecryption()`: 2 HCU

## Quick Start

### Installation

```bash
cd D:\
npm install
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm test
```

### Deploy

```bash
npm run deploy
```

## Usage Example

### 1. Create Trading Market

```javascript
const tx = await contract.createTrade(
    "BTC-PREDICTION-001",
    86400, // 1 day
    ethers.parseEther("0.01"),
    { value: ethers.parseEther("0.02") } // Platform fee
);
```

### 2. Open Position (Encrypted)

```javascript
const fhe = await initFheInstance();
const input = await fhe.createEncryptedInput(contractAddr, userAddr);
input.add64(stakeAmount);
const { handles, inputProof } = await input.encrypt();

await contract.openPosition(
    "BTC-PREDICTION-001",
    handles[0],
    inputProof,
    1, // 1 = LONG, 0 = SHORT
    { value: ethers.parseEther("0.01") }
);
```

### 3. Resolve Market

```javascript
await contract.requestDecryption("BTC-PREDICTION-001");
// Oracle calls back automatically
```

### 4. Claim Rewards

```javascript
const info = await contract.getTradeInfo("BTC-PREDICTION-001");

if (info.revealedLong === info.revealedShort) {
    await contract.claimTieRefund("BTC-PREDICTION-001");
} else {
    await contract.claimPrize("BTC-PREDICTION-001");
}
```

## Contract Functions

### Core Functions
- `createTrade()` - Create new market
- `openPosition()` - Open encrypted position
- `requestDecryption()` - Request oracle resolution
- `claimPrize()` - Claim winnings

### Refund Functions
- `claimTieRefund()` - Refund for ties
- `claimDecryptionTimeoutRefund()` - Refund after 7 days
- `emergencyRefund()` - Emergency refund after 14 days

### View Functions
- `getTradeInfo()` - Get market details
- `getUserPosition()` - Get user position
- `isDecryptionTimedOut()` - Check timeout status
- `canClaimEmergencyRefund()` - Check emergency refund eligibility

## Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Smart Contract**: [contracts/SecureTradingPlatform.sol](contracts/SecureTradingPlatform.sol)

## Security Features

| Feature | Description |
|---------|-------------|
| **FHE Encryption** | Client-side encryption using Zama FHEVM |
| **Gateway Callback** | Oracle decryption with signature verification |
| **Timeout Protection** | Multi-tier refund mechanisms (7/14 days) |
| **Overflow Protection** | Explicit validation for all arithmetic |
| **Reentrancy Guards** | CEI pattern + ReentrancyGuard modifier |
| **Access Control** | Blacklist + role-based permissions |
| **Price Obfuscation** | Random multiplier prevents info leakage |

## Technology Stack

- **Smart Contracts**: Solidity ^0.8.24
- **FHE Library**: Zama FHEVM @fhevm/solidity ^0.8.0
- **Oracle**: Zama Gateway Oracle @zama-fhe/oracle-solidity ^0.1.0
- **Security**: OpenZeppelin Contracts ^5.3.0
- **Development**: Hardhat ^2.25.0
- **Testing**: Mocha + Chai
- **Frontend**: React 19 + TypeScript + Vite

## Constants

```solidity
MIN_TRADE_AMOUNT = 0.001 ether
PLATFORM_FEE = 0.02 ether
MIN_DURATION = 5 minutes
MAX_DURATION = 30 days
DECRYPTION_TIMEOUT = 7 days
REFUND_TIMEOUT = 14 days
```

## Project Structure

```
D:\/
├── contracts/
│   └── SecureTradingPlatform.sol
├── docs/
│   ├── ARCHITECTURE.md
│   └── API.md
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
├── test/
├── package.json
└── README.md
```

## Gas Costs (Estimated)

| Function | Gas | HCU | Total |
|----------|-----|-----|-------|
| `createTrade()` | ~150k | 2 | ~155k |
| `openPosition()` | ~200k | 8 | ~220k |
| `requestDecryption()` | ~100k | 2 | ~105k |
| `claimPrize()` | ~50k | 0 | ~50k |

## Comparison with Reference Project

| Feature | Zamabelief | SecureTradingPlatform |
|---------|------------|----------------------|
| Gateway Callback | ✓ | ✓ Enhanced |
| Refund Mechanism | Tie only | **Tie + Timeout + Emergency** |
| Timeout Protection | ✗ | **✓ 7/14 days** |
| Privacy Division | ✗ | **✓ Obfuscation** |
| Price Obfuscation | Basic | **✓ Random multiplier** |
| Overflow Protection | Basic | **✓ Comprehensive** |
| HCU Tracking | ✗ | **✓ Optimized** |
| Blacklist System | ✗ | **✓ Included** |

## Future Enhancements

- [ ] Multi-asset support (ERC20 tokens)
- [ ] Automated market maker (AMM)
- [ ] Cross-chain bridges
- [ ] Zero-knowledge proof integration
- [ ] DAO governance for parameters

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs.

## License

MIT License - see LICENSE file for details

## Resources

- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm)
- [Oracle SDK](https://github.com/zama-ai/fhevm-oracle)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)

## Support

For questions or issues:
- Review documentation in `/docs`
- Check test suite in `/test`
- Open an issue on GitHub

---

**Version**: 1.0.0
**Network**: Ethereum Sepolia Testnet
**License**: MIT

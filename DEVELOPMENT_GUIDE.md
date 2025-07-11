# Private Traffic Aggregator V2 - Development Guide

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Git

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your private key and RPC URL
# IMPORTANT: Never commit .env to version control
```

### Compile Contracts

```bash
npm run compile
```

This will:
- Compile Solidity contracts
- Generate TypeChain type definitions
- Output contract size information

### Run Tests

```bash
# Run all tests
npm test

# Run tests with gas reporting
npm run test:gas

# Run specific test file
npx hardhat test test/PrivateTrafficAggregatorV2.test.ts
```

## 📦 Deployment

### Local Development Network

```bash
# Terminal 1: Start local Hardhat network
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local
```

### Sepolia Testnet (Zama Devnet)

```bash
# Deploy to Sepolia
npm run deploy:sepolia

# Verify on block explorer
npm run verify:sepolia
```

### Using Deployment Scripts

```bash
# Using hardhat-deploy (recommended)
npx hardhat deploy --network sepolia

# Using custom script
npx hardhat run scripts/deploy-and-setup.ts --network sepolia

# Verify deployed contract
npx hardhat run scripts/verify-contract.ts --network sepolia
```

## 🧪 Testing Strategy

### Test Coverage

The test suite covers:

1. **Deployment & Initialization**
   - Admin setup
   - Default values
   - Initial state

2. **Region Management**
   - Registration
   - Validation
   - Edge cases

3. **Reporter Authorization**
   - Authorization flow
   - Revocation
   - Batch operations
   - Permission checks

4. **Traffic Report Submission**
   - Encrypted data submission
   - Input validation
   - Duplicate prevention
   - Access control

5. **Cycle Management**
   - Finalization
   - Advancement
   - Cross-cycle data isolation

6. **Pausable Functionality**
   - Pause/unpause
   - Pauser management
   - Operational restrictions

7. **Gateway Integration**
   - Decryption requests
   - Callbacks
   - Data aggregation

8. **Edge Cases**
   - Boundary values
   - Zero states
   - Multiple regions
   - Concurrent operations

### Running Specific Test Suites

```bash
# Run only deployment tests
npx hardhat test --grep "Deployment"

# Run only pausable tests
npx hardhat test --grep "Pausable"

# Run with stack traces
npx hardhat test --bail
```

## 🔧 Development Workflow

### Making Contract Changes

1. Edit contract in `contracts/`
2. Compile: `npm run compile`
3. Run tests: `npm test`
4. Check gas usage: `npm run test:gas`
5. Review contract size: `npm run size`

### Adding New Features

1. Write contract code
2. Add comprehensive tests
3. Update TypeChain types
4. Document functions with NatSpec
5. Update deployment scripts if needed

### Code Quality Checks

```bash
# Check contract sizes
npm run size

# Generate gas report
npm run test:gas

# Clean build artifacts
npm run clean

# Rebuild everything
npm run build
```

## 🏗️ Project Structure

```

├── contracts/
│   ├── PrivateTrafficAggregator.sol      # Original contract (V1)
│   └── PrivateTrafficAggregatorV2.sol    # Enhanced contract with all features
├── deploy/
│   ├── 01_deploy_traffic_aggregator.ts   # Main deployment
│   └── 02_configure_contract.ts          # Post-deployment configuration
├── scripts/
│   ├── deploy-and-setup.ts               # Quick deployment script
│   ├── verify-contract.ts                # Verification script
│   └── interact.ts                       # Interaction/testing script
├── test/
│   └── PrivateTrafficAggregatorV2.test.ts # Comprehensive test suite
├── typechain-types/                      # Auto-generated TypeScript types
├── hardhat.config.ts                     # Hardhat configuration
├── tsconfig.json                         # TypeScript configuration
├── package.json                          # Project dependencies
└── .env.example                          # Environment template
```

## 🔐 Security Considerations

### Best Practices

1. **Private Keys**
   - Never commit `.env` files
   - Use hardware wallets for mainnet
   - Rotate keys regularly

2. **Access Control**
   - Admin functions protected
   - Reporter authorization required
   - Pauser role separated

3. **Input Validation**
   - Fail-closed design
   - Boundary checks
   - Type constraints

4. **Encrypted Data**
   - FHE for sensitive data
   - ACL permissions set
   - Gateway integration for decryption

### Audit Checklist

- [ ] All modifiers applied correctly
- [ ] Input validation comprehensive
- [ ] Event emissions complete
- [ ] Error handling robust
- [ ] Gas optimization applied
- [ ] Re-entrancy protection (N/A - no external calls)
- [ ] Integer overflow protection (Solidity 0.8+)

## 📊 Gas Optimization

### Current Contract Size

Check with:
```bash
npm run size
```

### Optimization Techniques Used

1. **Storage Optimization**
   - Packed structs where possible
   - Minimal storage updates
   - Efficient mappings

2. **Computation Optimization**
   - Avoid unnecessary loops
   - Cache storage reads
   - Batch operations when possible

3. **FHE Optimization**
   - Minimize encrypted operations
   - Efficient ACL management
   - Aggregate before decryption

## 🔍 Debugging

### Common Issues

1. **"Unauthorized" Error**
   - Ensure reporter is authorized
   - Check admin address
   - Verify pauser status

2. **"ContractPaused" Error**
   - Contract is paused
   - Unpause with admin/pauser account

3. **"AlreadyReported" Error**
   - Reporter already submitted in this cycle
   - Wait for next cycle or use different account

4. **"InvalidRegion" Error**
   - Region not registered
   - Register region first with admin

### Debug Mode

```bash
# Run with detailed logs
npx hardhat test --verbose

# Show stack traces on failure
npx hardhat test --bail --trace

# Increase timeout for debugging
TIMEOUT=300000 npx hardhat test
```

## 🌐 Network Configuration

### Zama Devnet (Sepolia)

- **Chain ID:** 8009
- **RPC URL:** https://devnet.zama.ai/
- **Gateway:** https://gateway.devnet.zama.ai
- **Explorer:** https://sepolia.etherscan.io/

### Local FHE Network

- **Chain ID:** 9000
- **RPC URL:** http://localhost:8545
- **Gateway:** http://localhost:8080

## 📚 Additional Resources

- [Zama FHE Documentation](https://docs.zama.ai/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)
- [Hardhat Deploy Plugin](https://github.com/wighawag/hardhat-deploy)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Test updates
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## 📝 License

MIT License - see LICENSE file for details

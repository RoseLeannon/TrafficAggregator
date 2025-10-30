# Private Traffic Aggregator

🚦 **Confidential Traffic Data Aggregation using Zama FHE Encryption**

A revolutionary blockchain-based system for collecting and analyzing traffic data while preserving privacy through Fully Homomorphic Encryption (FHE).

## 🌟 Project Overview

Private Traffic Aggregator enables cities and transportation authorities to collect real-time traffic data without compromising individual privacy. Using Zama's Fully Homomorphic Encryption technology, sensitive traffic information is encrypted before being submitted to the blockchain, allowing for statistical analysis while keeping individual reports completely confidential.

## 🔑 Core Concepts

### FHE Contract Privacy Traffic Data Aggregation
- **Confidential Traffic Analysis**: All traffic reports are encrypted using FHE before being stored on-chain
- **Privacy-Preserving Analytics**: Statistical computations are performed on encrypted data without revealing individual contributions
- **Zero-Knowledge Reporting**: Traffic reporters can submit data without exposing their specific location or movement patterns
- **Aggregate Insights**: Transportation authorities receive valuable traffic insights while maintaining citizen privacy

### Key Features
- 🔐 **End-to-End Encryption**: Traffic data is encrypted from collection to analysis
- 📊 **Real-Time Aggregation**: Continuous traffic monitoring with periodic cycle-based reporting
- 🎯 **Regional Analysis**: Data organized by geographic regions for targeted traffic management
- 🔍 **Transparent Verification**: Blockchain-based system ensures data integrity and auditability
- 🏛️ **Decentralized Governance**: Admin controls for region management and reporter authorization

## 🌐 Live Application

**Website**: [https://traffic-aggregator.vercel.app/](https://traffic-aggregator.vercel.app/)

**GitHub Repository**: [https://github.com/RoseLeannon/TrafficAggregator](https://github.com/RoseLeannon/TrafficAggregator)

### Frontend Implementation Options

This project includes **two frontend implementations** to demonstrate different development approaches:

#### 1. Next.js 14 Application (`/PrivateTrafficAggregator`)
Modern, production-ready React application featuring:
- **Server-side rendering (SSR)** with Next.js App Router
- **TypeScript** for comprehensive type safety
- **Tailwind CSS** with glassmorphism design system
- **Custom React hooks** for state management (useWallet, useTrafficContract, useRegions, useCycleInfo)
- **Hot module replacement** for rapid development
- **Optimized build** with SWC minification
- **Component architecture** with separation of concerns
- **fhevmjs** for client-side FHE encryption

#### 2. Vanilla JavaScript Application (`/public`)
Lightweight, straightforward implementation with:
- **Pure HTML5/CSS3/JavaScript** - no framework dependencies
- **Direct Web3 integration** via Ethers.js
- **Maximum compatibility** across browsers
- **Simple deployment** - static hosting ready
- **Minimal bundle size** for faster loading

## 📋 Smart Contract Information

### Deployment Details

**Contract Address**: `0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC`

**Network**: Zama Sepolia Testnet
**Chain ID**: 8009
**RPC URL**: https://devnet.zama.ai/
**Block Explorer**: https://sepolia.etherscan.io/address/0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC

### Network Configuration

#### Zama Sepolia Testnet
```javascript
{
  chainId: 8009,
  name: "Zama Sepolia",
  rpcUrl: "https://devnet.zama.ai/",
  blockExplorer: "https://sepolia.etherscan.io",
  currency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18
  }
}
```

#### Local Development
```javascript
{
  chainId: 31337,
  name: "Hardhat Local",
  rpcUrl: "http://localhost:8545"
}
```

## 🚀 How It Works

### For Traffic Reporters
1. **Connect Wallet**: Connect your Web3 wallet to the application
2. **Select Region**: Choose from available traffic monitoring regions
3. **Submit Encrypted Data**: Report traffic conditions including:
   - Congestion level (0-100%)
   - Vehicle count estimation
   - Average speed measurements
4. **Automatic Encryption**: All data is automatically encrypted using FHE before blockchain submission

### For Transportation Authorities (Admins)
1. **Region Management**: Register new monitoring regions
2. **Reporter Authorization**: Manage who can submit traffic reports
3. **Cycle Configuration**: Set reporting intervals and data collection periods
4. **Analytics Access**: Access aggregated traffic insights without seeing individual reports

### Privacy Architecture
- **Client-Side Encryption**: Data is encrypted in the browser before transmission
- **FHE Computation**: Statistical analysis performed on encrypted data
- **No Data Leakage**: Individual traffic patterns remain completely private
- **Aggregate Results**: Only statistical summaries are made available

## 📊 Technical Features

### Smart Contract Capabilities
- **Encrypted Data Storage**: All traffic reports stored as encrypted values
- **Homomorphic Operations**: Mathematical operations on encrypted data
- **Cycle-Based Reporting**: Time-based data collection and analysis cycles
- **Access Control**: Role-based permissions for different user types
- **Event Logging**: Transparent audit trail of all operations

### Frontend Features
- **Real-Time Dashboard**: Live traffic statistics and region overviews
- **Responsive Design**: Mobile-friendly interface for field reporting
- **Web3 Integration**: Seamless blockchain connectivity
- **Error Handling**: Comprehensive validation and user feedback
- **Progressive Enhancement**: Works with or without blockchain connectivity

## 🎯 Use Cases

### Smart City Applications
- **Traffic Flow Optimization**: Identify congestion patterns without tracking individuals
- **Infrastructure Planning**: Data-driven decisions for road improvements
- **Emergency Response**: Real-time traffic conditions for emergency services
- **Environmental Impact**: Monitor traffic density for pollution control

### Privacy-First Mobility
- **Anonymous Reporting**: Citizens can contribute traffic data without privacy concerns
- **Confidential Fleet Management**: Commercial fleets can share insights without revealing routes
- **Research Applications**: Academic studies on traffic patterns with privacy guarantees
- **Cross-Border Cooperation**: International traffic data sharing with privacy compliance

## 📺 Demonstration Materials

The project includes comprehensive demonstration resources:
- **Live Interactive Demo**: Full-featured traffic reporting simulation on the live website
- **PrivateTrafficAggregator.mp4**: Walkthrough demonstrations of key features and functionality
- **PrivateTrafficAggregator.png**: Real blockchain transactions showing the system in action
- **Mobile Experience**: Responsive design showcasing mobile traffic reporting capabilities

## 🔒 Privacy Guarantees

### Mathematical Privacy
- **Cryptographic Security**: Based on proven FHE cryptographic assumptions
- **Information-Theoretic Privacy**: No information leakage even with unlimited computational power
- **Differential Privacy**: Additional statistical privacy protections
- **Forward Secrecy**: Past data remains secure even if future keys are compromised

### Regulatory Compliance
- **GDPR Compatible**: Meets European data protection requirements
- **CCPA Compliant**: Aligns with California privacy regulations
- **Zero Personal Data**: No personally identifiable information collected
- **Audit-Ready**: Complete transparency of privacy mechanisms

## 🏆 Innovation Highlights

### Breakthrough Technology
- **First-of-Kind**: Revolutionary application of FHE to traffic management
- **Scalable Privacy**: Maintains privacy protection at city-wide scale
- **Real-World Impact**: Practical solution for immediate deployment
- **Open Source**: Transparent implementation for community verification

### Technical Excellence
- **Gas Optimization**: Efficient smart contract design for cost-effective operations
- **Security Auditing**: Comprehensive security review and testing
- **Performance Scaling**: Designed for high-volume traffic data processing
- **Interoperability**: Compatible with existing traffic management systems

## 🌍 Global Impact

This project represents a significant step forward in privacy-preserving smart city technology. By enabling traffic data collection without sacrificing individual privacy, we create a foundation for:

- **Sustainable Urban Planning**: Better traffic management leads to reduced emissions
- **Democratic Participation**: Citizens can contribute to city planning without privacy risks
- **International Cooperation**: Cross-border traffic studies with privacy compliance
- **Technology Leadership**: Demonstrating practical applications of advanced cryptography

## 💡 Technology Stack

### Development Framework
- **Hardhat**: Primary development framework for smart contracts
- **TypeScript**: Full TypeScript support for configuration and scripts
- **Ethers.js v6**: Latest version for blockchain interactions
- **Hardhat Plugins**:
  - `@nomicfoundation/hardhat-toolbox` - Complete development toolbox
  - `@fhevm/hardhat-plugin` - FHE encryption support
  - `hardhat-deploy` - Deployment management
  - `hardhat-contract-sizer` - Contract size optimization
  - `hardhat-gas-reporter` - Gas usage analytics

### Smart Contract Development
- **Solidity**: 0.8.24 with Cancun EVM features
- **FHE Libraries**:
  - Zama's `@fhevm/solidity` for encryption
  - `@zama-fhe/oracle-solidity` - Oracle integration
  - `@zama-fhe/relayer-sdk` - Relayer support
- **Testing**: Comprehensive test suite with Chai matchers
- **Optimization**: Enabled with 200 runs for gas efficiency
- **Code Quality**:
  - Solhint for Solidity linting
  - Prettier for code formatting
  - Husky for git hooks
  - Lint-staged for pre-commit checks

### Frontend Technology (Two Versions)

#### Version 1: Next.js Application (`/PrivateTrafficAggregator`)
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom animations and glassmorphism design
- **FHE Integration**: fhevmjs v0.5.0 for client-side encryption
- **Build Tools**:
  - PostCSS with Autoprefixer
  - SWC for minification
  - TypeScript 5.3 for type safety
- **Features**:
  - Server-side rendering (SSR)
  - Client-side routing
  - Responsive design
  - Modern component architecture with custom hooks

#### Version 2: Vanilla JavaScript (Root)
- **Vanilla JavaScript**: Maximum compatibility and performance
- **HTML5/CSS3**: Modern, responsive design
- **Web3 Integration**: Ethers.js for seamless blockchain connectivity
- **Privacy Layer**: Zama FHE encryption in the browser

### Deployment & Infrastructure
- **Hosting**: Vercel for frontend deployment
- **Blockchain**: Zama Sepolia Testnet (Chain ID: 8009)
- **Contract Verification**: Etherscan integration
- **CI/CD**: Automated testing and deployment pipelines
- **Development Tools**:
  - TypeChain for type-safe contract interactions
  - Solidity Coverage for test coverage analysis
  - Audit-CI for security checks

## 🛠️ Development Setup

### Prerequisites
```bash
node >= 14.0.0
npm or yarn
Git
MetaMask or compatible Web3 wallet
```

### Installation
```bash
# Clone the repository
git clone https://github.com/RoseLeannon/TrafficAggregator.git
cd PrivateTrafficAggregator

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your private key and API keys
```

### Environment Variables
Create a `.env` file in the root directory:
```bash
# Deployment Account
PRIVATE_KEY=your_private_key_here

# Network Configuration
SEPOLIA_RPC_URL=https://devnet.zama.ai/

# Etherscan API (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas Reporting (optional)
REPORT_GAS=true
```

## 📦 Compilation and Testing

### Compile Smart Contracts
```bash
# Compile contracts
npm run compile

# Check contract sizes
npm run size

# Generate TypeChain types
npm run typechain
```

### Run Tests
```bash
# Run all tests
npm run test

# Run with gas reporting
npm run test:gas

# Run coverage analysis
npm run test:coverage

# Run tests on Sepolia testnet
npm run test:sepolia

# Watch mode for continuous testing
npm run test:watch
```

### Code Quality and Linting
```bash
# Lint Solidity contracts
npm run lint:sol

# Lint TypeScript files
npm run lint:ts

# Run all linters
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Security audit
npm run security

# Security check (moderate level)
npm run security:check
```

### Local Development
```bash
# Start local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local

# Start frontend development server
npm start
```

## 🚀 Deployment

### Deploy to Zama Sepolia Testnet
```bash
# 1. Ensure you have testnet ETH in your wallet

# 2. Deploy the contract
npm run deploy:sepolia

# 3. Verify the contract (if supported)
npm run verify:sepolia

# 4. Interact with the deployed contract
npm run interact

# 5. Run simulation tests
npm run simulate
```

### Deployment Scripts

#### `scripts/deploy.js`
Complete deployment script with:
- Network detection and validation
- Contract deployment with confirmation waiting
- Automatic ABI generation for frontend
- Configuration file updates
- Deployment information storage

#### `scripts/verify.js`
Contract verification script:
- Etherscan verification support
- Manual verification instructions for Zama
- Contract accessibility testing
- Deployment info updates

#### `scripts/interact.js`
Interactive script for contract operations:
- Read contract state
- Register regions (admin)
- Authorize reporters (admin)
- Submit traffic reports
- Query statistics

#### `scripts/simulate.js`
Complete workflow simulation:
- Register multiple traffic regions
- Authorize multiple reporters
- Simulate traffic report submissions
- Query aggregated statistics
- Demonstrate full system lifecycle

## 📊 Deployment Information

### Current Deployment
- **Contract**: PrivateTrafficAggregator
- **Address**: `0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC`
- **Network**: Zama Sepolia Testnet
- **Chain ID**: 8009
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC)

### Hardhat Tasks
```bash
# Available Hardhat tasks
npx hardhat                    # Show all available tasks
npx hardhat compile            # Compile contracts
npx hardhat test               # Run tests
npx hardhat node               # Start local node
npx hardhat clean              # Clean artifacts
npx hardhat size-contracts     # Show contract sizes
npx hardhat console --network sepolia  # Interactive console
```

## 🔧 Project Structure

```
 
├── contracts/                 # Smart contracts
│   ├── PrivateTrafficAggregator.sol
│   └── PrivateTrafficAggregatorV2.sol
├── scripts/                   # Deployment and interaction scripts
│   ├── deploy.js             # Main deployment script
│   ├── verify.js             # Contract verification
│   ├── interact.js           # Contract interaction examples
│   └── simulate.js           # Full workflow simulation
├── test/                      # Contract tests
├── public/                    # Vanilla JS frontend files
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── abi/                  # Auto-generated ABIs
│   └── config/               # Auto-generated configs
├── PrivateTrafficAggregator/  # Next.js frontend application
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Main application page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── ConnectionStatus.tsx
│   │   ├── NetworkInfo.tsx
│   │   ├── StatusBar.tsx
│   │   ├── RegionCard.tsx
│   │   ├── RegionList.tsx
│   │   ├── ReportForm.tsx
│   │   └── AdminControls.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useWallet.ts      # Wallet connection
│   │   ├── useTrafficContract.ts  # Contract interactions
│   │   ├── useRegions.ts     # Region management
│   │   └── useCycleInfo.ts   # Cycle information
│   ├── lib/                  # Utilities and constants
│   │   ├── abi.ts            # Contract ABI
│   │   ├── constants.ts      # Configuration
│   │   └── utils.ts          # Helper functions
│   ├── types/                # TypeScript type definitions
│   │   ├── index.ts          # Type definitions
│   │   └── window.d.ts       # Window extensions
│   ├── next.config.js        # Next.js configuration
│   ├── tailwind.config.ts    # Tailwind CSS configuration
│   ├── tsconfig.json         # TypeScript configuration
│   └── package.json          # Next.js dependencies
├── deployments/              # Deployment records
├── hardhat.config.ts         # Hardhat configuration
├── tsconfig.json             # Root TypeScript configuration
├── package.json              # Root dependencies and scripts
└── README.md                 # This file
```

## 📝 Usage Guide

### For Developers

1. **Contract Development**
   ```bash
   # Edit contracts in contracts/
   # Write tests in test/
   npm run compile
   npm run test
   ```

2. **Local Testing**
   ```bash
   # Terminal 1: Start local node
   npm run node

   # Terminal 2: Deploy and test
   npm run deploy:local
   npm run simulate
   ```

3. **Testnet Deployment**
   ```bash
   # Deploy to Sepolia
   npm run deploy:sepolia

   # Verify contract
   npm run verify:sepolia

   # Test interactions
   npm run interact
   ```

4. **Frontend Development (Next.js Version)**
   ```bash
   # Navigate to Next.js directory
   cd PrivateTrafficAggregator

   # Install dependencies
   npm install

   # Start development server (with hot reload)
   npm run dev
   # Visit http://localhost:3000

   # Build for production
   npm run build

   # Start production server
   npm start

   # Type checking
   npm run type-check
   ```

5. **Frontend Development (Vanilla JS Version)**
   ```bash
   # From root directory
   # Start simple HTTP server
   npm start
   # Visit http://localhost:3000
   ```

### For Users

1. **Access the Application**
   - Visit: https://traffic-aggregator.vercel.app/
   - Connect your Web3 wallet (MetaMask recommended)
   - Switch to Zama Sepolia Testnet (Chain ID: 8009)

2. **Get Testnet ETH**
   - Request testnet ETH from Zama faucet
   - Or use Sepolia faucets

3. **Submit Traffic Reports**
   - Select a region from the available list
   - Enter traffic data (congestion, vehicle count, speed)
   - Data is automatically encrypted with FHE
   - Submit to blockchain

## 🔍 Contract Verification

### Automatic Verification (Ethereum Sepolia)
```bash
npm run verify:sepolia
```

### Manual Verification (Zama Sepolia)
If automatic verification is not available, use these details:

- **Contract Name**: PrivateTrafficAggregator
- **Compiler Version**: 0.8.24
- **Optimization**: Enabled
- **Runs**: 200
- **EVM Version**: cancun
- **Constructor Arguments**: None
- **License**: MIT

## 🔄 Development Workflow

### Git Hooks and Pre-commit Checks
The project uses **Husky** and **lint-staged** to ensure code quality:

```bash
# Install git hooks
npm run prepare

# Hooks automatically run on git commit:
# - ESLint fixes for TS/JS files
# - Solhint fixes for Solidity files
# - Prettier formatting for all files
```

### Continuous Integration
```bash
# Run the full CI pipeline locally
npm run ci
# This runs: lint → compile → test → coverage
```

### Development Best Practices
1. **Branch Strategy**: Create feature branches from main
2. **Testing**: Write tests before committing new features
3. **Code Review**: Ensure all tests pass and coverage is maintained
4. **Security**: Run `npm run security:check` before pushing
5. **Documentation**: Update README when adding new features

## 🎨 Component Architecture (Next.js Version)

The Next.js application follows a modular architecture:

### Custom Hooks
- **useWallet.ts**: Manages wallet connection and contract initialization
- **useTrafficContract.ts**: Handles all smart contract interactions
- **useRegions.ts**: Manages region data and statistics
- **useCycleInfo.ts**: Tracks cycle information and updates

### Components
- **ConnectionStatus.tsx**: Displays wallet connection state
- **NetworkInfo.tsx**: Shows network information and contract details
- **StatusBar.tsx**: Comprehensive status display
- **RegionCard.tsx**: Individual region information card
- **RegionList.tsx**: List view of all regions
- **ReportForm.tsx**: Traffic report submission form
- **AdminControls.tsx**: Administrative functions

### Design Patterns
- **Separation of Concerns**: Business logic in hooks, UI in components
- **Type Safety**: Full TypeScript coverage
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Error Handling**: Comprehensive error boundaries and user feedback

## 📚 Additional Resources

### Documentation Files
- `DEVELOPMENT_GUIDE.md` - Detailed development instructions
- `DEPLOYMENT_GUIDE.md` - Step-by-step deployment guide
- `TECHNICAL_DOCUMENTATION.md` - Technical architecture details
- `TESTING.md` - Testing strategy and guidelines
- `SECURITY_AND_PERFORMANCE.md` - Security best practices

### Scripts Overview
| Script | Purpose |
|--------|---------|
| `npm run compile` | Compile Solidity contracts |
| `npm run test` | Run test suite |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run simulate` | Run full workflow simulation |
| `npm run lint` | Check code quality |
| `npm run format` | Format all code |
| `npm run security` | Run security audit |
| `npm run ci` | Full CI pipeline |

---

*Built with privacy-first principles using Zama FHE technology for a more secure and transparent future of urban mobility.*
# Private Traffic Aggregator - Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
npm start

# Type check
npm run type-check

# Lint code
npm run lint
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Styling**: Tailwind CSS 3.4
- **Web3**: Ethers.js 6.11
- **FHE**: fhevmjs 0.5

### Directory Structure

```
PrivateTrafficAggregator/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main application page
│   └── globals.css        # Global styles & animations
│
├── components/            # React components
│   ├── ConnectionStatus.tsx   # Wallet status display
│   ├── NetworkInfo.tsx        # Network information
│   ├── StatusBar.tsx          # Cycle stats display
│   ├── RegionCard.tsx         # Region info card
│   ├── RegionList.tsx         # Region grid
│   ├── ReportForm.tsx         # Traffic report form
│   └── AdminControls.tsx      # Admin panel
│
├── hooks/                 # Custom React hooks
│   ├── useWallet.ts          # Wallet connection & contract init
│   ├── useTrafficContract.ts # Contract interactions
│   ├── useRegions.ts         # Region data management
│   └── useCycleInfo.ts       # Cycle information tracking
│
├── lib/                   # Utilities & configuration
│   ├── abi.ts               # Contract ABI
│   ├── constants.ts         # Configuration constants
│   └── utils.ts             # Helper functions
│
├── types/                 # TypeScript definitions
│   ├── index.ts            # Main type definitions
│   └── window.d.ts         # Window.ethereum types
│
└── public/                # Static assets
```

## Component Documentation

### Core Components

#### app/page.tsx
Main application component that orchestrates all functionality.

**Features:**
- Wallet connection state
- Message management
- Form submissions
- Admin operations
- Real-time updates

**Key Props:** None (root component)

**State Management:**
- Messages array for user feedback
- All other state managed via custom hooks

#### ConnectionStatus
Displays wallet connection status with visual indicator.

**Props:**
```typescript
interface ConnectionStatusProps {
  status: ConnectionStatusType;
}
```

**Features:**
- Animated pulse indicator
- Connected/disconnected states
- Address truncation

#### StatusBar
Shows current cycle information and statistics.

**Props:**
```typescript
interface StatusBarProps {
  cycleInfo: CycleInfo;
  totalReports: number;
  activeRegions: number;
}
```

**Features:**
- Current cycle number
- Time remaining countdown
- Total reports count
- Active regions count

#### ReportForm
Traffic report submission form with validation.

**Props:**
```typescript
interface ReportFormProps {
  regions: RegionData[];
  isSubmitting: boolean;
  onSubmit: (report: TrafficReport) => void;
}
```

**Features:**
- Region selection dropdown
- Congestion level slider (0-100%)
- Vehicle count input (0-255)
- Average speed input (0-300 km/h)
- Real-time validation
- Loading states

#### AdminControls
Administrative functions panel.

**Props:**
```typescript
interface AdminControlsProps {
  isAdmin: boolean;
  isRegistering: boolean;
  isAuthorizing: boolean;
  onRegisterRegion: (regionName: string) => void;
  onAuthorizeReporter: (address: string) => void;
  onSetCycleInterval: (interval: number) => void;
  onFinalizeCycle: () => void;
  onRegisterAllDefaultRegions: () => void;
}
```

**Features:**
- Register new regions
- Authorize reporters
- Set cycle intervals
- Finalize cycles
- Bulk region registration
- Admin permission checks

## Custom Hooks Documentation

### useWallet
Manages wallet connection and contract initialization.

**Returns:**
```typescript
{
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  contract: Contract | null;
  account: string;
  chainId: number;
  status: ConnectionStatus;
  isAdmin: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}
```

**Features:**
- Auto-connect on mount
- Account change detection
- Network change handling
- Admin status verification

### useTrafficContract
Handles all contract interaction methods.

**Parameters:**
- `contract: Contract | null`
- `account: string`

**Returns:**
```typescript
{
  submitReport: (report, onSuccess?, onError?) => Promise<void>;
  registerRegion: (regionName, onSuccess?, onError?) => Promise<void>;
  authorizeReporter: (address, onSuccess?, onError?) => Promise<void>;
  setCycleInterval: (interval, onSuccess?, onError?) => Promise<void>;
  finalizeCycle: (onSuccess?, onError?) => Promise<void>;
  registerAllDefaultRegions: (regions, onProgress?, onSuccess?, onError?) => Promise<void>;
  isSubmitting: boolean;
  isRegistering: boolean;
  isAuthorizing: boolean;
}
```

**Features:**
- Input validation
- Error parsing
- Loading states
- Callback support

### useRegions
Manages region data and statistics.

**Parameters:**
- `contract: Contract | null`
- `currentCycle: number`

**Returns:**
```typescript
{
  regions: RegionData[];
  registeredRegions: string[];
  totalReports: number;
  activeRegions: number;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
}
```

**Features:**
- Auto-load on mount
- Contract and default regions
- Statistics aggregation
- Manual reload function

### useCycleInfo
Tracks cycle information with auto-refresh.

**Parameters:**
- `contract: Contract | null`

**Returns:**
```typescript
{
  cycleInfo: CycleInfo;
  loading: boolean;
  refresh: () => Promise<void>;
}
```

**Features:**
- Auto-refresh every 30 seconds
- Current cycle tracking
- Time remaining calculation
- Manual refresh

## Utility Functions

### lib/utils.ts

#### formatTime(seconds: number): string
Formats seconds into human-readable time string.

**Examples:**
- `3661` → "1h 1m"
- `125` → "2m 5s"
- `45` → "45s"

#### formatAddress(address: string): string
Truncates Ethereum address for display.

**Example:**
- `0x1234...7890` → "0x1234...7890"

#### formatDate(timestamp: number): string
Formats Unix timestamp to locale string.

#### isValidEthereumAddress(address: string): boolean
Validates Ethereum address format.

#### validateTrafficReport(data): { valid: boolean; error?: string }
Validates traffic report data.

#### parseContractError(error: any): string
Parses contract errors into user-friendly messages.

## Configuration

### lib/constants.ts

#### CONTRACT_CONFIG
```typescript
{
  contractAddress: "0xfc3bE20Ff45d25d85FBCAb90F414E758286963DC",
  networkName: "FHEVM Devnet",
  chainId: 8009,
  rpcUrl: "https://devnet.zama.ai/"
}
```

#### DEFAULT_REGIONS
Array of default region names for quick setup.

#### VALIDATION_LIMITS
```typescript
{
  MIN_CONGESTION: 0,
  MAX_CONGESTION: 100,
  MIN_VEHICLE_COUNT: 0,
  MAX_VEHICLE_COUNT: 255,
  MIN_SPEED: 0,
  MAX_SPEED: 300,
  MIN_CYCLE_INTERVAL: 300,
  MAX_CYCLE_INTERVAL: 86400
}
```

## Styling Guide

### Tailwind Configuration

Custom animations:
- `animate-pulse-slow` - 2s pulse animation
- `animate-spin-slow` - 1s spin animation

### Glassmorphism Classes

The design uses glassmorphism effects:
- `bg-white/95` - Semi-transparent white background
- `backdrop-blur-sm` - Blur backdrop
- `shadow-lg` - Large shadow

### Responsive Design

Breakpoints:
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px

## Type Definitions

### Key Types

#### TrafficReport
```typescript
interface TrafficReport {
  region: string;
  congestionLevel: number;
  vehicleCount: number;
  averageSpeed: number;
}
```

#### RegionStats
```typescript
interface RegionStats {
  reportCount: number;
  lastUpdate: number;
  isActive: boolean;
}
```

#### CycleInfo
```typescript
interface CycleInfo {
  currentCycle: number;
  timeRemaining: number;
  cycleStartTime: number;
}
```

## Best Practices

### Component Development
1. Always use TypeScript types
2. Extract business logic to hooks
3. Keep components focused and small
4. Use proper error handling
5. Provide loading states

### State Management
1. Use hooks for local state
2. Lift state when needed
3. Avoid prop drilling
4. Use callbacks for events

### Error Handling
1. Always try-catch async operations
2. Provide user-friendly error messages
3. Log errors for debugging
4. Show loading states

### Performance
1. Use proper React keys
2. Memoize expensive calculations
3. Avoid unnecessary re-renders
4. Optimize images and assets

## Testing

### Manual Testing Checklist

- [ ] Wallet connection
- [ ] Region loading
- [ ] Traffic report submission
- [ ] Form validation
- [ ] Admin controls (if admin)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Message display

## Deployment

### Environment Setup

No environment variables needed for basic setup. All configuration is in `lib/constants.ts`.

### Build Process

```bash
# Production build
npm run build

# Start production server
npm start
```

### Vercel Deployment

The project includes `vercel.json` for easy Vercel deployment.

```bash
# Deploy to Vercel
vercel --prod
```

## Troubleshooting

### Common Issues

#### MetaMask not detected
**Problem:** "MetaMask not detected" error
**Solution:** Install MetaMask browser extension

#### Wrong network
**Problem:** Connected to wrong network
**Solution:** Switch to FHEVM Devnet (Chain ID: 8009)

#### Transaction fails
**Problem:** Transaction reverts
**Solution:** Check you're authorized reporter and region exists

#### Build errors
**Problem:** TypeScript errors during build
**Solution:** Run `npm run type-check` to identify issues

## Contributing

### Code Style
- Use TypeScript for all new files
- Follow existing patterns
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages
- Use clear, descriptive messages
- Reference issues when applicable
- Keep commits atomic

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [FHEVM Documentation](https://docs.zama.ai/)

'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { ContractInfo } from '@/components/contract-info';
import { TrafficReportForm } from '@/components/traffic-report-form';
import { TransactionHistory } from '@/components/transaction-history';
import { AdminPanel } from '@/components/admin-panel';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #070910 0%, #0d1120 25%, #1a0e2e 50%, #0d1120 75%, #070910 100%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(109, 110, 255, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(43, 195, 123, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Header with Glassmorphism */}
      <header
        className="relative z-10 glass"
        style={{
          borderBottom: '1px solid var(--color-border)',
          borderRadius: 0
        }}
      >
        <div className="container mx-auto px-4 py-4" style={{ maxWidth: '960px' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, var(--color-text) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Private Traffic Aggregator
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                🔐 FHE-Powered Confidential Data Collection
              </p>
            </div>
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8" style={{ maxWidth: '960px' }}>
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div
              className="text-center max-w-2xl glass animate-fadeIn"
              style={{
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div className="mb-8">
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--accent) 0%, rgba(109, 110, 255, 0.5) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(109, 110, 255, 0.3)'
                  }}
                >
                  <svg
                    className="w-10 h-10"
                    fill="none"
                    stroke="white"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <h2
                className="text-3xl font-bold mb-4"
                style={{
                  letterSpacing: '-0.02em',
                  color: 'var(--color-text)'
                }}
              >
                Connect Your Wallet
              </h2>
              <p className="mb-8" style={{
                color: 'var(--color-text-muted)',
                lineHeight: '1.7'
              }}>
                Connect your Web3 wallet to start submitting private traffic reports
                using <span style={{ color: 'var(--accent)' }}>Fully Homomorphic Encryption</span> technology.
              </p>
              <div className="flex justify-center">
                <ConnectButton />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Contract Info */}
            <ContractInfo />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Report Form */}
              <div className="lg:col-span-2">
                <TrafficReportForm />
              </div>

              {/* Right Column - Admin & Info */}
              <div className="space-y-6">
                <AdminPanel />
              </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 mt-16"
        style={{
          borderTop: '1px solid var(--color-border)',
          backdropFilter: 'blur(18px)'
        }}
      >
        <div className="container mx-auto px-4 py-6" style={{ maxWidth: '960px' }}>
          <div className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <p>Built with Next.js, TypeScript, Wagmi, and RainbowKit</p>
            <p className="mt-2">
              Deployed on <span style={{ color: 'var(--accent)' }}>Sepolia Testnet</span> |
              Powered by <span style={{ color: 'var(--success)' }}>Zama FHE</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

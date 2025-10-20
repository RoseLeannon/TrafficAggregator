'use client';

import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { LoadingSpinner } from './loading-spinner';

export function ContractInfo() {
  const { data: admin, isLoading: adminLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admin',
  });

  const { data: currentCycle, isLoading: cycleLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'currentReportCycle',
  });

  const { data: regionCount, isLoading: regionLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'regionCount',
  });

  return (
    <div
      className="glass animate-fadeIn"
      style={{
        padding: 'var(--space-6)',
      }}
    >
      <h2
        className="text-xl font-bold mb-4"
        style={{
          color: 'var(--color-text)',
          letterSpacing: '-0.02em'
        }}
      >
        Contract Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="glass"
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 110, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Contract Address
          </div>
          <div
            className="font-mono text-xs break-all"
            style={{
              color: 'var(--accent)',
              fontWeight: 500
            }}
          >
            {CONTRACT_ADDRESS}
          </div>
        </div>

        <div
          className="glass"
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(43, 195, 123, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Current Cycle
          </div>
          {cycleLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div
              className="font-bold text-lg"
              style={{
                color: 'var(--success)',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {currentCycle?.toString() || '0'}
            </div>
          )}
        </div>

        <div
          className="glass"
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 110, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div
            className="text-sm mb-1"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Total Regions
          </div>
          {regionLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div
              className="font-bold text-lg"
              style={{
                color: 'var(--accent)',
                fontSize: '1.5rem',
                fontWeight: 700
              }}
            >
              {regionCount?.toString() || '0'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

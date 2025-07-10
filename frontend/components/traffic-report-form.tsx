'use client';

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { LoadingSpinner } from './loading-spinner';

export function TrafficReportForm() {
  const [regionId, setRegionId] = useState('1');
  const [congestion, setCongestion] = useState('50');
  const [vehicleCount, setVehicleCount] = useState('100');
  const [averageSpeed, setAverageSpeed] = useState('45');

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Note: In production, these values should be encrypted using FHE
    // For now, we'll use placeholder values
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'registerRegion',
      args: [`Region ${regionId}`],
    });
  };

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
        Submit Traffic Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Region ID
          </label>
          <input
            type="number"
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="w-full"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-panel-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '14px',
              transition: 'var(--transition-default)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(109, 110, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Congestion Level (%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={congestion}
            onChange={(e) => setCongestion(e.target.value)}
            className="w-full"
            style={{
              accentColor: 'var(--accent)',
              height: '6px'
            }}
          />
          <div
            className="text-center mt-1"
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              fontSize: '1.25rem'
            }}
          >
            {congestion}%
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Vehicle Count
          </label>
          <input
            type="number"
            value={vehicleCount}
            onChange={(e) => setVehicleCount(e.target.value)}
            className="w-full"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-panel-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '14px',
              transition: 'var(--transition-default)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(109, 110, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.05em'
            }}
          >
            Average Speed (km/h)
          </label>
          <input
            type="number"
            value={averageSpeed}
            onChange={(e) => setAverageSpeed(e.target.value)}
            className="w-full"
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-panel-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '14px',
              transition: 'var(--transition-default)',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.boxShadow = '0 0 0 3px rgba(109, 110, 255, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'none';
            }}
            required
          />
        </div>

        {error && (
          <div
            className="glass"
            style={{
              padding: 'var(--space-3)',
              background: 'rgba(239, 83, 80, 0.1)',
              border: '1px solid var(--error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--error)',
              fontSize: '0.875rem'
            }}
          >
            Error: {error.message}
          </div>
        )}

        {isSuccess && (
          <div
            className="glass"
            style={{
              padding: 'var(--space-3)',
              background: 'var(--success-soft)',
              border: '1px solid var(--success)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--success)',
              fontSize: '0.875rem'
            }}
          >
            Report submitted successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full flex items-center justify-center gap-2"
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: isPending || isConfirming ? 'var(--color-border)' : 'var(--accent)',
            color: 'white',
            fontWeight: 600,
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: isPending || isConfirming ? 'not-allowed' : 'pointer',
            transition: 'var(--transition-default)',
            fontSize: '14px',
            letterSpacing: '0.02em',
            opacity: isPending || isConfirming ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (!isPending && !isConfirming) {
              e.currentTarget.style.background = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 110, 255, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isPending && !isConfirming) {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {isPending || isConfirming ? (
            <>
              <LoadingSpinner size="sm" />
              {isPending ? 'Submitting...' : 'Confirming...'}
            </>
          ) : (
            'Submit Report'
          )}
        </button>
      </form>

      <div
        className="glass mt-4"
        style={{
          padding: 'var(--space-3)',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid var(--info)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--info)',
          fontSize: '0.75rem'
        }}
      >
        Note: In production, all data will be encrypted using FHE before submission.
      </div>
    </div>
  );
}

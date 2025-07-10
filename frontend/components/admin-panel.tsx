'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

export function AdminPanel() {
  const { address } = useAccount();

  const { data: admin } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'admin',
  });

  const { data: isAuthorized } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'authorizedReporters',
    args: address ? [address] : undefined,
  });

  const isAdmin = admin && address && admin.toLowerCase() === address.toLowerCase();

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
        Status
      </h2>

      <div className="space-y-3">
        <div
          className="glass"
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)'
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
            Role
          </div>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--accent)',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--accent)'
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color: 'var(--accent)',
                    fontWeight: 600
                  }}
                >
                  Administrator
                </span>
              </>
            ) : isAuthorized ? (
              <>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--success)',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--success)'
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color: 'var(--success)',
                    fontWeight: 600
                  }}
                >
                  Authorized Reporter
                </span>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: 'var(--color-border-strong)',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-block'
                  }}
                />
                <span
                  className="font-medium"
                  style={{
                    color: 'var(--color-text-muted)',
                    fontWeight: 600
                  }}
                >
                  Viewer
                </span>
              </>
            )}
          </div>
        </div>

        <div
          className="glass"
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)'
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
            Network
          </div>
          <div
            className="font-medium"
            style={{
              color: 'var(--color-text)',
              fontWeight: 600
            }}
          >
            Sepolia Testnet
          </div>
        </div>

        <div
          className="glass"
          style={{
            padding: 'var(--space-3)',
            background: 'var(--color-panel-alt)',
            transition: 'var(--transition-default)'
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
            Contract
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono break-all"
            style={{
              color: 'var(--accent)',
              textDecoration: 'none',
              transition: 'var(--transition-default)',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--accent-hover)';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--accent)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            View on Etherscan →
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/contract';
import { LoadingSpinner } from './loading-spinner';

interface Transaction {
  hash: string;
  blockNumber: bigint;
  timestamp: number;
  from: string;
  to: string;
}

export function TransactionHistory() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!address || !publicClient) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const latestBlock = await publicClient.getBlockNumber();
        const fromBlock = latestBlock - 1000n > 0n ? latestBlock - 1000n : 0n;

        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS,
          fromBlock,
          toBlock: latestBlock,
        });

        const txs = logs.slice(0, 10).map((log) => ({
          hash: log.transactionHash || '',
          blockNumber: log.blockNumber || 0n,
          timestamp: Date.now(),
          from: address,
          to: CONTRACT_ADDRESS,
        }));

        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address, publicClient]);

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
        Recent Transactions
      </h2>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : transactions.length === 0 ? (
        <div
          className="text-center py-8"
          style={{
            color: 'var(--color-text-muted)'
          }}
        >
          No transactions found
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.hash}
              className="glass"
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-panel-alt)',
                transition: 'var(--transition-default)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.background = 'rgba(16, 20, 36, 0.98)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 110, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.background = 'var(--color-panel-alt)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div
                    className="font-mono text-sm mb-1"
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 500
                    }}
                  >
                    {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.05em'
                    }}
                  >
                    Block #{tx.blockNumber.toString()}
                  </div>
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm"
                  style={{
                    color: 'var(--accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    transition: 'var(--transition-default)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--accent)',
                    background: 'transparent',
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 110, 255, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { CONTRACT_CONFIG } from '@/lib/constants';

interface NetworkInfoProps {
  chainId: number;
}

export function NetworkInfo({ chainId }: NetworkInfoProps) {
  if (!chainId) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 px-6 py-4 rounded-xl">
      <h3 className="text-blue-800 font-semibold mb-3">Network Information</h3>
      <p className="text-blue-700">
        <strong>Network:</strong> {CONTRACT_CONFIG.networkName} (Chain ID: {chainId})
      </p>
      <p className="text-blue-700 break-all">
        <strong>Contract:</strong> {CONTRACT_CONFIG.contractAddress}
      </p>
    </div>
  );
}

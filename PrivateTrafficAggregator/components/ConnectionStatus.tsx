'use client';

import { ConnectionStatus as ConnectionStatusType } from '@/types';
import { formatAddress } from '@/lib/utils';

interface ConnectionStatusProps {
  status: ConnectionStatusType;
}

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return (
    <div
      className={`flex items-center gap-3 px-6 py-4 rounded-xl font-medium ${
        status.connected
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      <span
        className={`w-3 h-3 rounded-full animate-pulse-slow ${
          status.connected ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span>
        {status.connected && status.account
          ? `Connected: ${formatAddress(status.account)}`
          : status.message || 'Disconnected from Web3'}
      </span>
    </div>
  );
}

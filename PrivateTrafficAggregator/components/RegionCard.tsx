'use client';

import { RegionData } from '@/hooks/useRegions';
import { formatDate } from '@/lib/utils';

interface RegionCardProps {
  region: RegionData;
}

export function RegionCard({ region }: RegionCardProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-transparent hover:border-blue-500 transition-all duration-300 hover:-translate-y-1">
      <h4 className="text-gray-800 font-semibold text-lg mb-3">{region.name}</h4>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Reports This Cycle:</span>
          <span className="font-bold text-gray-800">{region.stats.reportCount}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Last Update:</span>
          <span className="font-bold text-gray-800 text-right">
            {formatDate(region.stats.lastUpdate)}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span
            className={`font-bold ${
              region.isRegistered
                ? region.stats.isActive
                  ? 'text-green-600'
                  : 'text-yellow-600'
                : 'text-gray-400'
            }`}
          >
            {region.isRegistered
              ? region.stats.isActive
                ? 'Active'
                : 'Inactive'
              : 'Not Registered'}
          </span>
        </div>
      </div>
    </div>
  );
}

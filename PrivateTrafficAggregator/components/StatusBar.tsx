'use client';

import { CycleInfo } from '@/types';
import { formatTime } from '@/lib/utils';

interface StatusBarProps {
  cycleInfo: CycleInfo;
  totalReports: number;
  activeRegions: number;
}

export function StatusBar({ cycleInfo, totalReports, activeRegions }: StatusBarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Current Cycle</div>
          <div className="text-2xl font-bold text-gray-800">{cycleInfo.currentCycle || '-'}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Time Remaining</div>
          <div className="text-2xl font-bold text-gray-800">
            {cycleInfo.timeRemaining ? formatTime(cycleInfo.timeRemaining) : '-'}
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total Reports</div>
          <div className="text-2xl font-bold text-gray-800">{totalReports}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Active Regions</div>
          <div className="text-2xl font-bold text-gray-800">{activeRegions}</div>
        </div>
      </div>
    </div>
  );
}

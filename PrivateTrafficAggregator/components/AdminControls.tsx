'use client';

import { useState } from 'react';
import { isValidEthereumAddress } from '@/lib/utils';
import { VALIDATION_LIMITS, DEFAULT_REGIONS } from '@/lib/constants';

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

export function AdminControls({
  isAdmin,
  isRegistering,
  isAuthorizing,
  onRegisterRegion,
  onAuthorizeReporter,
  onSetCycleInterval,
  onFinalizeCycle,
  onRegisterAllDefaultRegions
}: AdminControlsProps) {
  const [newRegion, setNewRegion] = useState('');
  const [reporterAddress, setReporterAddress] = useState('');
  const [cycleInterval, setCycleInterval] = useState(3600);

  const handleRegisterRegion = () => {
    if (newRegion.trim()) {
      onRegisterRegion(newRegion.trim());
      setNewRegion('');
    }
  };

  const handleAuthorizeReporter = () => {
    if (isValidEthereumAddress(reporterAddress)) {
      onAuthorizeReporter(reporterAddress);
      setReporterAddress('');
    }
  };

  const handleSetCycleInterval = () => {
    if (cycleInterval >= VALIDATION_LIMITS.MIN_CYCLE_INTERVAL &&
        cycleInterval <= VALIDATION_LIMITS.MAX_CYCLE_INTERVAL) {
      onSetCycleInterval(cycleInterval);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-red-500">
        Admin Controls
      </h2>

      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 text-sm">
        Admin functions require contract owner privileges
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="newRegion" className="block text-gray-700 font-semibold mb-2">
            Register New Region:
          </label>
          <input
            type="text"
            id="newRegion"
            value={newRegion}
            onChange={(e) => setNewRegion(e.target.value)}
            placeholder="Enter region name (e.g., Downtown, Highway-A1)"
            disabled={!isAdmin}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleRegisterRegion}
            disabled={!isAdmin || isRegistering || !newRegion.trim()}
            className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isRegistering ? 'Registering...' : 'Register Region'}
          </button>
        </div>

        <div>
          <label htmlFor="reporterAddress" className="block text-gray-700 font-semibold mb-2">
            Authorize Reporter:
          </label>
          <input
            type="text"
            id="reporterAddress"
            value={reporterAddress}
            onChange={(e) => setReporterAddress(e.target.value)}
            placeholder="0x... (Ethereum address)"
            disabled={!isAdmin}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleAuthorizeReporter}
            disabled={!isAdmin || isAuthorizing || !isValidEthereumAddress(reporterAddress)}
            className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isAuthorizing ? 'Authorizing...' : 'Authorize Reporter'}
          </button>
        </div>

        <div>
          <label htmlFor="cycleInterval" className="block text-gray-700 font-semibold mb-2">
            Cycle Interval (seconds):
          </label>
          <input
            type="number"
            id="cycleInterval"
            value={cycleInterval}
            onChange={(e) => setCycleInterval(Number(e.target.value))}
            min={VALIDATION_LIMITS.MIN_CYCLE_INTERVAL}
            max={VALIDATION_LIMITS.MAX_CYCLE_INTERVAL}
            placeholder="3600 (1 hour)"
            disabled={!isAdmin}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleSetCycleInterval}
            disabled={!isAdmin}
            className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            Update Interval
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onRegisterAllDefaultRegions}
            disabled={!isAdmin}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            Register All Default Regions
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onFinalizeCycle}
            disabled={!isAdmin}
            className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300"
          >
            Finalize Current Cycle
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { RegionData } from '@/hooks/useRegions';
import { TrafficReport } from '@/types';
import { DEFAULT_VALUES } from '@/lib/constants';

interface ReportFormProps {
  regions: RegionData[];
  isSubmitting: boolean;
  onSubmit: (report: TrafficReport) => void;
}

export function ReportForm({ regions, isSubmitting, onSubmit }: ReportFormProps) {
  const [region, setRegion] = useState('');
  const [congestionLevel, setCongestionLevel] = useState(DEFAULT_VALUES.CONGESTION_LEVEL);
  const [vehicleCount, setVehicleCount] = useState(DEFAULT_VALUES.VEHICLE_COUNT);
  const [averageSpeed, setAverageSpeed] = useState(DEFAULT_VALUES.AVERAGE_SPEED);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      region,
      congestionLevel,
      vehicleCount,
      averageSpeed
    });
  };

  const registeredRegions = regions.filter(r => r.isRegistered);

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-500">
        Submit Traffic Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="region" className="block text-gray-700 font-semibold mb-2">
            Select Region:
          </label>
          <select
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="">Choose a region...</option>
            {registeredRegions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
            {registeredRegions.length === 0 && (
              <option disabled>No regions registered yet</option>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="congestionLevel" className="block text-gray-700 font-semibold mb-2">
            Congestion Level: <span className="text-blue-600 font-bold">{congestionLevel}%</span>
          </label>
          <input
            type="range"
            id="congestionLevel"
            min="0"
            max="100"
            value={congestionLevel}
            onChange={(e) => setCongestionLevel(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        <div>
          <label htmlFor="vehicleCount" className="block text-gray-700 font-semibold mb-2">
            Vehicle Count (estimated):
          </label>
          <input
            type="number"
            id="vehicleCount"
            min="0"
            max="255"
            value={vehicleCount}
            onChange={(e) => setVehicleCount(Number(e.target.value))}
            placeholder="Enter estimated vehicle count"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="averageSpeed" className="block text-gray-700 font-semibold mb-2">
            Average Speed (km/h):
          </label>
          <input
            type="number"
            id="averageSpeed"
            min="0"
            max="300"
            value={averageSpeed}
            onChange={(e) => setAverageSpeed(Number(e.target.value))}
            placeholder="Enter average speed"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || registeredRegions.length === 0}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin-slow"></span>
              Encrypting & Submitting...
            </span>
          ) : (
            'Submit Encrypted Report'
          )}
        </button>
      </form>
    </div>
  );
}

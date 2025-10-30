'use client';

import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { RegionStats } from '@/types';
import { DEFAULT_REGIONS } from '@/lib/constants';

export interface RegionData {
  name: string;
  stats: RegionStats;
  isRegistered: boolean;
}

export function useRegions(contract: Contract | null, currentCycle: number) {
  const [regions, setRegions] = useState<RegionData[]>([]);
  const [registeredRegions, setRegisteredRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const loadRegions = useCallback(async () => {
    if (!contract) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      let contractRegions: string[] = [];
      try {
        contractRegions = await contract.getRegisteredRegions();
        setRegisteredRegions(contractRegions);
      } catch (err) {
        console.warn('Failed to load regions from contract:', err);
        setError('Unable to load regions from contract');
      }

      const allRegions = [...new Set([...contractRegions, ...DEFAULT_REGIONS])];
      const regionDataPromises = allRegions.map(async (regionName) => {
        const isRegistered = contractRegions.includes(regionName);
        let stats: RegionStats = {
          reportCount: 0,
          lastUpdate: 0,
          isActive: false
        };

        if (isRegistered && currentCycle > 0) {
          try {
            const result = await contract.getRegionStats(regionName, currentCycle);
            stats = {
              reportCount: Number(result[0]),
              lastUpdate: Number(result[1]),
              isActive: result[2]
            };
          } catch (err) {
            console.error(`Failed to load stats for ${regionName}:`, err);
          }
        }

        return {
          name: regionName,
          stats,
          isRegistered
        };
      });

      const regionData = await Promise.all(regionDataPromises);
      setRegions(regionData);
    } catch (err: any) {
      console.error('Failed to load regions:', err);
      setError(err.message || 'Failed to load regions');
    } finally {
      setLoading(false);
    }
  }, [contract, currentCycle]);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  const totalReports = regions.reduce((sum, region) => sum + region.stats.reportCount, 0);
  const activeRegions = regions.filter(region => region.isRegistered).length;

  return {
    regions,
    registeredRegions,
    totalReports,
    activeRegions,
    loading,
    error,
    reload: loadRegions
  };
}

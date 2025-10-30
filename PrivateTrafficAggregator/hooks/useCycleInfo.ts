'use client';

import { useState, useEffect, useCallback } from 'react';
import { Contract } from 'ethers';
import { CycleInfo } from '@/types';
import { UPDATE_INTERVALS } from '@/lib/constants';

export function useCycleInfo(contract: Contract | null) {
  const [cycleInfo, setCycleInfo] = useState<CycleInfo>({
    currentCycle: 0,
    timeRemaining: 0,
    cycleStartTime: 0
  });
  const [loading, setLoading] = useState(true);

  const updateCycleInfo = useCallback(async () => {
    if (!contract) {
      setLoading(false);
      return;
    }

    try {
      const info = await contract.getCurrentCycleInfo();
      setCycleInfo({
        currentCycle: Number(info[0]),
        timeRemaining: Number(info[1]),
        cycleStartTime: Number(info[2])
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to update cycle info:', error);
      setLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    updateCycleInfo();

    const interval = setInterval(() => {
      updateCycleInfo();
    }, UPDATE_INTERVALS.CYCLE_INFO);

    return () => clearInterval(interval);
  }, [updateCycleInfo]);

  return {
    cycleInfo,
    loading,
    refresh: updateCycleInfo
  };
}

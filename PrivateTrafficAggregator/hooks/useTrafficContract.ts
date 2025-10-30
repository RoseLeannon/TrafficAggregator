'use client';

import { useState, useCallback } from 'react';
import { Contract } from 'ethers';
import { TrafficReport } from '@/types';
import { parseContractError, validateTrafficReport } from '@/lib/utils';

export function useTrafficContract(contract: Contract | null, account: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const submitReport = useCallback(async (
    report: TrafficReport,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    const validation = validateTrafficReport(report);
    if (!validation.valid) {
      onError?.(validation.error || 'Invalid report data');
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if region is registered
      const registeredRegions = await contract.getRegisteredRegions();
      if (!registeredRegions.includes(report.region)) {
        throw new Error(`Region "${report.region}" is not registered in the contract. Please ask an admin to register it first.`);
      }

      // Check if already reported this cycle
      const cycleInfo = await contract.getCurrentCycleInfo();
      const currentCycle = Number(cycleInfo[0]);
      const hasReported = await contract.hasReported(report.region, account, currentCycle);

      if (hasReported) {
        throw new Error('You have already reported for this region in the current cycle');
      }

      // Submit the report
      const tx = await contract.submitTrafficReport(
        report.region,
        report.congestionLevel,
        report.vehicleCount,
        report.averageSpeed
      );

      await tx.wait();

      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to submit report:', error);
      onError?.(parseContractError(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [contract, account]);

  const registerRegion = useCallback(async (
    regionName: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    if (!regionName.trim()) {
      onError?.('Please enter a region name');
      return;
    }

    setIsRegistering(true);

    try {
      const tx = await contract.registerRegion(regionName.trim());
      await tx.wait();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to register region:', error);
      onError?.(parseContractError(error));
    } finally {
      setIsRegistering(false);
    }
  }, [contract]);

  const authorizeReporter = useCallback(async (
    address: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    setIsAuthorizing(true);

    try {
      const tx = await contract.authorizeReporter(address);
      await tx.wait();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to authorize reporter:', error);
      onError?.(parseContractError(error));
    } finally {
      setIsAuthorizing(false);
    }
  }, [contract]);

  const setCycleInterval = useCallback(async (
    interval: number,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    if (interval < 300 || interval > 86400) {
      onError?.('Interval must be between 300 and 86400 seconds');
      return;
    }

    try {
      const tx = await contract.setCycleInterval(interval);
      await tx.wait();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to set cycle interval:', error);
      onError?.(parseContractError(error));
    }
  }, [contract]);

  const finalizeCycle = useCallback(async (
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    try {
      const tx = await contract.manuallyFinalizeCycle();
      await tx.wait();
      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to finalize cycle:', error);
      onError?.(parseContractError(error));
    }
  }, [contract]);

  const registerAllDefaultRegions = useCallback(async (
    defaultRegions: string[],
    onProgress?: (current: number, total: number, region: string) => void,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) => {
    if (!contract) {
      onError?.('Contract not connected');
      return;
    }

    try {
      const existingRegions = await contract.getRegisteredRegions();
      const regionsToRegister = defaultRegions.filter(region => !existingRegions.includes(region));

      if (regionsToRegister.length === 0) {
        onError?.('All default regions are already registered!');
        return;
      }

      for (let i = 0; i < regionsToRegister.length; i++) {
        const region = regionsToRegister[i];
        onProgress?.(i + 1, regionsToRegister.length, region);

        try {
          const tx = await contract.registerRegion(region);
          await tx.wait();
        } catch (error: any) {
          console.error(`Failed to register region ${region}:`, error);
        }
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Failed to register default regions:', error);
      onError?.(parseContractError(error));
    }
  }, [contract]);

  return {
    submitReport,
    registerRegion,
    authorizeReporter,
    setCycleInterval,
    finalizeCycle,
    registerAllDefaultRegions,
    isSubmitting,
    isRegistering,
    isAuthorizing
  };
}

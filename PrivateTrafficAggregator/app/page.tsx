'use client';

import { useState, useCallback } from 'react';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { NetworkInfo } from '@/components/NetworkInfo';
import { StatusBar } from '@/components/StatusBar';
import { ReportForm } from '@/components/ReportForm';
import { AdminControls } from '@/components/AdminControls';
import { RegionList } from '@/components/RegionList';
import { useWallet } from '@/hooks/useWallet';
import { useTrafficContract } from '@/hooks/useTrafficContract';
import { useRegions } from '@/hooks/useRegions';
import { useCycleInfo } from '@/hooks/useCycleInfo';
import { TrafficReport, MessageType } from '@/types';
import { DEFAULT_REGIONS, DEFAULT_VALUES } from '@/lib/constants';

export default function Home() {
  const [messages, setMessages] = useState<MessageType[]>([]);

  const { contract, account, chainId, status, isAdmin } = useWallet();
  const { cycleInfo } = useCycleInfo(contract);
  const { regions, totalReports, activeRegions, reload: reloadRegions } = useRegions(
    contract,
    cycleInfo.currentCycle
  );

  const {
    submitReport,
    registerRegion,
    authorizeReporter,
    setCycleInterval,
    finalizeCycle,
    registerAllDefaultRegions,
    isSubmitting,
    isRegistering,
    isAuthorizing
  } = useTrafficContract(contract, account);

  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info') => {
    const message: MessageType = {
      text,
      type,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, message]);

    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
    }, 10000);
  }, []);

  const handleSubmitReport = useCallback((report: TrafficReport) => {
    submitReport(
      report,
      () => {
        showMessage(
          'Traffic report submitted successfully! Your data has been encrypted and added to the aggregation.',
          'success'
        );
        reloadRegions();
      },
      (error) => {
        showMessage(`Failed to submit report: ${error}`, 'error');
      }
    );
  }, [submitReport, showMessage, reloadRegions]);

  const handleRegisterRegion = useCallback((regionName: string) => {
    registerRegion(
      regionName,
      () => {
        showMessage(`Region "${regionName}" registered successfully!`, 'success');
        reloadRegions();
      },
      (error) => {
        showMessage(`Failed to register region: ${error}`, 'error');
      }
    );
  }, [registerRegion, showMessage, reloadRegions]);

  const handleAuthorizeReporter = useCallback((address: string) => {
    authorizeReporter(
      address,
      () => {
        showMessage('Reporter authorized successfully!', 'success');
      },
      (error) => {
        showMessage(`Failed to authorize reporter: ${error}`, 'error');
      }
    );
  }, [authorizeReporter, showMessage]);

  const handleSetCycleInterval = useCallback((interval: number) => {
    setCycleInterval(
      interval,
      () => {
        showMessage('Cycle interval updated successfully!', 'success');
      },
      (error) => {
        showMessage(`Failed to update interval: ${error}`, 'error');
      }
    );
  }, [setCycleInterval, showMessage]);

  const handleFinalizeCycle = useCallback(() => {
    finalizeCycle(
      () => {
        showMessage('Cycle finalized successfully!', 'success');
        reloadRegions();
      },
      (error) => {
        showMessage(`Failed to finalize cycle: ${error}`, 'error');
      }
    );
  }, [finalizeCycle, showMessage, reloadRegions]);

  const handleRegisterAllDefaultRegions = useCallback(() => {
    registerAllDefaultRegions(
      DEFAULT_REGIONS,
      (current, total, region) => {
        showMessage(`Registering region ${current}/${total}: ${region}...`, 'info');
      },
      () => {
        showMessage('Finished registering default regions!', 'success');
        reloadRegions();
      },
      (error) => {
        showMessage(`Failed to register default regions: ${error}`, 'error');
      }
    );
  }, [registerAllDefaultRegions, showMessage, reloadRegions]);

  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 mb-8 text-center shadow-lg">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
          Private Traffic Analytics
        </h1>
        <p className="text-lg text-gray-600">
          Confidential traffic data aggregation using FHEVM encryption
        </p>
      </div>

      {/* Connection Status */}
      <div className="mb-6">
        <ConnectionStatus status={status} />
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="mb-6 space-y-2">
          {messages.map((message) => (
            <div
              key={message.timestamp}
              className={`px-6 py-4 rounded-xl border message-enter ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : message.type === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {message.text}
            </div>
          ))}
        </div>
      )}

      {/* Network Info */}
      {chainId > 0 && (
        <div className="mb-8">
          <NetworkInfo chainId={chainId} />
        </div>
      )}

      {/* Status Bar */}
      <div className="mb-8">
        <StatusBar
          cycleInfo={cycleInfo}
          totalReports={totalReports}
          activeRegions={activeRegions}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Report Form */}
        <ReportForm
          regions={regions}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmitReport}
        />

        {/* Admin Controls */}
        <AdminControls
          isAdmin={isAdmin}
          isRegistering={isRegistering}
          isAuthorizing={isAuthorizing}
          onRegisterRegion={handleRegisterRegion}
          onAuthorizeReporter={handleAuthorizeReporter}
          onSetCycleInterval={handleSetCycleInterval}
          onFinalizeCycle={handleFinalizeCycle}
          onRegisterAllDefaultRegions={handleRegisterAllDefaultRegions}
        />
      </div>

      {/* Regional Traffic Overview */}
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-500">
          Regional Traffic Overview
        </h2>
        <RegionList regions={regions} loading={false} />
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, JsonRpcSigner, Contract } from 'ethers';
import { TRAFFIC_AGGREGATOR_ABI } from '@/lib/abi';
import { CONTRACT_CONFIG } from '@/lib/constants';
import { ConnectionStatus } from '@/types';

export function useWallet() {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [account, setAccount] = useState<string>('');
  const [chainId, setChainId] = useState<number>(0);
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    message: 'Connecting to wallet...'
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not detected. Please install MetaMask to continue.');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const web3Provider = new BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const userAccount = await web3Signer.getAddress();
      const network = await web3Provider.getNetwork();

      const contractInstance = new Contract(
        CONTRACT_CONFIG.contractAddress,
        TRAFFIC_AGGREGATOR_ABI,
        web3Signer
      );

      setProvider(web3Provider);
      setSigner(web3Signer);
      setContract(contractInstance);
      setAccount(userAccount);
      setChainId(Number(network.chainId));
      setStatus({
        connected: true,
        account: userAccount
      });

      // Check admin status
      try {
        const adminAddress = await contractInstance.admin();
        setIsAdmin(adminAddress.toLowerCase() === userAccount.toLowerCase());
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }

    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      setStatus({
        connected: false,
        message: error.message || 'Failed to connect wallet'
      });
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount('');
    setChainId(0);
    setIsAdmin(false);
    setStatus({
      connected: false,
      message: 'Wallet disconnected'
    });
  }, []);

  useEffect(() => {
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet, disconnectWallet]);

  return {
    provider,
    signer,
    contract,
    account,
    chainId,
    status,
    isAdmin,
    connectWallet,
    disconnectWallet
  };
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return "Cycle ending...";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp || timestamp === 0) return 'No data';
  return new Date(timestamp * 1000).toLocaleString();
}

export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export function validateTrafficReport(data: {
  region: string;
  congestionLevel: number;
  vehicleCount: number;
  averageSpeed: number;
}): { valid: boolean; error?: string } {
  if (!data.region || data.region.trim() === '') {
    return { valid: false, error: 'Please select a region' };
  }

  if (isNaN(data.congestionLevel) || data.congestionLevel < 0 || data.congestionLevel > 100) {
    return { valid: false, error: 'Congestion level must be between 0 and 100' };
  }

  if (isNaN(data.vehicleCount) || data.vehicleCount < 0 || data.vehicleCount > 255) {
    return { valid: false, error: 'Vehicle count must be between 0 and 255' };
  }

  if (isNaN(data.averageSpeed) || data.averageSpeed < 0 || data.averageSpeed > 300) {
    return { valid: false, error: 'Speed must be between 0 and 300 km/h' };
  }

  return { valid: true };
}

export function parseContractError(error: any): string {
  const message = error?.message || error?.toString() || 'Unknown error';

  if (message.includes('Not authorized reporter')) {
    return 'You are not authorized to submit reports. Contact the admin for authorization.';
  } else if (message.includes('Invalid region')) {
    return 'Invalid region selected.';
  } else if (message.includes('Already reported')) {
    return 'You have already reported for this region in the current cycle.';
  } else if (message.includes('user rejected')) {
    return 'Transaction was rejected by user.';
  } else if (message.includes('insufficient funds')) {
    return 'Insufficient funds to complete transaction.';
  }

  return message;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

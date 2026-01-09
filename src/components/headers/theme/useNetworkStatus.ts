import { useState, useEffect, useCallback } from 'react';

export type ConnectionQuality = 'excellent' | 'good' | 'weak' | 'offline';

interface NetworkInfo {
  quality: ConnectionQuality;
  isOnline: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
}

// Extend Navigator interface for Network Information API
interface NetworkInformation {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export function useNetworkStatus(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    quality: 'good',
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: null,
    downlink: null,
    rtt: null,
  });

  const getConnectionQuality = useCallback((): ConnectionQuality => {
    if (!navigator.onLine) return 'offline';

    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (!connection) {
      // Fallback: if no Network Information API, do a simple latency test
      return navigator.onLine ? 'good' : 'offline';
    }

    const { effectiveType, downlink, rtt } = connection;

    // Determine quality based on effective type and metrics
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 'weak';
    }

    if (effectiveType === '3g') {
      // 3G can be good or weak depending on actual speed
      if (downlink < 1 || rtt > 400) {
        return 'weak';
      }
      return 'good';
    }

    if (effectiveType === '4g') {
      // 4G quality based on actual metrics
      if (downlink >= 10 && rtt < 100) {
        return 'excellent';
      }
      if (downlink >= 2 && rtt < 300) {
        return 'good';
      }
      if (downlink < 2 || rtt > 300) {
        return 'weak';
      }
      return 'good';
    }

    return 'good';
  }, []);

  const updateNetworkInfo = useCallback(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    setNetworkInfo({
      quality: getConnectionQuality(),
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || null,
      downlink: connection?.downlink || null,
      rtt: connection?.rtt || null,
    });
  }, [getConnectionQuality]);

  useEffect(() => {
    // Initial update
    updateNetworkInfo();

    // Listen for online/offline events
    const handleOnline = () => updateNetworkInfo();
    const handleOffline = () => {
      setNetworkInfo(prev => ({
        ...prev,
        quality: 'offline',
        isOnline: false,
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for connection changes (Network Information API)
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    // Periodic check for connection quality (every 30 seconds)
    const intervalId = setInterval(updateNetworkInfo, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
      
      clearInterval(intervalId);
    };
  }, [updateNetworkInfo]);

  return networkInfo;
}

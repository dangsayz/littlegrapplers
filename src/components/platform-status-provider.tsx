'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { type PlatformStatusData } from '@/lib/site-status';
import { PLATFORM_CONFIG } from '@/lib/constants';

interface PlatformStatusContextType {
  status: PlatformStatusData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const PlatformStatusContext = createContext<PlatformStatusContextType>({
  status: null,
  isLoading: true,
  error: null,
  refetch: async () => {},
});

export function usePlatformStatus() {
  return useContext(PlatformStatusContext);
}

interface PlatformStatusProviderProps {
  children: ReactNode;
  initialStatus?: PlatformStatusData | null;
}

export function PlatformStatusProvider({ children, initialStatus }: PlatformStatusProviderProps) {
  const [status, setStatus] = useState<PlatformStatusData | null>(initialStatus || null);
  const [isLoading, setIsLoading] = useState(!initialStatus);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const res = await fetch('/api/admin/platform', {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch platform status');
      }

      const data = await res.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStatus) {
      fetchStatus();
    }

    const interval = setInterval(fetchStatus, PLATFORM_CONFIG.statusCheckIntervalMs);
    return () => clearInterval(interval);
  }, [initialStatus]);

  return (
    <PlatformStatusContext.Provider value={{ status, isLoading, error, refetch: fetchStatus }}>
      {children}
    </PlatformStatusContext.Provider>
  );
}

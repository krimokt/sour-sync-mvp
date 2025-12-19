'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface MagicLinkData {
  magicLinkId: string;
  companyId: string;
  clientId: string;
  companyName: string;
  clientName: string;
  clientPhone: string;
  scopes: string[];
}

interface MagicLinkContextType {
  data: MagicLinkData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const MagicLinkContext = createContext<MagicLinkContextType | undefined>(undefined);

export function useMagicLink() {
  const context = useContext(MagicLinkContext);
  if (!context) {
    throw new Error('useMagicLink must be used within MagicLinkProvider');
  }
  return context;
}

interface MagicLinkProviderProps {
  children: React.ReactNode;
  token: string;
  initialData?: MagicLinkData | null;
}

export function MagicLinkProvider({ children, token, initialData }: MagicLinkProviderProps) {
  const [data, setData] = useState<MagicLinkData | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/c/${token}/validate`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to validate token');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!initialData) {
      refresh();
    }
  }, [initialData, refresh]);

  return (
    <MagicLinkContext.Provider value={{ data, isLoading, error, refresh }}>
      {children}
    </MagicLinkContext.Provider>
  );
}


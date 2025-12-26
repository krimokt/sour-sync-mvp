'use client';

import React, { createContext, useContext } from 'react';

interface MagicLinkData {
  magicLinkId: string;
  companyId: string;
  clientId: string;
  companyName: string;
  clientName: string;
  clientPhone: string;
  scopes: string[];
  company?: unknown;
  client?: unknown;
  quotationCountries?: string[] | null;
}

interface MagicLinkContextType {
  data: MagicLinkData;
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
  initialData: MagicLinkData;
}

export function MagicLinkProvider({ children, initialData }: MagicLinkProviderProps) {
  return (
    <MagicLinkContext.Provider value={{ data: initialData }}>
      {children}
    </MagicLinkContext.Provider>
  );
}



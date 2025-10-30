'use client'

import { wagmiAdapter, projectId } from '@/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

const queryClient = new QueryClient();

if (!projectId) {
  console.warn('Project ID is not defined');
}

const metadata = {
  name: 'tales-of-the-chains',
  description: 'Tales Of The Chains',
  url: 'http://localhost:5000',
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId || 'demo',
  networks: [mainnet],
  defaultNetwork: mainnet,
  metadata,
  features: { analytics: false }
});

export default function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies || undefined);
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}



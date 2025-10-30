import { cookieStorage, createStorage, http } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet } from '@reown/appkit/networks';

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string | undefined;
if (!projectId) {
  console.warn('NEXT_PUBLIC_PROJECT_ID is not set');
}

export const networks = [mainnet];

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  projectId: projectId || 'demo',
  networks,
  transports: {
    [mainnet.id]: http()
  }
});

export const config = wagmiAdapter.wagmiConfig;



import { createPublicClient, http, custom, formatEther, type Address } from 'viem';

function getTransport() {
  if (typeof window !== 'undefined' && (window as any).ethereum) {
    return custom((window as any).ethereum);
  }
  const rpc = process.env.NEXT_PUBLIC_RPC_URL || 'https://cloudflare-eth.com';
  return http(rpc);
}

export function getPublicClient() {
  return createPublicClient({ transport: getTransport() });
}

function symbolForChainId(chainId: number): string {
  const map: Record<number, string> = {
    1: 'ETH', // Ethereum
    10: 'ETH', // Optimism
    137: 'MATIC', // Polygon
    8453: 'ETH', // Base
    42161: 'ETH', // Arbitrum
    11155111: 'ETH', // Sepolia
  };
  return map[chainId] || 'ETH';
}

export async function getNativeBalanceLabel(address: string): Promise<string> {
  const client = getPublicClient();
  const [chainId, balance] = await Promise.all([
    client.getChainId(),
    client.getBalance({ address: address as Address })
  ]);
  const sym = symbolForChainId(chainId);
  const eth = Number(formatEther(balance));
  return `${eth.toFixed(3)} ${sym}`;
}



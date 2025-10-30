import { createPublicClient, http } from 'viem';

// Placeholder to demonstrate preferred library usage (viem)
async function main() {
  const rpc = process.env.RPC_URL || 'http://localhost:8545';
  const client = createPublicClient({ transport: http(rpc) });
  const blockNumber = await client.getBlockNumber();
  console.log('Connected via viem. Block number:', blockNumber);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});



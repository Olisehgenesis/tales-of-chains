export default function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{color:'var(--color-accent-1)'}}>How it works</h1>
      <ol className="space-y-4 list-decimal list-inside text-zinc-200">
        <li>
          Connect your wallet using the button below. This creates a session (no on-chain action yet).
        </li>
        <li>
          Create up to three characters. Each must have 3–5 superpowers and 1–2 weaknesses. Powers can’t overlap weaknesses.
        </li>
        <li>
          Generate an AI preview (text + image), then save your character. NFT minting will arrive later.
        </li>
        <li>
          Start a battle. Our AI Supreme "Cookie" narrates stages in random universes, sending timed messages. Battles end with outcomes like WOUNDED, SLAIN, RESURRECTED, or VICTORIOUS.
        </li>
        <li>
          Subscribed webhooks receive live battle events for integrations.
        </li>
      </ol>
      <div>
        <a href="/battles" className="btn-primary">Start a Battle</a>
      </div>
    </div>
  );
}



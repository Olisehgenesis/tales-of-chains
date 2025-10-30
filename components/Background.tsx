"use client";

import { useEffect, useMemo, useState } from 'react';

function hashPath(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = ((h << 5) - h) + path.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export default function Background() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const pick = () => {
        const isLarge = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(min-width: 768px)').matches; // md breakpoint
        const idx = (hashPath(location.pathname) % 3) + 1; // 1..3
        if (isLarge) {
          setUrl('/winbghd.jpg');
        } else {
          if (idx === 1) setUrl('/andbg1.png');
          if (idx === 2) setUrl('/andbg2.jpg');
          if (idx === 3) setUrl('/andbg3.jpg');
        }
      };
      pick();
      const mql = window.matchMedia('(min-width: 768px)');
      const listener = () => pick();
      mql.addEventListener?.('change', listener);
      return () => mql.removeEventListener?.('change', listener);
    } catch {}
  }, []);

  const style = useMemo(() => (
    url ? {
      position: 'fixed' as const,
      inset: 0,
      zIndex: -1,
      backgroundImage: `url(${url})`,
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      pointerEvents: 'none' as const,
    } : undefined
  ), [url]);

  if (!style) return null;
  return <div aria-hidden style={style} />;
}



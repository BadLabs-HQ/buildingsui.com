import { useEffect, useState } from 'react';
import { readJSON, writeJSON } from './storage';

export type MarketStats = {
  priceUsd: number;
  // Price in the pool's quote token (SUI for a BUILD/SUI pool).
  priceNative: number;
  quoteSymbol: string;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  liquidityUsd: number | null;
  pairAddress: string;
  pairUrl: string;
  dexId: string;
  fetchedAt: number;
};

type DexPair = {
  dexId: string;
  url: string;
  pairAddress: string;
  priceUsd?: string;
  priceNative?: string;
  quoteToken?: { symbol?: string };
  priceChange?: { h24?: number };
  volume?: { h24?: number };
  liquidity?: { usd?: number };
  marketCap?: number;
  fdv?: number;
};

const CACHE_KEY = 'build:market:v2';
const REFRESH_MS = 30_000;

async function fetchStats(coinType: string): Promise<MarketStats | null> {
  const res = await fetch(`https://api.dexscreener.com/tokens/v1/sui/${encodeURIComponent(coinType)}`);
  if (!res.ok) throw new Error(`Dexscreener ${res.status}`);
  const pairs = (await res.json()) as DexPair[];
  if (!pairs.length) return null;
  // The deepest pool gives the most honest price.
  const best = [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
  return {
    priceUsd: Number(best.priceUsd ?? 0),
    priceNative: Number(best.priceNative ?? 0),
    quoteSymbol: best.quoteToken?.symbol ?? 'SUI',
    change24h: best.priceChange?.h24 ?? null,
    marketCap: best.marketCap ?? best.fdv ?? null,
    volume24h: pairs.reduce((sum, p) => sum + (p.volume?.h24 ?? 0), 0),
    liquidityUsd: pairs.reduce((sum, p) => sum + (p.liquidity?.usd ?? 0), 0),
    pairAddress: best.pairAddress,
    pairUrl: best.url,
    dexId: best.dexId,
    fetchedAt: Date.now(),
  };
}

// Live stats with a cached fallback, so the numbers never go blank when the API hiccups.
export function useMarketStats(coinType: string) {
  const [stats, setStats] = useState<MarketStats | null>(() => readJSON<MarketStats>(CACHE_KEY));
  const [stale, setStale] = useState(false);

  useEffect(() => {
    if (!coinType) return;
    let alive = true;
    const load = async () => {
      try {
        const next = await fetchStats(coinType);
        if (!alive || !next) return;
        setStats(next);
        setStale(false);
        writeJSON(CACHE_KEY, next);
      } catch {
        if (alive) setStale(true);
      }
    };
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [coinType]);

  return { stats, stale };
}

export function formatUsd(n: number | null | undefined, compact = true) {
  if (n == null) return '...';
  if (n > 0 && n < 0.01) {
    return `$${n.toPrecision(3)}`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: compact ? 'compact' : 'standard',
    maximumFractionDigits: compact ? 2 : 4,
  }).format(n);
}

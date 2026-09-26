import { useEffect, useState } from 'react';
import { TOKEN, isLaunched } from '../config';
import { formatUsd, type MarketStats } from '../lib/dexscreener';

function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const at = target ? Date.parse(target) : NaN;
  if (Number.isNaN(at)) return null;
  const left = Math.max(0, at - now);
  const d = Math.floor(left / 86_400_000);
  const h = Math.floor(left / 3_600_000) % 24;
  const m = Math.floor(left / 60_000) % 60;
  const s = Math.floor(left / 1000) % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return left === 0 ? 'Live' : `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export function StatsBar({ stats, stale }: { stats: MarketStats | null; stale: boolean }) {
  const countdown = useCountdown(TOKEN.launchAt);
  const live = isLaunched();
  const change = stats?.change24h;

  const cells = [
    { label: 'Market cap', value: live ? formatUsd(stats?.marketCap) : 'At launch', note: 'From Dexscreener' },
    { label: '24h volume', value: live ? formatUsd(stats?.volume24h) : 'At launch', note: 'All Sui pools' },
    { label: 'Liquidity', value: live ? formatUsd(stats?.liquidityUsd) : 'At launch', note: 'Pooled on Sui DEXs' },
    {
      label: 'Price change',
      value: live ? (change == null ? '...' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`) : 'At launch',
      note: live ? `Price ${formatUsd(stats?.priceUsd, false)}` : 'Last 24 hours',
      tone: live && change != null ? (change >= 0 ? 'up' : 'down') : '',
    },
    live
      ? { label: 'Status', value: 'Live on Sui', note: 'Contract below', tone: 'up' }
      : { label: 'Launch countdown', value: countdown ?? 'Date TBA', note: countdown ? 'Hard hats on' : 'Announced on X first' },
  ];

  return (
    <>
      <div className="status-line">
        {live
          ? stats
            ? `Market updated ${new Date(stats.fetchedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}${stale ? ' · showing last known numbers' : ''}`
            : 'Connecting to Dexscreener…'
          : 'Before launch · stats switch on the moment $' + TOKEN.ticker + ' is live'}
      </div>
      <section className="stats glass">
        {cells.map((c) => (
          <div className="stat" key={c.label}>
            <span className="stat-label">{c.label}</span>
            <span className={`stat-value ${c.tone ?? ''} ${live ? '' : c.label === 'Launch countdown' ? 'countdown' : 'pending'}`}>
              {c.value}
            </span>
            <span className="stat-note">{c.note}</span>
          </div>
        ))}
      </section>
    </>
  );
}

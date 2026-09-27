import { useState, type ReactNode } from 'react';
import { MARKET, SOCIALS, TOKEN, isLaunched } from '../config';
import { formatUsd, type MarketStats } from '../lib/dexscreener';
import { BuyBox } from './BuyBox';
import { CopyButton } from './CopyButton';
import { Mascot } from './Mascot';

export function CardHead({ icon, title, sub, href }: { icon: ReactNode; title: ReactNode; sub?: string; href?: string }) {
  return (
    <div className="card-head">
      <div className="card-icon">{icon}</div>
      <div className="card-titles">
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {href && (
        <a className="card-ext" href={href} target="_blank" rel="noreferrer" aria-label="Open in a new tab">
          ↗
        </a>
      )}
    </div>
  );
}

// Shown on every data section while another token stands in for $BUILD.
export function PlaceholderBadge() {
  if (!MARKET.placeholder) return null;
  return (
    <span className="placeholder-badge" title={`$${TOKEN.ticker} has not launched. $${MARKET.ticker} data is shown as a stand in.`}>
      Placeholder
    </span>
  );
}

export function ChartCard({ stats }: { stats: MarketStats | null }) {
  const [reload, setReload] = useState(0);
  const live = isLaunched();
  const change = stats?.change24h;

  return (
    <section className="chart-card glass">
      <CardHead
        icon={<Mascot size={40} />}
        title={
          <>
            ${MARKET.ticker} <PlaceholderBadge />
          </>
        }
        sub={`${MARKET.ticker} / ${stats?.quoteSymbol ?? 'SUI'} · Price chart from Dexscreener`}
        href={live ? stats?.pairUrl ?? 'https://dexscreener.com/sui' : undefined}
      />
      <div className="price-line">
        {live ? (
          <>
            <b>{formatUsd(stats?.priceUsd, false)}</b>
            {change != null && <span className={change >= 0 ? 'up' : 'down'}>{`${change > 0 ? '+' : ''}${change.toFixed(2)}%`} 24h</span>}
          </>
        ) : (
          <span className="muted">Price unavailable until launch</span>
        )}
      </div>
      <div className="chart-frame">
        {live && stats?.pairAddress ? (
          <iframe
            key={reload}
            title={`${MARKET.ticker} chart on Dexscreener`}
            src={`https://dexscreener.com/sui/${stats.pairAddress}?embed=1&theme=dark&info=0&trades=0`}
          />
        ) : (
          <div className="chart-blueprint">
            <svg viewBox="0 0 600 240" preserveAspectRatio="none" aria-hidden>
              <polyline
                points="0,210 60,200 110,205 160,180 210,186 260,150 310,158 360,120 410,128 460,90 520,70 600,40"
                fill="none"
                stroke="#ffc83d"
                strokeWidth="3"
                strokeDasharray="10 8"
              />
            </svg>
            <div>
              <b>{live ? 'Waiting for Dexscreener to index the pool' : 'Chart goes live at launch'}</b>
              <span>Under construction. Hard hats required.</span>
            </div>
          </div>
        )}
      </div>
      <div className="card-foot">
        <a href={stats?.pairUrl ?? 'https://dexscreener.com/sui'} target="_blank" rel="noreferrer">
          View on Dexscreener ↗
        </a>
        {live && (
          <button className="link-btn" onClick={() => setReload((r) => r + 1)}>
            ↻ Reload chart
          </button>
        )}
      </div>
    </section>
  );
}

export function TokenCard() {
  const live = isLaunched();
  return (
    <section className="token-card glass">
      <CardHead icon={<Mascot size={58} mood="wink" />} title={<>Hold ${TOKEN.ticker}<br />Join the crew</>} />
      <p>
        <b>${TOKEN.ticker}</b> is the memecoin for everyone building on Sui. No roadmap promises, no fake
        partners. Just builders, memes, and a hard hat for every holder.
      </p>
      <div className="contract">
        <span className="contract-label">
          {MARKET.ticker} contract · Sui <PlaceholderBadge />
        </span>
        {live ? (
          <div className="contract-row">
            <code>{`${MARKET.coinType.slice(0, 10)}…${MARKET.coinType.slice(-18)}`}</code>
            <CopyButton text={MARKET.coinType} label="Copy" />
          </div>
        ) : (
          <div className="contract-row">
            <code>Posted here at launch</code>
          </div>
        )}
      </div>
      {live ? (
        <BuyBox />
      ) : (
        <button className="btn btn-go wide" disabled>
          Buy opens at launch
        </button>
      )}
    </section>
  );
}

export function VibeCard() {
  const post = encodeURIComponent(`gm builders. $${TOKEN.ticker} is building on Sui @${SOCIALS.xHandle}`);
  return (
    <section className="vibe-card glass">
      <CardHead icon={<Mascot size={50} mood="wow" />} title="Vibe Check" sub="let's see how good X is feeling" />
      <p className="vibe-read">
        The crew's mood lives on <b>@{SOCIALS.xHandle}</b>. Check the vibes, then drop your gm.
      </p>
      <div className="vibe-actions">
        <a className="btn btn-glass" href={SOCIALS.x} target="_blank" rel="noreferrer">
          Follow on X ↗
        </a>
        <a className="btn btn-glass" href={`https://x.com/intent/post?text=${post}`} target="_blank" rel="noreferrer">
          Post a gm ↗
        </a>
      </div>
    </section>
  );
}

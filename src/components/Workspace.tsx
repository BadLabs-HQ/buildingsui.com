import { useState, type ReactNode } from 'react';
import { SOCIALS, TOKEN, isLaunched, links } from '../config';
import { formatUsd, type MarketStats } from '../lib/dexscreener';
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

export function ChartCard({ stats }: { stats: MarketStats | null }) {
  const [reload, setReload] = useState(0);
  const live = isLaunched();
  const change = stats?.change24h;

  return (
    <section className="chart-card glass">
      <CardHead
        icon={<Mascot size={40} />}
        title={`$${TOKEN.ticker}`}
        sub={`${TOKEN.ticker} / SUI · Price chart from Dexscreener`}
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
            title={`${TOKEN.ticker} chart on Dexscreener`}
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
        <span className="contract-label">{TOKEN.ticker} contract · Sui</span>
        {live ? (
          <div className="contract-row">
            <code>{`${TOKEN.coinType.slice(0, 10)}…${TOKEN.coinType.slice(-14)}`}</code>
            <CopyButton text={TOKEN.coinType} label="Copy" />
          </div>
        ) : (
          <div className="contract-row">
            <code>Posted here at launch</code>
          </div>
        )}
      </div>
      {live ? (
        <a className="btn btn-go wide" href={links.cetusSwap(TOKEN.coinType)} target="_blank" rel="noreferrer">
          Buy on Cetus
        </a>
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

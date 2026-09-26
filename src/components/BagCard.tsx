import { useEffect, useMemo, useRef, useState } from 'react';
import { useCurrentAccount, useCurrentClient, useCurrentWallet } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { toPng } from 'html-to-image';
import { SOCIALS, TOKEN, isLaunched } from '../config';
import { formatUsd, type MarketStats } from '../lib/dexscreener';
import { readJSON, writeJSON } from '../lib/storage';
import { noPhantom } from '../lib/wallets';
import { Mascot } from './Mascot';
import { CardHead } from './Workspace';

const JOIN_KEY = 'build:joined';
const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
// A stable tag made from the address itself. It identifies you; it is not a rank.
const builderTag = (a: string) => a.slice(-4).toUpperCase();
const fmtTokens = (n: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: n < 1 ? 4 : 0 }).format(n);

// First time this wallet was seen on this device. Recorded once, then read back.
function useJoinDate(address?: string) {
  const date = useMemo(() => {
    if (!address) return null;
    return readJSON<Record<string, string>>(JOIN_KEY)?.[address] ?? new Date().toISOString();
  }, [address]);

  useEffect(() => {
    if (!address || !date) return;
    const all = readJSON<Record<string, string>>(JOIN_KEY) ?? {};
    if (!all[address]) writeJSON(JOIN_KEY, { ...all, [address]: date });
  }, [address, date]);

  return date;
}

function useBuildBalance(address?: string) {
  const client = useCurrentClient();
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!address || !isLaunched()) return;
    let alive = true;
    (async () => {
      try {
        const [bal, meta] = await Promise.all([
          client.core.getBalance({ owner: address, coinType: TOKEN.coinType }),
          client.core.getCoinMetadata({ coinType: TOKEN.coinType }),
        ]);
        const decimals = meta.coinMetadata?.decimals ?? 9;
        if (alive) setBalance(Number(bal.balance.balance) / 10 ** decimals);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [address, client]);

  return { balance, error };
}

export function BagCard({ stats }: { stats: MarketStats | null }) {
  const [tab, setTab] = useState<'wallet' | 'estimate'>('wallet');

  return (
    <section className="bag-card glass">
      <div className="bag-head">
        <CardHead icon={<Mascot size={50} />} title="What's my bag worth?" sub="Check your wallet or estimate your next bag." />
        <div className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'wallet'} className={tab === 'wallet' ? 'on' : ''} onClick={() => setTab('wallet')}>
            My wallet
          </button>
          <button role="tab" aria-selected={tab === 'estimate'} className={tab === 'estimate' ? 'on' : ''} onClick={() => setTab('estimate')}>
            Estimate a purchase
          </button>
        </div>
      </div>
      {tab === 'wallet' ? <WalletTab stats={stats} /> : <EstimateTab stats={stats} />}
    </section>
  );
}

function WalletTab({ stats }: { stats: MarketStats | null }) {
  const account = useCurrentAccount();
  const { balance, error } = useBuildBalance(account?.address);
  const live = isLaunched();

  return (
    <div className="bag-body">
      <div className="bag-panels">
        <div className="bag-panel">
          <span className="panel-label">Your ${TOKEN.ticker}</span>
          <span className="panel-value">
            {!account ? '—' : !live ? 'At launch' : error ? 'Unavailable' : balance == null ? '…' : fmtTokens(balance)}
          </span>
          <span className="panel-note">{account ? shortAddr(account.address) : 'Connect a wallet to begin'}</span>
        </div>
        <div className="bag-panel">
          <span className="panel-label">Worth right now</span>
          <span className="panel-value">
            {!account || !live || balance == null || !stats ? '—' : formatUsd(balance * stats.priceUsd)}
          </span>
          <span className="panel-note">At the current Dexscreener price</span>
        </div>
        {!account && (
          <div className="bag-connect">
            <ConnectButton modalOptions={noPhantom}>
              <span>Connect Wallet</span>
            </ConnectButton>
            <p>Read only. No transaction, no signature, nothing to paste.</p>
          </div>
        )}
      </div>
      <BuilderCard />
    </div>
  );
}

function EstimateTab({ stats }: { stats: MarketStats | null }) {
  const [sui, setSui] = useState('10');
  const amount = Number(sui);
  const ready = isLaunched() && stats && stats.priceNative > 0;
  const tokens = ready && amount > 0 ? amount / stats.priceNative : null;

  return (
    <div className="bag-body estimate">
      <label className="estimate-input">
        <span className="panel-label">You spend</span>
        <div className="input-row">
          <input
            type="number"
            min="0"
            step="any"
            value={sui}
            onChange={(e) => setSui(e.target.value)}
            disabled={!ready}
            aria-label="Amount of SUI"
          />
          <span className="unit">SUI</span>
        </div>
      </label>
      <span className="arrow" aria-hidden>→</span>
      <div className="bag-panel">
        <span className="panel-label">You get about</span>
        <span className="panel-value">{ready ? (tokens == null ? '—' : fmtTokens(tokens)) : 'At launch'}</span>
        <span className="panel-note">
          {ready && tokens != null ? `$${TOKEN.ticker} · about ${formatUsd(tokens * stats.priceUsd)}` : `$${TOKEN.ticker}`}
        </span>
      </div>
      <p className="estimate-note">
        Estimate only, at the current pool price. Real swaps include fees and slippage, and big buys move the price.
      </p>
    </div>
  );
}

function BuilderCard() {
  const account = useCurrentAccount();
  const wallet = useCurrentWallet();
  const joined = useJoinDate(account?.address);
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const download = async () => {
    if (!cardRef.current || !account) return;
    setSaving(true);
    try {
      const url = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = url;
      a.download = `builder-${builderTag(account.address)}.png`;
      a.click();
    } finally {
      setSaving(false);
    }
  };

  const shareText = encodeURIComponent(`I just joined the crew. We're building on Sui. $${TOKEN.ticker} @${SOCIALS.xHandle}`);

  return (
    <div className="builder-wrap">
      <div className={`builder-card ${account ? 'active' : 'locked'}`} ref={cardRef}>
        <div className="bc-stripe" />
        <div className="bc-top">
          <span className="bc-issuer">{TOKEN.name} · Builder card</span>
          <span className="bc-tag">#{account ? builderTag(account.address) : '????'}</span>
        </div>
        <div className="bc-body">
          <Mascot size={96} mood={account ? 'grin' : 'wow'} />
          <div className="bc-fields">
            <label>Builder</label>
            <span className="mono">{account ? shortAddr(account.address) : 'Not connected'}</span>
            <label>Wallet</label>
            <span>{wallet?.name ?? '…'}</span>
            <label>On site since</label>
            <span>{joined ? new Date(joined).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '…'}</span>
          </div>
        </div>
        <div className="bc-foot">
          <span className="bc-badge">Founding Builder · pending</span>
          <span className="bc-ticker">${TOKEN.ticker}</span>
        </div>
        {!account && <div className="bc-lock">Connect to unlock</div>}
      </div>
      {account && (
        <div className="builder-actions">
          <button className="btn btn-go" onClick={download} disabled={saving}>
            {saving ? 'Rendering…' : 'Download card'}
          </button>
          <a className="btn btn-glass" href={`https://x.com/intent/post?text=${shareText}`} target="_blank" rel="noreferrer">
            Post on X ↗
          </a>
        </div>
      )}
    </div>
  );
}

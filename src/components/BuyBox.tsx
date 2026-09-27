import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useCurrentClient, useDAppKit } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { MARKET } from '../config';
import { SUI_DECIMALS, SUI_TYPE, buildBuyTx, fromUnits, quoteBuy, toUnits, type BuyQuote } from '../lib/cetusSwap';
import { noPhantom } from '../lib/wallets';

const SLIPPAGES = [0.005, 0.01, 0.02];
const GAS_RESERVE = 100_000_000n; // keep 0.1 SUI for gas when using Max
const QUOTE_TTL_MS = 20_000;

const fmt = (n: number, max = 4) => new Intl.NumberFormat('en-US', { maximumFractionDigits: n >= 1000 ? 0 : max }).format(n);

type Status =
  | { kind: 'idle' }
  | { kind: 'quoting' }
  | { kind: 'no-route' }
  | { kind: 'signing' }
  | { kind: 'done'; digest: string }
  | { kind: 'error'; message: string };

export function BuyBox() {
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const dAppKit = useDAppKit();
  const [amount, setAmount] = useState('1');
  const [slippage, setSlippage] = useState(0.01);
  const [quote, setQuote] = useState<BuyQuote | null>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [decimals, setDecimals] = useState<number | null>(null);
  const [suiBalance, setSuiBalance] = useState<bigint | null>(null);
  const [balanceTick, setBalanceTick] = useState(0);
  const quoteSeq = useRef(0);

  const amountIn = toUnits(amount, SUI_DECIMALS);

  // Decimals of the coin being bought, to show the quote in whole tokens.
  useEffect(() => {
    client.core
      .getCoinMetadata({ coinType: MARKET.coinType })
      .then((r) => setDecimals(r.coinMetadata?.decimals ?? 9))
      .catch(() => setDecimals(9));
  }, [client]);

  useEffect(() => {
    if (!account) return setSuiBalance(null);
    client.core
      .getBalance({ owner: account.address, coinType: SUI_TYPE })
      .then((r) => setSuiBalance(BigInt(r.balance.balance)))
      .catch(() => setSuiBalance(null));
  }, [account, client, balanceTick]);

  // Re-quote shortly after the amount stops changing, and again when the quote goes stale.
  useEffect(() => {
    setQuote(null);
    if (!amountIn || amountIn <= 0n) return setStatus({ kind: 'idle' });
    const seq = ++quoteSeq.current;
    const run = async () => {
      setStatus((s) => (s.kind === 'done' ? s : { kind: 'quoting' }));
      try {
        const q = await quoteBuy(client, MARKET.coinType, amountIn);
        if (seq !== quoteSeq.current) return;
        setQuote(q);
        setStatus((s) => (s.kind === 'done' ? s : q ? { kind: 'idle' } : { kind: 'no-route' }));
      } catch (e) {
        if (seq === quoteSeq.current) setStatus({ kind: 'error', message: `Could not get a quote. ${(e as Error).message}` });
      }
    };
    const first = setTimeout(run, 450);
    const again = setInterval(run, QUOTE_TTL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(again);
    };
    // amountIn is derived from amount; keying on the string avoids bigint identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, client]);

  const out = quote && decimals != null ? fromUnits(quote.amountOut, decimals) : null;
  const minOut = out != null ? out * (1 - slippage) : null;
  const tooMuch = suiBalance != null && amountIn != null && amountIn + GAS_RESERVE / 10n > suiBalance;

  const buy = async () => {
    if (!account || !quote) return;
    setStatus({ kind: 'signing' });
    try {
      // Never sign an old price: fetch a fresh route if this one has aged out.
      const fresh = Date.now() - quote.fetchedAt > QUOTE_TTL_MS ? await quoteBuy(client, MARKET.coinType, quote.amountIn) : quote;
      if (!fresh) return setStatus({ kind: 'no-route' });
      const tx = await buildBuyTx(client, fresh, account.address, slippage);
      const res = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (res.FailedTransaction) {
        const msg = res.FailedTransaction.status.error?.message ?? 'Transaction failed';
        throw new Error(/slippage|MoveAbort.*, 1\)/i.test(msg) ? 'The price moved past your slippage. Try again or raise slippage.' : msg);
      }
      setStatus({ kind: 'done', digest: res.Transaction.digest });
      setBalanceTick((t) => t + 1);
    } catch (e) {
      const msg = (e as Error)?.message ?? String(e);
      setStatus({ kind: 'error', message: /reject|denied|cancel/i.test(msg) ? 'You declined in your wallet. Nothing was spent.' : msg });
    }
  };

  const setMax = () => {
    if (suiBalance == null) return;
    const max = suiBalance > GAS_RESERVE ? suiBalance - GAS_RESERVE : 0n;
    setAmount(String(fromUnits(max, SUI_DECIMALS)));
  };

  return (
    <div className="buy-box">
      <div className="buy-field">
        <div className="buy-field-top">
          <span>You pay</span>
          {suiBalance != null && (
            <button className="link-btn small" onClick={setMax}>
              Balance {fmt(fromUnits(suiBalance, SUI_DECIMALS))} · Max
            </button>
          )}
        </div>
        <div className="input-row">
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(',', '.'))}
            aria-label="Amount of SUI to spend"
            placeholder="0"
          />
          <span className="unit">SUI</span>
        </div>
      </div>

      <div className="buy-field">
        <div className="buy-field-top">
          <span>You get about</span>
          {status.kind === 'quoting' && <span className="muted">Finding best route…</span>}
        </div>
        <div className="input-row">
          <span className="buy-out">{out != null ? fmt(out) : '—'}</span>
          <span className="unit">{MARKET.ticker}</span>
        </div>
      </div>

      <div className="buy-meta">
        <div className="slippage" role="group" aria-label="Slippage tolerance">
          <span>Slippage</span>
          {SLIPPAGES.map((s) => (
            <button key={s} className={s === slippage ? 'on' : ''} onClick={() => setSlippage(s)}>
              {s * 100}%
            </button>
          ))}
        </div>
        {minOut != null && (
          <span className="muted">
            Min {fmt(minOut)} {MARKET.ticker}
          </span>
        )}
      </div>
      {quote && <p className="buy-route">Route via {quote.providers.map((p) => p.toLowerCase()).join(', ')} · Cetus aggregator · no site fee</p>}

      {!account ? (
        <ConnectButton modalOptions={noPhantom}>
          <span>Connect wallet to buy</span>
        </ConnectButton>
      ) : (
        <button
          className="btn btn-go wide"
          onClick={buy}
          disabled={!quote || status.kind === 'signing' || status.kind === 'quoting' || tooMuch}
        >
          {status.kind === 'signing' ? 'Confirm in your wallet…' : tooMuch ? 'Not enough SUI' : `Buy $${MARKET.ticker}`}
        </button>
      )}

      {status.kind === 'no-route' && <p className="error">No route found for this amount. Try a smaller amount.</p>}
      {status.kind === 'error' && <p className="error">{status.message}</p>}
      {status.kind === 'done' && (
        <p className="buy-done">
          Bought. <a href={`https://suiscan.xyz/mainnet/tx/${status.digest}`} target="_blank" rel="noreferrer">View transaction ↗</a>
        </p>
      )}
    </div>
  );
}

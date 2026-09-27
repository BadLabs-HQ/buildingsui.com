import type { RouterDataV3 } from '@cetusprotocol/aggregator-sdk';
import type { SuiGrpcClient } from '@mysten/sui/grpc';

export const SUI_TYPE = '0x2::sui::SUI';
export const SUI_DECIMALS = 9;

export type BuyQuote = {
  router: RouterDataV3;
  amountIn: bigint;
  amountOut: bigint;
  providers: string[];
  fetchedAt: number;
};

// The aggregator SDK is large, so it loads only when someone types an amount into the buy box.
let sdkPromise: Promise<typeof import('@cetusprotocol/aggregator-sdk')> | null = null;
const sdk = () => (sdkPromise ??= import('@cetusprotocol/aggregator-sdk'));

async function aggregator(client: SuiGrpcClient, signer?: string) {
  const { AggregatorClient, Env } = await sdk();
  // No overlay fee: the rate defaults to 0, so buyers pay only the pools' own fees.
  return new AggregatorClient({ client, env: Env.Mainnet, signer });
}

/** Best route to spend `amountInMist` SUI on `target`. Null when no route exists. */
export async function quoteBuy(client: SuiGrpcClient, target: string, amountInMist: bigint): Promise<BuyQuote | null> {
  const agg = await aggregator(client);
  const router = await agg.findRouters({ from: SUI_TYPE, target, amount: amountInMist.toString(), byAmountIn: true });
  if (!router || router.error || router.insufficientLiquidity || router.paths.length === 0) return null;
  return {
    router,
    amountIn: BigInt(router.amountIn.toString()),
    amountOut: BigInt(router.amountOut.toString()),
    providers: [...new Set(router.paths.map((p) => p.provider))],
    fetchedAt: Date.now(),
  };
}

/** Swap transaction for the quoted route; the bought coins land in `sender`'s wallet. */
export async function buildBuyTx(client: SuiGrpcClient, quote: BuyQuote, sender: string, slippage: number) {
  const [agg, { Transaction }] = await Promise.all([aggregator(client, sender), import('@mysten/sui/transactions')]);
  const txb = new Transaction();
  txb.setSender(sender);
  await agg.fastRouterSwap({ router: quote.router, txb, slippage });
  return txb;
}

export function toUnits(amount: string, decimals: number): bigint | null {
  if (!/^\d*\.?\d*$/.test(amount) || amount === '' || amount === '.') return null;
  const [whole, frac = ''] = amount.split('.');
  return BigInt(whole || '0') * 10n ** BigInt(decimals) + BigInt((frac + '0'.repeat(decimals)).slice(0, decimals) || '0');
}

export function fromUnits(value: bigint, decimals: number) {
  return Number(value) / 10 ** decimals;
}

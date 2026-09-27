// Everything that changes at launch lives here. The coin itself is set in MARKET below.

export const TOKEN = {
  name: 'Building Sui',
  ticker: 'BUILD',
  // ISO date string for the countdown, for example '2026-11-01T16:00:00Z'. Empty shows "TBA".
  launchAt: '',
};

export const SOCIALS = {
  xHandle: 'buildingsui',
  x: 'https://x.com/buildingsui',
  telegram: '',
  discord: '',
};

// Meme submissions are transferred to this address for review. Empty keeps them with the uploader.
export const CURATOR_ADDRESS = '';

export const SUI_RPC = 'https://fullnode.mainnet.sui.io:443';

export const WALRUS = {
  aggregator: 'https://aggregator.walrus-mainnet.walrus.space',
  uploadRelay: 'https://upload-relay.mainnet.walrus.space',
  // Mainnet epochs are 14 days, so 26 epochs keeps a meme stored for about a year.
  memeEpochs: 26,
  maxMemeBytes: 5 * 1024 * 1024,
};

export const links = {
  // Aftermath's aggregator honours the coin in the link (Cetus drops it), and routes across all Sui DEXs.
  buySwap: (coinType: string) => `https://aftermath.finance/trade?from=0x2::sui::SUI&to=${coinType}`,
  suiscanCoin: (coinType: string) => `https://suiscan.xyz/mainnet/coin/${encodeURIComponent(coinType)}`,
  walrusBlob: (blobId: string) => `${WALRUS.aggregator}/v1/blobs/${blobId}`,
};

// The token behind the price, chart, stats, wallet balance and buy button.
// Until $BUILD launches, $MANIFEST stands in so every data section works end to end.
// At launch: set coinType and ticker to $BUILD's and placeholder to false.
export const MARKET = {
  ticker: 'MANIFEST',
  coinType: '0xc466c28d87b3d5cd34f3d5c088751532d71a38d93a8aae4551dd56272cfb4355::manifest::MANIFEST',
  placeholder: true,
};

export const isLaunched = () => MARKET.coinType.length > 0;

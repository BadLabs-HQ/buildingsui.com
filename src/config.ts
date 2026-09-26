// Everything that changes at launch lives here.
// Fill in COIN_TYPE and the site flips from "before launch" to live mode.

export const TOKEN = {
  name: 'Building Sui',
  ticker: 'BUILD',
  // Full Sui coin type, for example '0xabc...::build::BUILD'. Empty until launch.
  coinType: '',
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
  cetusSwap: (coinType: string) =>
    `https://app.cetus.zone/swap/?from=0x2::sui::SUI&to=${encodeURIComponent(coinType)}`,
  suiscanCoin: (coinType: string) => `https://suiscan.xyz/mainnet/coin/${encodeURIComponent(coinType)}`,
  walrusBlob: (blobId: string) => `${WALRUS.aggregator}/v1/blobs/${blobId}`,
};

export const isLaunched = () => TOKEN.coinType.length > 0;

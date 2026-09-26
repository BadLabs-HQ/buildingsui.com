import { createDAppKit } from '@mysten/dapp-kit-react';
import { SuiGrpcClient } from '@mysten/sui/grpc';
import { SUI_RPC } from './config';

export const dAppKit = createDAppKit({
  networks: ['mainnet'],
  createClient: (network) => new SuiGrpcClient({ network, baseUrl: SUI_RPC }),
  // Wallet extensions only. The Slush web app (social sign in) is turned off on purpose.
  slushWalletConfig: null,
});

declare module '@mysten/dapp-kit-react' {
  interface Register {
    dAppKit: typeof dAppKit;
  }
}

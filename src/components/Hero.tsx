import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { noPhantom } from '../lib/wallets';
import { Mascot } from './Mascot';


export function Hero() {
  return (
    <header className="hero">
      <div className="hero-wallet">
        <ConnectButton modalOptions={noPhantom}>
          <span>Connect Wallet</span>
        </ConnectButton>
      </div>
      <div className="hero-inner">
        <div>
          <h1 className="lettering" aria-label="Building Sui">
            <span data-text="BUILDING">BUILDING</span> <span data-text="SUI">SUI</span>
          </h1>
          <p className="tagline">a little construction on everyone's favorite chain</p>
        </div>
        <div className="hero-mascot">
          <Mascot size={230} />
        </div>
      </div>
    </header>
  );
}

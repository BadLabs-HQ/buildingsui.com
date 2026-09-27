import { MARKET } from './config';
import { useMarketStats } from './lib/dexscreener';
import { Scene } from './components/Scene';
import { Hero } from './components/Hero';
import { StatsBar } from './components/StatsBar';
import { ChartCard, TokenCard, VibeCard } from './components/Workspace';
import { BagCard } from './components/BagCard';
import { MemeDepot } from './components/MemeDepot';
import { Footer } from './components/Footer';
import { MusicDock, RadioWelcome } from './components/Radio';

export default function App() {
  const { stats, stale } = useMarketStats(MARKET.coinType);

  return (
    <>
      <Scene />
      <Hero />
      <main className="page">
        <StatsBar stats={stats} stale={stale} />
        <div className="workspace">
          <ChartCard stats={stats} />
          <div className="side">
            <TokenCard />
            <VibeCard />
          </div>
        </div>
        <BagCard stats={stats} />
        <MemeDepot />
      </main>
      <Footer />
      <MusicDock />
      <RadioWelcome />
    </>
  );
}

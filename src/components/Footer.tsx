import { SOCIALS, TOKEN } from '../config';

export function Footer() {
  const socials = [
    ['X', SOCIALS.x],
    ['Telegram', SOCIALS.telegram],
    ['Discord', SOCIALS.discord],
  ].filter(([, url]) => url);

  return (
    <footer className="footer">
      <p>
        ${TOKEN.ticker} is a memecoin, not an investment product, fund, or index. Nothing on this site is financial
        advice. Prices and estimates can change and are not guaranteed. ${TOKEN.ticker} can lose all of its value.
      </p>
      <p>
        This is the official {TOKEN.name} website. {TOKEN.name} is not affiliated with, endorsed by, or operated by
        Mysten Labs or the Sui Foundation. Market data comes from Dexscreener and may be delayed or incomplete.
      </p>
      <div className="footer-row">
        <span>Hosted on Walrus. Built on Sui.</span>
        <nav>
          {socials.map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer">
              {name} ↗
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

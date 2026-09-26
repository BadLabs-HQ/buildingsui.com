import { useState } from 'react';
import { TOKEN } from '../config';
import { startMusic, toggleMusic, useMusicPlaying } from '../lib/sound';
import { readJSON, writeJSON } from '../lib/storage';
import { DjBuilder } from './DjBuilder';

const SEEN_KEY = 'build:radio-seen';

// First visit welcome card. Shown once per visitor, then the dock takes over.
export function RadioWelcome() {
  const [open, setOpen] = useState(() => !readJSON<boolean>(SEEN_KEY));
  if (!open) return null;

  const close = (play: boolean) => {
    writeJSON(SEEN_KEY, true);
    if (play) startMusic();
    setOpen(false);
  };

  return (
    <div className="radio-backdrop" role="dialog" aria-modal="true" aria-labelledby="radio-title">
      <div className="radio-card glass">
        <DjBuilder size={170} spinning />
        <h2 id="radio-title">${TOKEN.ticker} Radio</h2>
        <p>Let DJ Builder set the mood. Turn on the music for an experience that builds good.</p>
        <button className="btn btn-go wide" onClick={() => close(true)} autoFocus>
          ▶ Yes, let it play
        </button>
        <button className="link-btn" onClick={() => close(false)}>
          I'm good with quiet
        </button>
        <span className="radio-note">You can pause or play anytime.</span>
      </div>
    </div>
  );
}

// DJ Builder floating in the bottom left corner. Click to play or pause.
export function MusicDock() {
  const playing = useMusicPlaying();
  return (
    <button
      className={`music-dock ${playing ? 'playing' : ''}`}
      onClick={toggleMusic}
      aria-pressed={playing}
      title={playing ? 'Pause the music' : 'Press play for good sounds'}
    >
      <span className="dock-bubble">{playing ? 'Now playing. Click to pause.' : 'Press play for good sounds'}</span>
      {playing && (
        <span className="notes" aria-hidden>
          <i>♪</i>
          <i>♫</i>
          <i>♪</i>
        </span>
      )}
      <DjBuilder size={150} spinning={playing} />
    </button>
  );
}

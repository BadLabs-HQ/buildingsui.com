import { useEffect, useState } from 'react';
import { MEMES, TEMPLATES, type Meme } from '../data/memes';
import { Mascot } from './Mascot';
import { SubmitMeme } from './SubmitMeme';
import { CardHead } from './Workspace';

// Small alternating tilts so the wall looks hand pinned rather than gridded.
const PIN_TILTS = [-1.4, 1, -0.6, 1.6, -1, 0.7];

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3v12M7 10l5 5 5-5M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
    </svg>
  );
}

async function downloadMeme(m: Meme) {
  const ext = m.src.endsWith('.svg') ? 'svg' : 'png';
  try {
    // Fetch first so cross origin files (Walrus aggregator) still save instead of opening.
    const blob = await (await fetch(m.src)).blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `build-${m.id}.${ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    window.open(m.src, '_blank', 'noopener');
  }
}

export function MemeDepot() {
  const [open, setOpen] = useState<Meme | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const all = [...MEMES, ...TEMPLATES];

  return (
    <section className="meme-depot glass">
      <div className="depot-head">
        <div>
          <span className="eyebrow">Take a meme. Leave a meme.</span>
          <CardHead icon={<Mascot size={58} mood="wink" />} title="The Meme Depot" sub="A wall of builders. Made for sharing." />
        </div>
        <button className="btn btn-go" onClick={() => setSubmitting(true)}>
          Submit a meme
        </button>
      </div>
      <p className="depot-count">
        {MEMES.length} memes and {TEMPLATES.length} blank templates. Unlimited good vibes. Stored on Walrus.
      </p>

      <div className="meme-wall">
        {all.map((m, i) => (
          <figure className="meme-pin" key={m.id} style={{ ['--pin-rotation' as string]: `${PIN_TILTS[i % PIN_TILTS.length]}deg` }}>
            <div className="meme-pin-image">
              <button className="meme-open" onClick={() => setOpen(m)} aria-label={`Open ${m.title}`}>
                <img src={m.src} alt={m.title} loading="lazy" />
              </button>
              <button className="meme-download" onClick={() => downloadMeme(m)} aria-label={`Download ${m.title}`} title="Download meme">
                <DownloadIcon />
              </button>
            </div>
            <figcaption>
              {m.title}
              <span aria-hidden>✦</span>
            </figcaption>
          </figure>
        ))}
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="lightbox-inner glass" onClick={(e) => e.stopPropagation()}>
            <img src={open.src} alt={open.title} />
            <div className="lightbox-bar">
              <span>{open.title}</span>
              <div className="row-gap">
                <button className="btn btn-go small" onClick={() => downloadMeme(open)}>Download</button>
                <button className="btn btn-glass small" onClick={() => setOpen(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {submitting && <SubmitMeme onClose={() => setSubmitting(false)} />}
    </section>
  );
}

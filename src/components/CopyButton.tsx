import { useState } from 'react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      /* clipboard blocked */
    }
  };
  return (
    <button className="btn btn-ghost small" onClick={copy}>
      {done ? 'Copied ✓' : label}
    </button>
  );
}

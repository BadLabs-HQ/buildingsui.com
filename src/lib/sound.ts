import { useSyncExternalStore } from 'react';

// A tiny chiptune loop made with WebAudio. No audio file to host, and it only starts on a click.

const NOTES = [523.25, 659.25, 783.99, 659.25, 587.33, 739.99, 880, 739.99];
const BASS = [130.81, 130.81, 146.83, 146.83];
const STEP = 0.22;

let ctx: AudioContext | null = null;
let timer: number | null = null;
let master: GainNode | null = null;
let playing = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function blip(freq: number, at: number, type: OscillatorType, vol: number, len: number) {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + len);
  osc.connect(gain).connect(master);
  osc.start(at);
  osc.stop(at + len + 0.02);
}

export function startMusic() {
  if (playing) return;
  ctx ??= new AudioContext();
  void ctx.resume();
  master = ctx.createGain();
  master.gain.value = 0.18;
  master.connect(ctx.destination);
  let step = 0;
  let next = ctx.currentTime + 0.05;
  const schedule = () => {
    if (!ctx) return;
    while (next < ctx.currentTime + 0.5) {
      blip(NOTES[step % NOTES.length], next, 'square', 0.25, STEP * 0.9);
      if (step % 2 === 0) blip(BASS[(step / 2) % BASS.length], next, 'triangle', 0.5, STEP * 1.8);
      next += STEP;
      step++;
    }
  };
  schedule();
  timer = window.setInterval(schedule, 120);
  playing = true;
  emit();
}

export function stopMusic() {
  if (timer != null) clearInterval(timer);
  timer = null;
  master?.disconnect();
  master = null;
  playing = false;
  emit();
}

export const toggleMusic = () => (playing ? stopMusic() : startMusic());

export function useMusicPlaying() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => playing,
  );
}

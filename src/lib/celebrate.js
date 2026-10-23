import confetti from 'canvas-confetti';

const PALETTE = ['#22362E', '#E8C57A', '#7FA88F', '#D9E7DE'];

function allowed() {
  return !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

/** One small, cheap burst — a little reward, not a fireworks show. */
export function celebrate() {
  if (!allowed()) return;
  confetti({
    particleCount: 45,
    spread: 62,
    startVelocity: 30,
    gravity: 0.9,
    ticks: 140,
    origin: { y: 0.72 },
    colors: PALETTE,
    disableForReducedMotion: true
  });
}

export function bigCelebrate() {
  if (!allowed()) return;
  confetti({
    particleCount: 90,
    spread: 90,
    startVelocity: 38,
    ticks: 180,
    origin: { y: 0.6 },
    colors: PALETTE,
    disableForReducedMotion: true
  });
}
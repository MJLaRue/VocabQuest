import confetti from 'canvas-confetti';

export const confettiPresets = {
  default: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  },
  
  levelUp: () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const colors = ['#14b8a6', '#fbbf24', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  },
  
  achievement: () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#14b8a6', '#fbbf24', '#10b981', '#f59e0b'],
      ticks: 200,
      gravity: 1.2,
    });
  },
  
  streak: (count: number) => {
    const emoji = count >= 7 ? '🔥' : '⭐';
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#ef4444', '#fbbf24'],
    });
  },
};

// Simple confetti export for convenience
export { confetti };

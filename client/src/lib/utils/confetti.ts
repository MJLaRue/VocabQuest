import confetti from 'canvas-confetti';

export const confettiPresets = {
  default: () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  },
  
  // Dramatic fireworks effect for correct answers
  fireworks: () => {
    const duration = 1200;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch from two sides
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#fbbf24', '#f59e0b', '#22c55e']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#10b981', '#14b8a6', '#fbbf24', '#f59e0b', '#22c55e']
      });
    }, 250);
  },
  
  // Explosive burst for correct answers
  explosion: () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.5 },
      zIndex: 100
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#10b981', '#14b8a6', '#22c55e']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#fbbf24', '#f59e0b', '#fb923c']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#10b981', '#14b8a6', '#fbbf24', '#22c55e']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      colors: ['#f59e0b', '#fb923c']
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#10b981', '#fbbf24', '#22c55e']
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

/**
 * Server tests for progress routes.
 *
 * Strategy: test the core business logic in isolation without importing
 * actual Express routes (which would trigger Sequelize DB connections).
 *
 * We test:
 *   1. VALID_MODES constant includes all 5 modes
 *   2. XP calculation logic for each mode
 *   3. Mode validation logic (what the PATCH /session/:id/mode endpoint checks)
 *
 * Integration tests that need a real DB belong in a separate suite.
 */
import { describe, it, expect } from 'vitest';

// ─── Constants mirroring server/routes/progress.js ───────────────────────────

const VALID_MODES = ['practice', 'quiz', 'typing', 'context', 'match'];

// ─── XP calculation logic (mirrors what progress.js does for correct answers)

function calculateBaseXP(mode) {
  let baseXP = 10;
  if (mode === 'quiz') baseXP = 15;
  else if (mode === 'typing') baseXP = 20;
  else if (mode === 'context') baseXP = 18;
  else if (mode === 'match') baseXP = 18;
  return baseXP;
}

// ─── Mode validation logic (mirrors PATCH /session/:id/mode check)

function isValidMode(mode) {
  return Boolean(mode && VALID_MODES.includes(mode));
}

// ─── VALID_MODES ──────────────────────────────────────────────────────────────

describe('VALID_MODES constant', () => {
  it('includes all 5 study modes', () => {
    expect(VALID_MODES).toContain('practice');
    expect(VALID_MODES).toContain('quiz');
    expect(VALID_MODES).toContain('typing');
    expect(VALID_MODES).toContain('context');
    expect(VALID_MODES).toContain('match');
  });

  it('has exactly 5 entries', () => {
    expect(VALID_MODES).toHaveLength(5);
  });

  it('does not include deprecated or unknown modes', () => {
    expect(VALID_MODES).not.toContain('flashcard');
    expect(VALID_MODES).not.toContain('reading');
    expect(VALID_MODES).not.toContain('');
  });
});

// ─── XP calculation ───────────────────────────────────────────────────────────

describe('XP calculation by mode (correct answers)', () => {
  it('practice mode: base XP is 10', () => {
    expect(calculateBaseXP('practice')).toBe(10);
  });

  it('quiz mode: base XP is 15', () => {
    expect(calculateBaseXP('quiz')).toBe(15);
  });

  it('typing mode: base XP is 20', () => {
    expect(calculateBaseXP('typing')).toBe(20);
  });

  it('context mode: base XP is 18', () => {
    expect(calculateBaseXP('context')).toBe(18);
  });

  it('match mode: base XP is 18', () => {
    expect(calculateBaseXP('match')).toBe(18);
  });

  it('context and match modes have the same base XP', () => {
    expect(calculateBaseXP('context')).toBe(calculateBaseXP('match'));
  });

  it('typing mode has the highest base XP', () => {
    const allXP = VALID_MODES.map(calculateBaseXP);
    expect(Math.max(...allXP)).toBe(20);
    expect(calculateBaseXP('typing')).toBe(Math.max(...allXP));
  });

  it('practice mode has the lowest base XP', () => {
    const allXP = VALID_MODES.map(calculateBaseXP);
    expect(Math.min(...allXP)).toBe(10);
    expect(calculateBaseXP('practice')).toBe(Math.min(...allXP));
  });

  it('unknown mode defaults to 10 XP', () => {
    expect(calculateBaseXP('unknown')).toBe(10);
    expect(calculateBaseXP('')).toBe(10);
    expect(calculateBaseXP(null)).toBe(10);
  });
});

// ─── Mode validation (mirrors PATCH /session/:id/mode) ──────────────────────

describe('Mode validation logic', () => {
  const validModes = ['practice', 'quiz', 'typing', 'context', 'match'];
  const invalidModes = ['flashcard', 'reading', 'QUIZ', 'Practice', '', null, undefined];

  validModes.forEach(mode => {
    it(`accepts valid mode '${mode}'`, () => {
      expect(isValidMode(mode)).toBe(true);
    });
  });

  invalidModes.forEach(mode => {
    it(`rejects invalid mode ${JSON.stringify(mode)}`, () => {
      expect(isValidMode(mode)).toBe(false);
    });
  });

  it('is case-sensitive (uppercase modes are invalid)', () => {
    expect(isValidMode('PRACTICE')).toBe(false);
    expect(isValidMode('Quiz')).toBe(false);
    expect(isValidMode('TYPING')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidMode('')).toBe(false);
  });

  it('rejects null', () => {
    expect(isValidMode(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isValidMode(undefined)).toBe(false);
  });
});

// ─── Session mode fallback logic ─────────────────────────────────────────────

describe('Session start — mode fallback logic', () => {
  // When POST /progress/session/start receives an invalid mode,
  // the server defaults to 'practice'. This mirrors:
  //   const resolvedMode = VALID_MODES.includes(mode) ? mode : 'practice';
  function resolveMode(mode) {
    return VALID_MODES.includes(mode) ? mode : 'practice';
  }

  it('uses the provided mode when valid', () => {
    expect(resolveMode('context')).toBe('context');
    expect(resolveMode('match')).toBe('match');
    expect(resolveMode('quiz')).toBe('quiz');
  });

  it('falls back to practice for invalid modes', () => {
    expect(resolveMode('invalid')).toBe('practice');
    expect(resolveMode('')).toBe('practice');
    expect(resolveMode(null)).toBe('practice');
    expect(resolveMode(undefined)).toBe('practice');
  });

  it('all 5 valid modes are preserved without fallback', () => {
    VALID_MODES.forEach(mode => {
      expect(resolveMode(mode)).toBe(mode);
    });
  });
});

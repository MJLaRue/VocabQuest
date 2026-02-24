/**
 * Pure utility functions for flashcard mode logic.
 * Extracted here so they can be unit-tested without Svelte.
 */

import type { VocabularyWord } from '$lib/api/vocab';

// ─── Fisher-Yates Shuffle ─────────────────────────────────────────────────────

export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Quiz Mode ────────────────────────────────────────────────────────────────

/**
 * Generate 4 quiz options (definitions) — 1 correct + 3 distractors.
 * Falls back to placeholder options if the pool is too small.
 */
export function generateQuizOptions(
  correctWord: VocabularyWord,
  pool: VocabularyWord[],
): string[] {
  const otherWords = pool.filter((w) => w.id !== correctWord.id);

  if (otherWords.length < 3) {
    return fisherYatesShuffle([
      correctWord.definition,
      'A different meaning (placeholder)',
      'Another definition (placeholder)',
      'Yet another option (placeholder)',
    ]);
  }

  const shuffledPool = fisherYatesShuffle(otherWords);
  const wrongOptions = shuffledPool.slice(0, 3).map((w) => w.definition);
  return fisherYatesShuffle([correctWord.definition, ...wrongOptions]);
}

// ─── Context Mode ─────────────────────────────────────────────────────────────

/**
 * Replace the target word in a sentence with a blank.
 */
export function blankOutWord(sentence: string, targetWord: string): string {
  return sentence.replace(
    new RegExp(`\\b${escapeRegex(targetWord)}\\b`, 'i'),
    '______',
  );
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate 4 context options (words) — 1 correct + 3 distractors.
 */
export function generateContextOptions(
  correctWord: VocabularyWord,
  distractors: VocabularyWord[],
): string[] {
  const shuffledPool = fisherYatesShuffle(distractors);
  const wrongOptions = shuffledPool.slice(0, 3).map((w) => w.word);
  return fisherYatesShuffle([correctWord.word, ...wrongOptions]);
}

// ─── Match Mode ───────────────────────────────────────────────────────────────

export type MatchData = {
  options: string[];
  correctAnswer: string;
  matchType: 'synonym' | 'antonym';
} | null;

/**
 * Generate match-mode data (synonym or antonym matching).
 * Returns null if the correct word has no pool entries for the requested type.
 */
export function generateMatchData(
  correctWord: VocabularyWord,
  distractors: VocabularyWord[],
  type: 'synonym' | 'antonym',
): MatchData {
  const pool = type === 'synonym' ? correctWord.synonyms : correctWord.antonyms;
  if (!pool || pool.length === 0) return null;

  const correctAnswer = pool[Math.floor(Math.random() * pool.length)];

  const otherSynAnt = distractors
    .flatMap((w) => [...(w.synonyms ?? []), ...(w.antonyms ?? [])])
    .filter((s) => s !== correctAnswer);

  const wrongOptions = fisherYatesShuffle(otherSynAnt).slice(0, 3);

  // Pad with word-strings if not enough syn/ant distractors
  if (wrongOptions.length < 3) {
    const wordDistractors = distractors
      .map((w) => w.word)
      .filter((w) => !wrongOptions.includes(w));
    while (wrongOptions.length < 3 && wordDistractors.length > 0) {
      wrongOptions.push(wordDistractors.shift()!);
    }
  }

  return {
    options: fisherYatesShuffle([correctAnswer, ...wrongOptions]),
    correctAnswer,
    matchType: type,
  };
}

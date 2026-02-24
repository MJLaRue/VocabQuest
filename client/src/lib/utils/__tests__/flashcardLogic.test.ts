import { describe, it, expect } from 'vitest';
import {
  fisherYatesShuffle,
  generateQuizOptions,
  generateContextOptions,
  blankOutWord,
  generateMatchData,
} from '../flashcardLogic';
import type { VocabularyWord } from '$lib/api/vocab';

// ─── Test helpers ─────────────────────────────────────────────────────────────

function makeWord(overrides: Partial<VocabularyWord> & { id: number; word: string }): VocabularyWord {
  return {
    part_of_speech: 'n.',
    definition: `Definition of ${overrides.word}`,
    example_sentence: `The ${overrides.word} was impressive.`,
    synonyms: [],
    antonyms: [],
    ...overrides,
  };
}

const correctWord = makeWord({
  id: 1,
  word: 'abhor',
  definition: 'to regard with horror or disgust; to detest',
  example_sentence: 'She abhorred the thought of lying.',
  synonyms: ['detest', 'loathe', 'despise'],
  antonyms: ['love', 'admire', 'adore'],
});

const distractors: VocabularyWord[] = [
  makeWord({ id: 2, word: 'abundant', definition: 'existing in large quantities; plentiful', synonyms: ['plentiful', 'ample'], antonyms: ['scarce'] }),
  makeWord({ id: 3, word: 'adamant', definition: 'refusing to be persuaded or to change one\'s mind', synonyms: ['firm', 'resolute'], antonyms: ['flexible'] }),
  makeWord({ id: 4, word: 'amiable', definition: 'having or displaying a friendly and pleasant manner', synonyms: ['friendly', 'pleasant'], antonyms: ['unfriendly'] }),
  makeWord({ id: 5, word: 'arduous', definition: 'involving or requiring strenuous effort; difficult', synonyms: ['difficult', 'tough'], antonyms: ['easy'] }),
];

// ─── fisherYatesShuffle ───────────────────────────────────────────────────────

describe('fisherYatesShuffle', () => {
  it('returns an array of the same length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(fisherYatesShuffle(arr)).toHaveLength(5);
  });

  it('contains all original elements', () => {
    const arr = ['a', 'b', 'c', 'd'];
    const shuffled = fisherYatesShuffle(arr);
    expect(shuffled.sort()).toEqual([...arr].sort());
  });

  it('does not mutate the original array', () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    fisherYatesShuffle(arr);
    expect(arr).toEqual(original);
  });

  it('handles an empty array', () => {
    expect(fisherYatesShuffle([])).toEqual([]);
  });

  it('handles a single-element array', () => {
    expect(fisherYatesShuffle([42])).toEqual([42]);
  });

  it('produces different orderings across many runs (statistical check)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    const seen = new Set<string>();
    for (let i = 0; i < 200; i++) {
      seen.add(fisherYatesShuffle(arr).join(','));
    }
    // With 8 elements and 200 shuffles, we should see many distinct orderings
    expect(seen.size).toBeGreaterThan(10);
  });
});

// ─── generateQuizOptions ─────────────────────────────────────────────────────

describe('generateQuizOptions', () => {
  it('returns exactly 4 options', () => {
    const options = generateQuizOptions(correctWord, distractors);
    expect(options).toHaveLength(4);
  });

  it('includes the correct definition', () => {
    const options = generateQuizOptions(correctWord, distractors);
    expect(options).toContain(correctWord.definition);
  });

  it('does not include duplicates', () => {
    const options = generateQuizOptions(correctWord, distractors);
    expect(new Set(options).size).toBe(4);
  });

  it('falls back to placeholder options when pool is too small', () => {
    const smallPool: VocabularyWord[] = [makeWord({ id: 2, word: 'other', definition: 'other def' })];
    const options = generateQuizOptions(correctWord, smallPool);
    expect(options).toHaveLength(4);
    expect(options).toContain(correctWord.definition);
  });

  it('excludes the correct word itself from distractors', () => {
    // Pool contains the correct word plus 3 others — should not count correctWord as a distractor
    const poolWithSelf = [correctWord, ...distractors];
    const options = generateQuizOptions(correctWord, poolWithSelf);
    const definitionCount = options.filter(o => o === correctWord.definition).length;
    expect(definitionCount).toBe(1);
  });
});

// ─── generateContextOptions ──────────────────────────────────────────────────

describe('generateContextOptions', () => {
  it('returns exactly 4 options', () => {
    const options = generateContextOptions(correctWord, distractors);
    expect(options).toHaveLength(4);
  });

  it('includes the correct word', () => {
    const options = generateContextOptions(correctWord, distractors);
    expect(options).toContain(correctWord.word);
  });

  it('returns word strings, not definitions', () => {
    const options = generateContextOptions(correctWord, distractors);
    // All options should be single words (not long definition strings)
    options.forEach(opt => {
      expect(opt).not.toContain('existing in large quantities');
    });
  });

  it('does not include duplicate words', () => {
    const options = generateContextOptions(correctWord, distractors);
    expect(new Set(options).size).toBe(4);
  });
});

// ─── blankOutWord ─────────────────────────────────────────────────────────────

describe('blankOutWord', () => {
  it('replaces the target word with ______', () => {
    const result = blankOutWord('She abhorred the thought of lying.', 'abhorred');
    expect(result).toBe('She ______ the thought of lying.');
  });

  it('is case-insensitive', () => {
    const result = blankOutWord('She Abhorred the idea.', 'abhorred');
    expect(result).toBe('She ______ the idea.');
  });

  it('only replaces the first whole-word match', () => {
    const result = blankOutWord('He ran and ran again.', 'ran');
    // Should replace first occurrence
    expect(result).toContain('______');
  });

  it('does not replace partial matches (word boundaries)', () => {
    // "act" should not match inside "action"
    const result = blankOutWord('The action was decisive.', 'act');
    expect(result).toBe('The action was decisive.');
  });

  it('returns sentence unchanged when word is not found', () => {
    const result = blankOutWord('The sky is blue.', 'ocean');
    expect(result).toBe('The sky is blue.');
  });
});

// ─── generateMatchData ───────────────────────────────────────────────────────

describe('generateMatchData', () => {
  it('returns null when word has no synonyms (synonym mode)', () => {
    const wordNoSynonyms = makeWord({ id: 10, word: 'test', definition: 'a test', synonyms: [], antonyms: ['opposite'] });
    const result = generateMatchData(wordNoSynonyms, distractors, 'synonym');
    expect(result).toBeNull();
  });

  it('returns null when word has no antonyms (antonym mode)', () => {
    const wordNoAntonyms = makeWord({ id: 11, word: 'test', definition: 'a test', synonyms: ['similar'], antonyms: [] });
    const result = generateMatchData(wordNoAntonyms, distractors, 'antonym');
    expect(result).toBeNull();
  });

  it('returns 4 options for synonym mode when synonyms exist', () => {
    const result = generateMatchData(correctWord, distractors, 'synonym');
    expect(result).not.toBeNull();
    expect(result!.options).toHaveLength(4);
  });

  it('returns 4 options for antonym mode when antonyms exist', () => {
    const result = generateMatchData(correctWord, distractors, 'antonym');
    expect(result).not.toBeNull();
    expect(result!.options).toHaveLength(4);
  });

  it('includes the correct answer in options for synonym mode', () => {
    const result = generateMatchData(correctWord, distractors, 'synonym');
    expect(result!.options).toContain(result!.correctAnswer);
  });

  it('includes the correct answer in options for antonym mode', () => {
    const result = generateMatchData(correctWord, distractors, 'antonym');
    expect(result!.options).toContain(result!.correctAnswer);
  });

  it('correctAnswer is one of the word\'s synonyms in synonym mode', () => {
    const result = generateMatchData(correctWord, distractors, 'synonym');
    expect(correctWord.synonyms).toContain(result!.correctAnswer);
  });

  it('correctAnswer is one of the word\'s antonyms in antonym mode', () => {
    const result = generateMatchData(correctWord, distractors, 'antonym');
    expect(correctWord.antonyms).toContain(result!.correctAnswer);
  });

  it('matchType reflects the requested type', () => {
    const synResult = generateMatchData(correctWord, distractors, 'synonym');
    expect(synResult!.matchType).toBe('synonym');

    const antResult = generateMatchData(correctWord, distractors, 'antonym');
    expect(antResult!.matchType).toBe('antonym');
  });

  it('pads with word-strings when not enough syn/ant distractors', () => {
    // Distractors with no synonyms or antonyms
    const bareDistractors: VocabularyWord[] = [
      makeWord({ id: 20, word: 'brisk', definition: 'active and energetic', synonyms: [], antonyms: [] }),
      makeWord({ id: 21, word: 'calm', definition: 'not showing excitement', synonyms: [], antonyms: [] }),
      makeWord({ id: 22, word: 'deft', definition: 'demonstrating skill and cleverness', synonyms: [], antonyms: [] }),
    ];
    const result = generateMatchData(correctWord, bareDistractors, 'synonym');
    expect(result).not.toBeNull();
    expect(result!.options).toHaveLength(4);
    expect(result!.options).toContain(result!.correctAnswer);
  });
});

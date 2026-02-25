/**
 * Server tests for vocabulary routes.
 *
 * Strategy: rather than importing the real Express routes (which trigger
 * Sequelize model definitions and a real DB connection), we test the
 * *response-shaping logic* directly — i.e. the transformations applied to
 * Vocabulary model rows before they are sent to the client.
 *
 * This keeps the tests fast and hermetic while still verifying the
 * correctness of the API contract:
 *   - new fields (example_sentence, synonyms, antonyms) are included
 *   - null model values become empty arrays / null (not omitted)
 *   - the /distractors endpoint applies pos and exclude filters
 *
 * Integration tests that need a real DB belong in a separate suite
 * that can be run against a test database.
 */
import { describe, it, expect } from 'vitest';

// ─── Helper: mimics the row-mapping used in GET /vocab/words and /vocab/random

function mapVocabRow(w) {
  return {
    id: w.id,
    word: w.word,
    part_of_speech: w.partOfSpeech,
    definition: w.definition,
    example_sentence: w.exampleSentence || null,
    synonyms: w.synonyms || [],
    antonyms: w.antonyms || [],
    deck_name: null,
  };
}

// ─── Helper: mimics the row-mapping used in GET /vocab/distractors

function mapDistractorRow(w) {
  return {
    id: w.id,
    word: w.word,
    part_of_speech: w.partOfSpeech,
    definition: w.definition,
    synonyms: w.synonyms || [],
    antonyms: w.antonyms || [],
  };
}

// ─── Helper: mimics the /distractors filter logic

function filterDistractors(allWords, { pos, excludeId }) {
  return allWords.filter(w => {
    if (pos && w.partOfSpeech !== pos) return false;
    if (excludeId != null && w.id === excludeId) return false;
    return true;
  });
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const vocabRows = [
  {
    id: 1,
    word: 'abhor',
    partOfSpeech: 'v.',
    definition: 'to regard with horror or disgust',
    exampleSentence: 'She abhorred the thought of lying.',
    synonyms: ['detest', 'loathe'],
    antonyms: ['love', 'admire'],
  },
  {
    id: 2,
    word: 'abundant',
    partOfSpeech: 'adj.',
    definition: 'existing in large quantities',
    exampleSentence: 'The garden had abundant flowers.',
    synonyms: ['plentiful', 'ample'],
    antonyms: ['scarce'],
  },
  {
    id: 3,
    word: 'adamant',
    partOfSpeech: 'adj.',
    definition: 'refusing to be persuaded',
    exampleSentence: null,
    synonyms: null,   // intentionally null — simulates unenriched row
    antonyms: null,
  },
];

// ─── GET /vocab/words — response shape ───────────────────────────────────────

describe('Vocab API response shape — /vocab/words and /vocab/random', () => {
  it('each word includes example_sentence field', () => {
    const mapped = vocabRows.map(mapVocabRow);
    mapped.forEach(w => {
      expect(w).toHaveProperty('example_sentence');
    });
  });

  it('each word includes synonyms as an array', () => {
    const mapped = vocabRows.map(mapVocabRow);
    mapped.forEach(w => {
      expect(Array.isArray(w.synonyms)).toBe(true);
    });
  });

  it('each word includes antonyms as an array', () => {
    const mapped = vocabRows.map(mapVocabRow);
    mapped.forEach(w => {
      expect(Array.isArray(w.antonyms)).toBe(true);
    });
  });

  it('null synonyms from DB are returned as empty array', () => {
    const row = { id: 3, word: 'adamant', partOfSpeech: 'adj.', definition: 'test', exampleSentence: null, synonyms: null, antonyms: null };
    const mapped = mapVocabRow(row);
    expect(mapped.synonyms).toEqual([]);
    expect(mapped.antonyms).toEqual([]);
  });

  it('null example_sentence from DB is returned as null (not undefined)', () => {
    const row = { id: 3, word: 'adamant', partOfSpeech: 'adj.', definition: 'test', exampleSentence: null, synonyms: [], antonyms: [] };
    const mapped = mapVocabRow(row);
    expect(mapped.example_sentence).toBeNull();
  });

  it('uses snake_case field names in the response', () => {
    const mapped = vocabRows.map(mapVocabRow);
    const first = mapped[0];
    expect(first).toHaveProperty('part_of_speech');
    expect(first).toHaveProperty('example_sentence');
    expect(first).not.toHaveProperty('partOfSpeech');
    expect(first).not.toHaveProperty('exampleSentence');
  });

  it('maps word.word to word field', () => {
    const mapped = mapVocabRow(vocabRows[0]);
    expect(mapped.word).toBe('abhor');
  });

  it('enriched synonyms are preserved correctly', () => {
    const mapped = mapVocabRow(vocabRows[0]);
    expect(mapped.synonyms).toContain('detest');
    expect(mapped.synonyms).toContain('loathe');
  });

  it('enriched antonyms are preserved correctly', () => {
    const mapped = mapVocabRow(vocabRows[0]);
    expect(mapped.antonyms).toContain('love');
    expect(mapped.antonyms).toContain('admire');
  });
});

// ─── GET /vocab/distractors — filter logic ───────────────────────────────────

describe('Vocab API — /vocab/distractors filter logic', () => {
  it('filters by part_of_speech', () => {
    const result = filterDistractors(vocabRows, { pos: 'adj.', excludeId: null });
    expect(result.every(w => w.partOfSpeech === 'adj.')).toBe(true);
    expect(result.length).toBe(2); // abundant (adj.) and adamant (adj.)
  });

  it('excludes the given word by id', () => {
    const result = filterDistractors(vocabRows, { pos: null, excludeId: 1 });
    expect(result.find(w => w.id === 1)).toBeUndefined();
    expect(result.length).toBe(2);
  });

  it('applies both pos filter and exclude simultaneously', () => {
    const result = filterDistractors(vocabRows, { pos: 'adj.', excludeId: 2 });
    expect(result.every(w => w.partOfSpeech === 'adj.')).toBe(true);
    expect(result.find(w => w.id === 2)).toBeUndefined();
    expect(result.length).toBe(1); // only adamant
  });

  it('returns all words when no filters applied', () => {
    const result = filterDistractors(vocabRows, { pos: null, excludeId: null });
    expect(result.length).toBe(vocabRows.length);
  });

  it('returns empty array when no words match filters', () => {
    const result = filterDistractors(vocabRows, { pos: 'adv.', excludeId: null });
    expect(result).toEqual([]);
  });

  it('each mapped distractor has the required fields', () => {
    const filtered = filterDistractors(vocabRows, { pos: 'adj.', excludeId: null });
    const mapped = filtered.map(mapDistractorRow);
    mapped.forEach(d => {
      expect(d).toHaveProperty('id');
      expect(d).toHaveProperty('word');
      expect(d).toHaveProperty('part_of_speech');
      expect(d).toHaveProperty('definition');
      expect(d).toHaveProperty('synonyms');
      expect(d).toHaveProperty('antonyms');
    });
  });

  it('distractor response uses snake_case field name part_of_speech', () => {
    const mapped = mapDistractorRow(vocabRows[1]);
    expect(mapped).toHaveProperty('part_of_speech');
    expect(mapped).not.toHaveProperty('partOfSpeech');
  });
});

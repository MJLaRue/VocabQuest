import { writable, derived, get } from 'svelte/store';
import { vocabApi, type VocabularyWord, type Deck } from '$lib/api/vocab';
import type { APIError } from '$lib/api/client';

interface VocabFilters {
  deck: string | null;
  pos: string | null;
  search: string;
}

interface VocabState {
  words: VocabularyWord[];
  currentIndex: number;
  decks: Deck[];
  filters: VocabFilters;
  isLoading: boolean;
  error: string | null;
  mode: 'sequential' | 'random';
}

function createVocabStore() {
  const { subscribe, set, update } = writable<VocabState>({
    words: [],
    currentIndex: 0,
    decks: [],
    filters: { deck: null, pos: null, search: '' },
    isLoading: false,
    error: null,
    mode: 'sequential',
  });

  return {
    subscribe,

    async loadWords() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const state = get({ subscribe });
        const { words } = await vocabApi.getWords({
          deck: state.filters.deck || undefined,
          pos: state.filters.pos || undefined,
          search: state.filters.search || undefined,
        });
        update((state) => ({
          ...state,
          words,
          currentIndex: 0,
          isLoading: false,
        }));
      } catch (err) {
        const error = err as APIError;
        update((state) => ({
          ...state,
          isLoading: false,
          error: error.message,
        }));
      }
    },

    async loadRandomWords(limit = 20) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const state = get({ subscribe });
        const { words } = await vocabApi.getRandomWords({
          deck: state.filters.deck || undefined,
          pos: state.filters.pos || undefined,
          limit,
        });
        update((state) => ({
          ...state,
          words,
          currentIndex: 0,
          isLoading: false,
          mode: 'random',
        }));
      } catch (err) {
        const error = err as APIError;
        update((state) => ({
          ...state,
          isLoading: false,
          error: error.message,
        }));
      }
    },

    async loadDecks() {
      try {
        const { decks } = await vocabApi.getDecks();
        update((state) => ({ ...state, decks }));
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
      }
    },

    setFilter(key: keyof VocabFilters, value: string | null) {
      update((state) => ({
        ...state,
        filters: { ...state.filters, [key]: value },
      }));
      // Auto-reload words when filters change
      this.loadWords();
    },

    clearFilters() {
      update((state) => ({
        ...state,
        filters: { deck: null, pos: null, search: '' },
      }));
      this.loadWords();
    },

    nextCard() {
      update((state) => {
        if (state.mode === 'random') {
          // In random mode, pick a random card
          const nextIndex = Math.floor(Math.random() * state.words.length);
          return { ...state, currentIndex: nextIndex };
        } else {
          // In sequential mode, go to next card
          const nextIndex =
            state.currentIndex < state.words.length - 1
              ? state.currentIndex + 1
              : state.currentIndex;
          return { ...state, currentIndex: nextIndex };
        }
      });
    },

    prevCard() {
      update((state) => {
        if (state.mode === 'random') {
          // In random mode, pick a random card (but not the current one if possible)
          let nextIndex;
          if (state.words.length > 1) {
            do {
              nextIndex = Math.floor(Math.random() * state.words.length);
            } while (nextIndex === state.currentIndex && state.words.length > 1);
          } else {
            nextIndex = 0;
          }
          return { ...state, currentIndex: nextIndex };
        } else {
          // In sequential mode, go to previous card
          const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : 0;
          return { ...state, currentIndex: prevIndex };
        }
      });
    },

    goToCard(index: number) {
      update((state) => ({
        ...state,
        currentIndex: Math.max(0, Math.min(index, state.words.length - 1)),
      }));
    },

    setMode(mode: 'sequential' | 'random') {
      update((state) => ({ ...state, mode }));
      if (mode === 'random') {
        this.loadRandomWords();
      } else {
        this.loadWords();
      }
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const vocab = createVocabStore();

// Derived stores for convenience
export const currentWord = derived(
  vocab,
  ($vocab) => $vocab.words[$vocab.currentIndex] || null
);

export const progress = derived(vocab, ($vocab) => ({
  current: $vocab.currentIndex + 1,
  total: $vocab.words.length,
  percentage:
    $vocab.words.length > 0
      ? Math.round((($vocab.currentIndex + 1) / $vocab.words.length) * 100)
      : 0,
}));

export const hasNext = derived(
  vocab,
  ($vocab) => $vocab.currentIndex < $vocab.words.length - 1
);

export const hasPrev = derived(vocab, ($vocab) => $vocab.currentIndex > 0);

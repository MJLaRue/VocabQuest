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
  completedWords: VocabularyWord[];
  currentIndex: number;
  decks: Deck[];
  filters: VocabFilters;
  isLoading: boolean;
  error: string | null;
  mode: 'sequential' | 'random';
}

// LocalStorage persistence helpers
const STORAGE_KEY = 'vocabquest-vocab-state';
const STORAGE_TIMESTAMP_KEY = 'vocabquest-vocab-timestamp';
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function saveToLocalStorage(state: VocabState) {
  if (typeof window === 'undefined') return;
  
  try {
    const dataToSave = {
      words: state.words,
      completedWords: state.completedWords,
      currentIndex: state.currentIndex,
      filters: state.filters,
      mode: state.mode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to save vocab state to localStorage:', error);
  }
}

function loadFromLocalStorage(): Partial<VocabState> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
    if (!timestamp) return null;
    
    // Check if data is too old
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > MAX_AGE_MS) {
      clearLocalStorage();
      return null;
    }
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('Failed to load vocab state from localStorage:', error);
    return null;
  }
}

function clearLocalStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear vocab state from localStorage:', error);
  }
}

function createVocabStore() {
  // Try to restore from localStorage
  const restored = loadFromLocalStorage();
  
  const { subscribe, set, update } = writable<VocabState>({
    words: restored?.words || [],
    completedWords: restored?.completedWords || [],
    currentIndex: restored?.currentIndex || 0,
    decks: [],
    filters: restored?.filters || { deck: null, pos: null, search: '' },
    isLoading: false,
    error: null,
    mode: restored?.mode || 'sequential',
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
          completedWords: [], // Clear completed when loading new set
          currentIndex: 0,
          isLoading: false,
        }));
        // Clear localStorage when explicitly loading new words
        clearLocalStorage();
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
          completedWords: [], // Clear completed when loading new set
          currentIndex: 0,
          isLoading: false,
          mode: 'random',
        }));
        // Clear localStorage when explicitly loading new words
        clearLocalStorage();
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
          const newState = { ...state, currentIndex: nextIndex };
          saveToLocalStorage(newState);
          return newState;
        } else {
          // In sequential mode, go to next card
          const nextIndex =
            state.currentIndex < state.words.length - 1
              ? state.currentIndex + 1
              : state.currentIndex;
          const newState = { ...state, currentIndex: nextIndex };
          saveToLocalStorage(newState);
          return newState;
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
          const newState = { ...state, currentIndex: nextIndex };
          saveToLocalStorage(newState);
          return newState;
        } else {
          // In sequential mode, go to previous card
          const prevIndex = state.currentIndex > 0 ? state.currentIndex - 1 : 0;
          const newState = { ...state, currentIndex: prevIndex };
          saveToLocalStorage(newState);
          return newState;
        }
      });
    },

    goToCard(index: number) {
      update((state) => {
        const newState = {
          ...state,
          currentIndex: Math.max(0, Math.min(index, state.words.length - 1)),
        };
        saveToLocalStorage(newState);
        return newState;
      });
    },

    removeCurrentCard() {
      const state = get({ subscribe });
      const currentWord = state.words[state.currentIndex];
      
      if (!currentWord) return { setCompleted: false };
      
      // Move the current card to completed set
      const newCompletedWords = [...state.completedWords, currentWord];
      
      // Remove the current card from active words
      const newWords = state.words.filter((_, index) => index !== state.currentIndex);
      
      // Adjust currentIndex if necessary
      let newIndex = state.currentIndex;
      if (newIndex >= newWords.length && newWords.length > 0) {
        newIndex = newWords.length - 1;
      }
      
      const setCompleted = newWords.length === 0;
      
      update((state) => {
        const newState = {
          ...state,
          words: newWords,
          completedWords: newCompletedWords,
          currentIndex: newIndex,
        };
        saveToLocalStorage(newState);
        return newState;
      });
      
      // If we've removed all cards, load more
      if (setCompleted) {
        if (state.mode === 'random') {
          this.loadRandomWords();
        } else {
          this.loadWords();
        }
      }
      
      return { setCompleted };
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
  remaining: $vocab.words.length,
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

// Combined words for quiz generation (active + completed)
export const allAvailableWords = derived(
  vocab,
  ($vocab) => [...$vocab.words, ...$vocab.completedWords]
);

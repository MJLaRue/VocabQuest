import { apiClient } from './client';

export interface VocabularyWord {
  id: number;
  word: string;
  part_of_speech: string;
  definition: string;
  example_sentence?: string;
  deck_name?: string;
}

export interface Deck {
  name: string;
  count: number;
}

export const vocabApi = {
  getWords: (params?: {
    deck?: string;
    pos?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.deck) query.set('deck', params.deck);
    if (params?.pos) query.set('pos', params.pos);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());
    
    return apiClient<{ words: VocabularyWord[]; total: number }>(
      `/vocab/words?${query.toString()}`
    );
  },

  getDecks: () => apiClient<{ decks: Deck[] }>('/vocab/decks'),

  getRandomWords: (params?: { deck?: string; pos?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.deck) query.set('deck', params.deck);
    if (params?.pos) query.set('pos', params.pos);
    if (params?.limit) query.set('limit', params.limit.toString());
    
    return apiClient<{ words: VocabularyWord[] }>(
      `/vocab/random?${query.toString()}`
    );
  },
};

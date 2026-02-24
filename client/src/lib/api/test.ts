import { apiClient } from './client';

export type TestMode = 'quiz' | 'typing' | 'context' | 'relate';
export type TestStatus = 'in_progress' | 'completed' | 'abandoned';

export interface TestQuestion {
  vocabId: number;
  mode: TestMode;
  correct: boolean | null;
  answeredAt: string | null;
  word: string;
  partOfSpeech: string;
  definition: string;
  exampleSentence?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface TestConfig {
  questionCount: number;
  modes: TestMode[];
  advanced?: boolean;
}

export interface TestModeResult {
  correct: number;
  total: number;
  accuracy: number;
  xpEarned: number;
}

export interface TestResults {
  score: number;
  total: number;
  accuracy: number;
  xpEarned: number;
  lengthBonus: number;
  byMode: Record<TestMode, TestModeResult>;
  duration: number;
}

export interface TestAttempt {
  id: number;
  userId: number;
  startedAt: string;
  completedAt?: string;
  config: TestConfig;
  results?: TestResults;
  questions: TestQuestion[];
  xpEarned: number;
  status: TestStatus;
}

export interface StartTestResponse {
  testId: number;
  config: TestConfig;
  questions: TestQuestion[];
}

export interface AnswerResponse {
  success: boolean;
}

export interface CompleteTestResponse {
  results: TestResults;
  gamification?: {
    totalXp: number;
    level: number;
    didLevelUp: boolean;
    newAchievements: string[];
  };
}

export const testApi = {
  /**
   * Start a new test attempt.
   */
  start: (config: TestConfig) =>
    apiClient<StartTestResponse>('/test/start', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  /**
   * Submit an answer for a single question.
   */
  answer: (testId: number, questionIndex: number, correct: boolean) =>
    apiClient<AnswerResponse>('/test/answer', {
      method: 'POST',
      body: JSON.stringify({ testId, questionIndex, correct }),
    }),

  /**
   * Complete the test and calculate results + XP.
   */
  complete: (testId: number) =>
    apiClient<CompleteTestResponse>(`/test/${testId}/complete`, {
      method: 'POST',
    }),

  /**
   * Get the authenticated user's test history.
   */
  getHistory: () =>
    apiClient<{ attempts: TestAttempt[] }>('/test/history'),

  /**
   * Get a single test attempt by ID.
   */
  getAttempt: (testId: number) =>
    apiClient<{ attempt: TestAttempt }>(`/test/${testId}`),
};

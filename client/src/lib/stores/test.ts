import { writable, derived, get } from 'svelte/store';
import {
  testApi,
  type TestAttempt,
  type TestConfig,
  type TestQuestion,
  type TestResults,
} from '$lib/api/test';

interface TestState {
  // Active test
  activeTest: TestAttempt | null;
  currentQuestionIndex: number;
  isLoading: boolean;
  error: string | null;

  // History
  history: TestAttempt[];
  historyLoaded: boolean;

  // Results from last completed test
  lastResults: TestResults | null;
  lastGamification: {
    totalXp: number;
    level: number;
    didLevelUp: boolean;
    newAchievements: { id: string; name: string; level: number; xp: number }[];
  } | null;
}

const initialState: TestState = {
  activeTest: null,
  currentQuestionIndex: 0,
  isLoading: false,
  error: null,
  history: [],
  historyLoaded: false,
  lastResults: null,
  lastGamification: null,
};

function createTestStore() {
  const { subscribe, set, update } = writable<TestState>(initialState);

  return {
    subscribe,

    /** Start a new test with the given config. */
    async startTest(config: TestConfig): Promise<number> {
      update(s => ({ ...s, isLoading: true, error: null }));
      try {
        const data = await testApi.start(config);

        // Build full TestAttempt shape from response
        const newAttempt: TestAttempt = {
          id: data.testId,
          userId: 0, // filled server-side
          startedAt: new Date().toISOString(),
          config: data.config,
          questions: data.questions,
          xpEarned: 0,
          status: 'in_progress',
        };

        update(s => ({
          ...s,
          activeTest: newAttempt,
          currentQuestionIndex: 0,
          isLoading: false,
          lastResults: null,
          lastGamification: null,
        }));

        return data.testId;
      } catch (err: any) {
        update(s => ({ ...s, isLoading: false, error: err.message || 'Failed to start test' }));
        throw err;
      }
    },

    /** Record an answer for the current question, advance to the next. */
    async answerQuestion(correct: boolean): Promise<void> {
      const state = get({ subscribe });
      if (!state.activeTest) return;

      const { id: testId, questions } = state.activeTest;
      const qIndex = state.currentQuestionIndex;

      // Update the answer in local state immediately (for UI feedback),
      // but do NOT advance currentQuestionIndex yet — if we did, isTestComplete
      // would fire synchronously and completeTest() would race the server write.
      update(s => {
        if (!s.activeTest) return s;
        const updatedQuestions = [...s.activeTest.questions];
        updatedQuestions[qIndex] = {
          ...updatedQuestions[qIndex],
          correct,
          answeredAt: new Date().toISOString(),
        };
        return {
          ...s,
          activeTest: { ...s.activeTest, questions: updatedQuestions },
        };
      });

      // Persist to server first — the last answer must be saved before
      // completeTest() is triggered by the isTestComplete reactive.
      try {
        await testApi.answer(testId, qIndex, correct);
      } catch (err) {
        console.error('Failed to record answer:', err);
      }

      // Advance the question index only after the server confirms,
      // so isTestComplete never becomes true before the answer is stored.
      update(s => ({
        ...s,
        currentQuestionIndex: Math.min(qIndex + 1, questions.length),
      }));
    },

    /** Complete the test and retrieve results. */
    async completeTest(): Promise<TestResults> {
      const state = get({ subscribe });
      if (!state.activeTest) throw new Error('No active test');

      update(s => ({ ...s, isLoading: true, error: null }));
      try {
        const data = await testApi.complete(state.activeTest.id);

        update(s => ({
          ...s,
          isLoading: false,
          lastResults: data.results,
          lastGamification: data.gamification || null,
          activeTest: s.activeTest
            ? { ...s.activeTest, status: 'completed', results: data.results, xpEarned: data.results.xpEarned }
            : null,
        }));

        return data.results;
      } catch (err: any) {
        update(s => ({ ...s, isLoading: false, error: err.message || 'Failed to complete test' }));
        throw err;
      }
    },

    /** Load the user's test history. */
    async loadHistory(): Promise<void> {
      update(s => ({ ...s, isLoading: true, error: null }));
      try {
        const data = await testApi.getHistory();
        update(s => ({
          ...s,
          isLoading: false,
          history: data.attempts,
          historyLoaded: true,
        }));
      } catch (err: any) {
        update(s => ({ ...s, isLoading: false, error: err.message || 'Failed to load history' }));
      }
    },

    /** Load a single test attempt (for results page). */
    async loadAttempt(testId: number): Promise<TestAttempt | null> {
      update(s => ({ ...s, isLoading: true, error: null }));
      try {
        const data = await testApi.getAttempt(testId);
        update(s => ({ ...s, isLoading: false }));
        return data.attempt;
      } catch (err: any) {
        update(s => ({ ...s, isLoading: false, error: err.message || 'Failed to load test' }));
        return null;
      }
    },

    /** Clear the active test (e.g. when navigating away). */
    clearActiveTest() {
      update(s => ({ ...s, activeTest: null, currentQuestionIndex: 0 }));
    },

    /** Reset the entire store (on logout). */
    reset() {
      set(initialState);
    },
  };
}

export const testStore = createTestStore();

// Derived helpers
export const currentQuestion = derived(testStore, $t => {
  if (!$t.activeTest) return null;
  return $t.activeTest.questions[$t.currentQuestionIndex] ?? null;
});

export const testProgress = derived(testStore, $t => {
  if (!$t.activeTest) return { answered: 0, total: 0, percent: 0 };
  const total = $t.activeTest.questions.length;
  const answered = $t.currentQuestionIndex;
  return { answered, total, percent: total > 0 ? Math.round((answered / total) * 100) : 0 };
});

export const isTestComplete = derived(testStore, $t => {
  if (!$t.activeTest) return false;
  return $t.currentQuestionIndex >= $t.activeTest.questions.length;
});

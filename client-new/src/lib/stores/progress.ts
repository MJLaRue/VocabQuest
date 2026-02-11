import { writable, derived, get } from 'svelte/store';
import {
  progressApi,
  type UserProgress,
  type UserStats,
  type StudySessionData,
  type ActiveSession,
} from '$lib/api/progress';
import type { APIError } from '$lib/api/client';
import { auth } from './auth';

interface ProgressState {
  userProgress: Map<number, UserProgress>;
  stats: UserStats | null;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
  difficultWords: Array<{ word: string; vocab_id: number; accuracy: number }>;
  currentSession: {
    id: number | null;
    mode: 'practice' | 'quiz' | 'typing' | null;
    startTime: number | null;
    cardsReviewed: number;
    correctAnswers: number;
    correctStreakBonus: number;
    completedSets: number;
    totalXpEarned: number;
    didLevelUp: boolean;
  };
  lastSessionSummary: {
    cardsReviewed: number;
    correctAnswers: number;
    xpEarned: number;
    duration: number;
    completedSets: number;
    levelUp: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
}

function createProgressStore() {
  const { subscribe, set, update } = writable<ProgressState>({
    userProgress: new Map(),
    stats: null,
    achievements: [],
    difficultWords: [],
    currentSession: {
      id: null,
      mode: null,
      startTime: null,
      cardsReviewed: 0,
      correctAnswers: 0,
      correctStreakBonus: 0,
      completedSets: 0,
      totalXpEarned: 0,
      didLevelUp: false,
    },
    lastSessionSummary: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    async loadProgress() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const { progress } = await progressApi.getProgress();
        const progressMap = new Map(progress.map((p) => [p.vocab_id, p]));
        update((state) => ({
          ...state,
          userProgress: progressMap,
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

    async loadStats() {
      try {
        const stats = await progressApi.getStats();
        update((state) => ({ ...state, stats }));
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
      }
    },

    async loadAchievements() {
      try {
        const { achievements } = await progressApi.getAchievements();
        update((state) => ({ ...state, achievements }));
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
      }
    },

    async loadDifficultWords(limit: number = 10) {
      try {
        const { difficultWords } = await progressApi.getDifficultWords(limit);
        // Transform to match the expected format
        const weakWords = difficultWords.map(w => ({
          word: w.word,
          vocab_id: w.id,
          accuracy: w.reviewCount > 0 
            ? Math.round((w.correctCount / w.reviewCount) * 100)
            : 0
        }));
        update((state) => ({ ...state, difficultWords: weakWords }));
        return weakWords;
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
        return [];
      }
    },

    async updateProgress(vocabId: number, isKnown: boolean) {
      try {
        // Get current mode from state
        const state = get({ subscribe });
        const mode = state.currentSession.mode || 'practice';
        
        // Calculate XP with streak bonus
        let baseXP = 10;
        if (mode === 'quiz') baseXP = 15;
        else if (mode === 'typing') baseXP = 20;
        
        // Add streak bonus BEFORE updating (we want the bonus from the previous streak)
        const streakBonus = isKnown ? state.currentSession.correctStreakBonus : 0;
        const totalXP = baseXP + streakBonus;
        
        const result = await progressApi.updateProgress(vocabId, isKnown, mode, totalXP);

        update((state) => {
          return {
            ...state,
            currentSession: {
              ...state.currentSession,
              cardsReviewed: state.currentSession.cardsReviewed + 1,
              correctAnswers: isKnown
                ? state.currentSession.correctAnswers + 1
                : state.currentSession.correctAnswers,
              correctStreakBonus: isKnown
                ? state.currentSession.correctStreakBonus + 1
                : 0,
              totalXpEarned: state.currentSession.totalXpEarned + (result.xpEarned || 0),
              didLevelUp: state.currentSession.didLevelUp || result.leveledUp,
            },
          };
        });

        // Update user's gamification data in auth store
        if (result.xpEarned > 0 || result.leveledUp) {
          auth.checkSession();
        }

        return {
          xpEarned: result.xpEarned,
          levelUp: result.leveledUp,
          newLevel: result.newLevel,
          newAchievements: result.newAchievements,
        };
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
        throw error;
      }
    },

    async checkAndResumeSession(requestedMode: 'practice' | 'quiz' | 'typing') {
      try {
        const { session } = await progressApi.getActiveSession();
        
        if (!session) {
          // No active session, start new one
          return await this.startSession(requestedMode);
        }
        
        // Check if session is older than 30 minutes
        const sessionAge = Date.now() - new Date(session.updatedAt).getTime();
        const THIRTY_MINUTES = 30 * 60 * 1000;
        
        if (sessionAge > THIRTY_MINUTES) {
          // Session is stale, end it and start new one
          await progressApi.endSession(session.id, {
            mode: session.mode,
            xp_earned: session.xpEarned,
            cards_reviewed: session.cardsReviewed,
            correct_answers: session.correctAnswers,
          });
          return await this.startSession(requestedMode);
        }
        
        // Session is recent, resume it
        update((state) => ({
          ...state,
          currentSession: {
            id: session.id,
            mode: session.mode,
            startTime: new Date(session.startedAt).getTime(),
            cardsReviewed: session.cardsReviewed,
            correctAnswers: session.correctAnswers,
            correctStreakBonus: 0, // Reset streak bonus on resume
            completedSets: 0, // Reset on resume
            totalXpEarned: session.xpEarned,
            didLevelUp: false,
          },
        }));
        return session.id;
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
        throw error;
      }
    },

    async startSession(mode: 'practice' | 'quiz' | 'typing') {
      try {
        const { session_id } = await progressApi.startSession(mode);
        update((state) => ({
          ...state,
          currentSession: {
            id: session_id,
            mode,
            startTime: Date.now(),
            cardsReviewed: 0,
            correctAnswers: 0,
            correctStreakBonus: 0,
            completedSets: 0,
            totalXpEarned: 0,
            didLevelUp: false,
          },
        }));
        return session_id;
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
        throw error;
      }
    },

    updateSessionMode(mode: 'practice' | 'quiz' | 'typing') {
      const state = get({ subscribe });
      if (state.currentSession.id) {
        // Update backend
        progressApi.updateSessionMode(state.currentSession.id, mode).catch((err) => {
          console.error('Failed to update session mode:', err);
        });
      }
      
      // Update local state
      update((state) => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          mode,
        },
      }));
    },

    async endSession() {
      try {
        // Get current state synchronously
        let currentState: ProgressState;
        const unsubscribe = subscribe((s) => {
          currentState = s;
        });
        unsubscribe();

        if (!currentState!.currentSession.id || !currentState!.currentSession.mode) {
          throw new Error('No active session');
        }

        // Capture session stats before ending
        const duration = currentState!.currentSession.startTime
          ? Math.floor((Date.now() - currentState!.currentSession.startTime) / 1000)
          : 0;

        const sessionData: StudySessionData = {
          mode: currentState!.currentSession.mode,
          xp_earned: currentState!.currentSession.totalXpEarned,
          cards_reviewed: currentState!.currentSession.cardsReviewed,
          correct_answers: currentState!.currentSession.correctAnswers,
        };

        const result = await progressApi.endSession(
          currentState!.currentSession.id,
          sessionData
        );

        update((state) => ({
          ...state,
          lastSessionSummary: {
            cardsReviewed: currentState!.currentSession.cardsReviewed,
            correctAnswers: currentState!.currentSession.correctAnswers,
            xpEarned: currentState!.currentSession.totalXpEarned,
            duration,
            completedSets: currentState!.currentSession.completedSets,
            levelUp: currentState!.currentSession.didLevelUp,
          },
          currentSession: {
            id: null,
            mode: null,
            startTime: null,
            cardsReviewed: 0,
            correctAnswers: 0,
            correctStreakBonus: 0,
            completedSets: 0,
            totalXpEarned: 0,
            didLevelUp: false,
          },
        }));

        // Refresh stats and gamification data
        this.loadStats();
        auth.checkSession();

        return result;
      } catch (err) {
        const error = err as APIError;
        update((state) => ({ ...state, error: error.message }));
        throw error;
      }
    },

    getWordProgress(vocabId: number) {
      let result: UserProgress | undefined;
      subscribe((state) => {
        result = state.userProgress.get(vocabId);
      })();
      return result;
    },

    awardSetCompletionBonus() {
      const SET_COMPLETION_BONUS = 50;
      
      update((state) => ({
        ...state,
        currentSession: {
          ...state.currentSession,
          completedSets: state.currentSession.completedSets + 1,
          totalXpEarned: state.currentSession.totalXpEarned + SET_COMPLETION_BONUS,
        },
      }));
      
      // Refresh gamification data
      auth.checkSession();
      
      return SET_COMPLETION_BONUS;
    },

    clearError() {
      update((state) => ({ ...state, error: null }));
    },
  };
}

export const progress = createProgressStore();

// Derived stores
export const sessionStats = derived(progress, ($progress) => ({
  cardsReviewed: $progress.currentSession.cardsReviewed,
  correctAnswers: $progress.currentSession.correctAnswers,
  accuracy:
    $progress.currentSession.cardsReviewed > 0
      ? Math.round(
          ($progress.currentSession.correctAnswers /
            $progress.currentSession.cardsReviewed) *
            100
        )
      : 0,
  duration: $progress.currentSession.startTime
    ? Math.floor((Date.now() - $progress.currentSession.startTime) / 1000)
    : 0,
}));

export const hasActiveSession = derived(
  progress,
  ($progress) => $progress.currentSession.id !== null
);

export const unlockedAchievements = derived(progress, ($progress) =>
  $progress.achievements.filter((a) => a.unlocked)
);

export const lockedAchievements = derived(progress, ($progress) =>
  $progress.achievements.filter((a) => !a.unlocked)
);

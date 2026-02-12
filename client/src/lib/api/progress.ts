import { apiClient } from './client';

export interface UserProgress {
  vocab_id: number;
  is_known: boolean;
  review_count: number;
  correct_count: number;
  incorrect_count: number;
  last_reviewed?: string;
  next_review_date?: string;
}

export interface StudySessionData {
  mode: 'practice' | 'quiz' | 'typing';
  xp_earned: number;
  cards_reviewed: number;
  correct_answers: number;
}

export interface ActiveSession {
  id: number;
  mode: 'practice' | 'quiz' | 'typing';
  startedAt: string;
  cardsReviewed: number;
  correctAnswers: number;
  xpEarned: number;
  updatedAt: string;
}

export interface UserStats {
  gamification: {
    level: number;
    totalXp: number;
    dailyStreak: number;
    achievements: string[];
  };
  progress: {
    wordsLearned: number;
    totalWords: number;
    inProgressWords: number;
    totalReviews: number;
    totalCorrect: number;
    totalIncorrect: number;
    accuracy: number;
  };
  activity: {
    totalSessions: number;
    totalStudyTime: number; // minutes
    avgSessionTime: number; // minutes
    lastStudy: string | null;
    recentSessions: Array<{
      date: string;
      xpEarned: number;
      mode: string;
      duration: number; // milliseconds
    }>;
  };
}

export const progressApi = {
  updateProgress: (vocabId: number, isKnown: boolean, mode: 'practice' | 'quiz' | 'typing' = 'practice', xpEarned: number = 0) =>
    apiClient<{
      success: boolean;
      leveledUp: boolean;
      newLevel: number;
      newAchievements: string[];
      streak: number;
      totalXp: number;
      xpEarned: number;
    }>(
      '/progress/answer',
      {
        method: 'POST',
        body: JSON.stringify({ vocabId, correct: isKnown, mode, xpEarned }),
      }
    ),

  getProgress: () =>
    apiClient<{ progress: UserProgress[] }>('/progress'),

  getActiveSession: () =>
    apiClient<{ session: ActiveSession | null; timedOut?: boolean }>('/progress/session/active'),

  updateSessionMode: (sessionId: number, mode: 'practice' | 'quiz' | 'typing') =>
    apiClient<{ success: boolean }>(`/progress/session/${sessionId}/mode`, {
      method: 'PATCH',
      body: JSON.stringify({ mode }),
    }),

  startSession: (mode: 'practice' | 'quiz' | 'typing') =>
    apiClient<{ session_id: number }>('/progress/session/start', {
      method: 'POST',
      body: JSON.stringify({ mode }),
    }),

  endSession: (sessionId: number, data: StudySessionData) =>
    apiClient<{ xpEarned: number; levelUp: boolean; newAchievements: string[] }>(
      `/progress/session/${sessionId}/end`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),

  getStats: () => apiClient<UserStats>('/progress/stats'),

  getAchievements: () =>
    apiClient<{
      achievements: Array<{
        id: string;
        name: string;
        description: string;
        icon: string;
        unlocked: boolean;
        type: 'vocab_builder' | 'streak_warrior' | 'perfectionist' | 'xp_enthusiast' | 'one_off';
        level?: number;
        totalTiers?: number;
        currentValue?: number;
        nextThreshold?: number;
        currentThreshold?: number;
        unlockedAt?: string;
      }>;
    }>('/progress/achievements'),

  getDifficultWords: (limit: number = 10) =>
    apiClient<{
      difficultWords: Array<{
        id: number;
        word: string;
        definition: string;
        part_of_speech: string;
        example_sentence: string;
        difficultyScore: number;
        correctCount: number;
        incorrectCount: number;
        reviewCount: number;
      }>;
    }>(`/progress/difficult?limit=${limit}`),

  getLeaderboard: () =>
    apiClient<{
      leaderboard: Array<LeaderboardEntry>;
    }>('/progress/leaderboard'),
};

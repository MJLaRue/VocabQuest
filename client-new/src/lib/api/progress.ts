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
};

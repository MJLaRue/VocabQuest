import { describe, it, expect } from 'vitest';

// Pure logic mirroring what the new /admin/users/:id/stats endpoint will do.
// We test this in isolation so we don't need a DB connection.

function calcProgressStats(allProgress) {
  const totalCorrect = allProgress.reduce((sum, p) => sum + p.correctCount, 0);
  const totalIncorrect = allProgress.reduce((sum, p) => sum + p.incorrectCount, 0);
  const wordsLearned = allProgress.filter(p => p.isKnown).length;
  const inProgressWords = allProgress.filter(p => !p.isKnown && p.reviewCount > 0).length;
  const accuracy =
    totalCorrect + totalIncorrect > 0
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100)
      : 0;
  return { wordsLearned, inProgressWords, accuracy };
}

function calcActivityStats(sessions) {
  const totalSessions = sessions.length;
  const totalStudyTimeMs = sessions.reduce((sum, s) => {
    if (s.endedAt && s.startedAt)
      return sum + (new Date(s.endedAt) - new Date(s.startedAt));
    return sum;
  }, 0);
  const avgMs = totalSessions > 0 ? totalStudyTimeMs / totalSessions : 0;
  return {
    totalSessions,
    totalStudyTime: Math.round(totalStudyTimeMs / 60000),
    avgSessionTime: Math.round(avgMs / 60000),
  };
}

describe('calcProgressStats', () => {
  it('counts learned, in-progress, and accuracy correctly', () => {
    const progress = [
      { isKnown: true,  reviewCount: 3, correctCount: 3, incorrectCount: 0 },
      { isKnown: true,  reviewCount: 2, correctCount: 1, incorrectCount: 1 },
      { isKnown: false, reviewCount: 2, correctCount: 1, incorrectCount: 1 }, // in-progress
      { isKnown: false, reviewCount: 0, correctCount: 0, incorrectCount: 0 }, // not started
    ];
    const result = calcProgressStats(progress);
    expect(result.wordsLearned).toBe(2);
    expect(result.inProgressWords).toBe(1);
    expect(result.accuracy).toBe(71); // 5 correct / 7 total = 71%
  });

  it('returns 0 accuracy when no reviews', () => {
    expect(calcProgressStats([{ isKnown: false, reviewCount: 0, correctCount: 0, incorrectCount: 0 }]).accuracy).toBe(0);
  });

  it('returns zeros for empty progress', () => {
    const result = calcProgressStats([]);
    expect(result.wordsLearned).toBe(0);
    expect(result.inProgressWords).toBe(0);
    expect(result.accuracy).toBe(0);
  });
});

describe('calcActivityStats', () => {
  it('converts ms to minutes and averages correctly', () => {
    const sessions = [
      { startedAt: new Date('2026-05-07T09:00:00Z'), endedAt: new Date('2026-05-07T09:20:00Z') }, // 20 min
      { startedAt: new Date('2026-05-07T10:00:00Z'), endedAt: new Date('2026-05-07T10:40:00Z') }, // 40 min
    ];
    const result = calcActivityStats(sessions);
    expect(result.totalSessions).toBe(2);
    expect(result.totalStudyTime).toBe(60);
    expect(result.avgSessionTime).toBe(30);
  });

  it('skips sessions with no endedAt', () => {
    const sessions = [
      { startedAt: new Date('2026-05-07T09:00:00Z'), endedAt: null },
    ];
    const result = calcActivityStats(sessions);
    expect(result.totalSessions).toBe(1);
    expect(result.totalStudyTime).toBe(0);
    expect(result.avgSessionTime).toBe(0);
  });

  it('returns zeros for empty sessions', () => {
    const result = calcActivityStats([]);
    expect(result.totalSessions).toBe(0);
    expect(result.totalStudyTime).toBe(0);
    expect(result.avgSessionTime).toBe(0);
  });
});

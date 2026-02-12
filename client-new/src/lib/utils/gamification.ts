/**
 * Shared gamification logic for XP and Level calculations.
 * Formula: level = floor(sqrt(totalXp / 100)) + 1
 */

export interface LevelProgress {
    level: number;
    progress: number;
    xpIntoLevel: number;
    xpNeededForNextLevel: number;
    xpAtCurrentLevel: number;
    xpAtNextLevel: number;
    totalXp: number;
}

/**
 * Calculates the current level based on total XP.
 */
export function calculateLevel(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / 100)) + 1;
}

/**
 * Gets detailed level progress information.
 */
export function getLevelProgress(totalXp: number): LevelProgress {
    const level = calculateLevel(totalXp);

    // XP range for level L is: [(L-1)^2 * 100, L^2 * 100)
    const xpAtCurrentLevel = Math.pow(level - 1, 2) * 100;
    const xpAtNextLevel = Math.pow(level, 2) * 100;

    const xpIntoLevel = totalXp - xpAtCurrentLevel;
    const xpNeededForNextLevel = xpAtNextLevel - xpAtCurrentLevel;

    const progress = Math.min(100, Math.max(0, (xpIntoLevel / xpNeededForNextLevel) * 100));

    return {
        level,
        progress,
        xpIntoLevel,
        xpNeededForNextLevel,
        xpAtCurrentLevel,
        xpAtNextLevel,
        totalXp
    };
}

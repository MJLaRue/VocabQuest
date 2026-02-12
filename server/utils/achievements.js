/**
 * Achievement System Configuration and Helpers
 */

const ACHIEVEMENT_CONFIG = {
    vocab_builder: {
        name: 'Vocab Builder',
        description: 'Learn {n} words',
        icon: 'book',
        tiers: [
            { threshold: 50, id: 'words_50', xp: 150 },
            { threshold: 100, id: 'words_100', xp: 200 },
            { threshold: 200, id: 'words_200', xp: 300 },
            { threshold: 350, id: 'words_350', xp: 450 },
            { threshold: 550, id: 'words_550', xp: 600 },
            { threshold: 800, id: 'words_800', xp: 800 },
            { threshold: 1100, id: 'words_1100', xp: 1000 },
            { threshold: 1450, id: 'words_1450', xp: 1250 },
            { threshold: 1850, id: 'words_1850', xp: 1500 },
            { threshold: 2300, id: 'words_2300', xp: 2000 }
        ]
    },
    streak_warrior: {
        name: 'Streak Warrior',
        description: 'Maintain a {n}-day study streak',
        icon: 'flame',
        tiers: [
            { threshold: 3, id: 'streak_3', xp: 50 },
            { threshold: 7, id: 'streak_7', xp: 100 },
            { threshold: 14, id: 'streak_14', xp: 200 },
            { threshold: 21, id: 'streak_21', xp: 300 },
            { threshold: 30, id: 'streak_30', xp: 500 },
            { threshold: 50, id: 'streak_50', xp: 750 },
            { threshold: 75, id: 'streak_75', xp: 1000 },
            { threshold: 100, id: 'streak_100', xp: 1500 },
            { threshold: 180, id: 'streak_180', xp: 2500 },
            { threshold: 365, id: 'streak_365', xp: 5000 }
        ]
    },
    perfectionist: {
        name: 'Perfectionist',
        description: 'Complete {n} sessions with 100% accuracy',
        icon: 'trophy',
        tiers: [
            { threshold: 1, id: 'perfect_1', xp: 50 },
            { threshold: 5, id: 'perfect_5', xp: 150 },
            { threshold: 10, id: 'perfect_10', xp: 300 },
            { threshold: 25, id: 'perfect_25', xp: 600 },
            { threshold: 50, id: 'perfect_50', xp: 1000 },
            { threshold: 100, id: 'perfect_100', xp: 2000 },
            { threshold: 200, id: 'perfect_200', xp: 4000 },
            { threshold: 500, id: 'perfect_500', xp: 10000 }
        ]
    },
    xp_enthusiast: {
        name: 'XP Enthusiast',
        description: 'Earn {n} total XP',
        icon: 'star',
        tiers: [
            { threshold: 1000, id: 'xp_1k', xp: 100 },
            { threshold: 5000, id: 'xp_5k', xp: 250 },
            { threshold: 15000, id: 'xp_15k', xp: 500 },
            { threshold: 40000, id: 'xp_40k', xp: 1000 },
            { threshold: 100000, id: 'xp_100k', xp: 2500 },
            { threshold: 250000, id: 'xp_250k', xp: 5000 },
            { threshold: 500000, id: 'xp_500k', xp: 10000 },
            { threshold: 1000000, id: 'xp_1m', xp: 25000 }
        ]
    },
    one_off: {
        first_correct: {
            name: 'First Step',
            description: 'Answer your first question correctly',
            icon: 'star',
            xp: 50
        }
    }
};

/**
 * Checks for newly unlocked achievements
 * @param {Object} userData - Current user progress data
 * @param {Array} currentUnlocked - List of already unlocked achievement IDs
 * @returns {Array} List of newly unlocked achievement info {id, xp}
 */
function checkAchievements(userData, currentUnlocked) {
    const newUnlocks = [];
    const currentSet = new Set(currentUnlocked);

    // 1. One-off achievements
    if (userData.correctCount > 0 && !currentSet.has('first_correct')) {
        newUnlocks.push({
            id: 'first_correct',
            xp: ACHIEVEMENT_CONFIG.one_off.first_correct.xp
        });
    }

    // 2. Tiered achievements
    const tieredChecks = [
        { type: 'vocab_builder', value: userData.learnedCount },
        { type: 'streak_warrior', value: userData.streak },
        { type: 'perfectionist', value: userData.perfectSessions },
        { type: 'xp_enthusiast', value: userData.totalXp }
    ];

    for (const check of tieredChecks) {
        const config = ACHIEVEMENT_CONFIG[check.type];
        for (const tier of config.tiers) {
            if (check.value >= tier.threshold && !currentSet.has(tier.id)) {
                newUnlocks.push({
                    id: tier.id,
                    xp: tier.xp,
                    name: config.name,
                    level: config.tiers.indexOf(tier) + 1
                });
            }
        }
    }

    return newUnlocks;
}

/**
 * Gets all achievements with their status for a user
 * @param {Array} unlockedIds - List of unlocked achievement IDs
 * @param {Object} userData - Current user progress data
 * @returns {Array} List of achievement objects for display
 */
function getAllAchievementsStatus(unlockedIds, userData) {
    const unlockedSet = new Set(unlockedIds);
    const result = [];

    // Add one-offs
    for (const [id, config] of Object.entries(ACHIEVEMENT_CONFIG.one_off)) {
        result.push({
            id,
            name: config.name,
            description: config.description,
            icon: config.icon,
            unlocked: unlockedSet.has(id),
            type: 'one_off'
        });
    }

    // Add tiered
    for (const [type, config] of Object.entries(ACHIEVEMENT_CONFIG)) {
        if (type === 'one_off') continue;

        // Find highest unlocked tier
        let highestTier = -1;
        for (let i = config.tiers.length - 1; i >= 0; i--) {
            if (unlockedSet.has(config.tiers[i].id)) {
                highestTier = i;
                break;
            }
        }

        const nextTier = config.tiers[highestTier + 1];
        const currentTier = config.tiers[highestTier];

        result.push({
            type,
            name: config.name,
            description: config.description.replace('{n}', nextTier?.threshold || currentTier?.threshold),
            icon: config.icon,
            level: highestTier + 1,
            totalTiers: config.tiers.length,
            unlocked: highestTier >= 0,
            currentValue: getProgressValue(type, userData),
            nextThreshold: nextTier?.threshold,
            currentThreshold: currentTier?.threshold,
            id: currentTier?.id || nextTier?.id
        });
    }

    return result;
}

function getProgressValue(type, userData) {
    switch (type) {
        case 'vocab_builder': return userData.learnedCount;
        case 'streak_warrior': return userData.streak;
        case 'perfectionist': return userData.perfectSessions;
        case 'xp_enthusiast': return userData.totalXp;
        default: return 0;
    }
}

module.exports = {
    ACHIEVEMENT_CONFIG,
    checkAchievements,
    getAllAchievementsStatus
};

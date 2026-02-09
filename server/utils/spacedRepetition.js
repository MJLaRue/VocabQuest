/**
 * Spaced Repetition Algorithm (Simplified SM-2)
 * 
 * This implements a simplified version of the SuperMemo 2 algorithm.
 * Words are reviewed at increasing intervals based on how well they're remembered.
 */

/**
 * Calculate the next review date and updated parameters
 * @param {number} quality - Quality of recall (0-5)
 *   5: Perfect recall
 *   4: Correct with hesitation
 *   3: Correct with difficulty
 *   2: Incorrect, but remembered
 *   1: Incorrect, barely remembered
 *   0: Complete blackout
 * @param {number} currentEaseFactor - Current ease factor (default 2.5)
 * @param {number} currentInterval - Current review interval in days
 * @param {number} reviewCount - Number of times reviewed
 * @returns {object} { easeFactor, interval, nextReviewDate }
 */
function calculateNextReview(quality, currentEaseFactor = 2.5, currentInterval = 0, reviewCount = 0) {
  let easeFactor = currentEaseFactor;
  let interval = currentInterval;
  
  // Update ease factor based on quality
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  
  // Ease factor should be at least 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }
  
  // Calculate new interval
  if (quality < 3) {
    // Incorrect answer - reset interval
    interval = 0;
  } else {
    // Correct answer - increase interval
    if (reviewCount === 0) {
      interval = 1; // First review: 1 day
    } else if (reviewCount === 1) {
      interval = 6; // Second review: 6 days
    } else {
      // Subsequent reviews: multiply by ease factor
      interval = Math.round(interval * easeFactor);
    }
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return {
    easeFactor: Math.round(easeFactor * 100) / 100, // Round to 2 decimals
    interval,
    nextReviewDate
  };
}

/**
 * Convert answer correctness to quality rating
 * @param {boolean} correct - Whether the answer was correct
 * @param {number} responseTime - Optional response time in milliseconds
 * @returns {number} Quality rating (0-5)
 */
function correctnessToQuality(correct, responseTime = null) {
  if (!correct) {
    return 1; // Incorrect but tried
  }
  
  // If we have response time, use it to determine quality
  if (responseTime !== null) {
    if (responseTime < 3000) return 5; // Very fast (< 3 seconds)
    if (responseTime < 5000) return 4; // Fast (< 5 seconds)
    if (responseTime < 10000) return 3; // Medium (< 10 seconds)
    return 3; // Slow but correct
  }
  
  // Default: assume good recall if correct
  return 4;
}

/**
 * Check if a word is due for review
 * @param {Date} nextReviewDate - When the word should be reviewed next
 * @returns {boolean} True if due for review
 */
function isDueForReview(nextReviewDate) {
  if (!nextReviewDate) return true;
  return new Date() >= new Date(nextReviewDate);
}

module.exports = {
  calculateNextReview,
  correctnessToQuality,
  isDueForReview
};

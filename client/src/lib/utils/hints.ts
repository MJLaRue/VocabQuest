/**
 * Generate progressive hint for a word
 * @param word - The word to generate hint for
 * @param hintLevel - The hint level (1, 2, or 3)
 * @returns The hint string with revealed letters
 */
export function generateHint(word: string, hintLevel: number): string {
  if (!word || hintLevel < 1) return '';

  const letters = word.split('');
  
  switch (hintLevel) {
    case 1:
      // Level 1: Show only first letter
      return letters.map((char, i) => i === 0 ? char : '_').join('');
    
    case 2:
      // Level 2: Show every other letter starting with first
      return letters.map((char, i) => i % 2 === 0 ? char : '_').join('');
    
    case 3:
      // Level 3: Show all letters except the last one
      return letters.map((char, i) => i < letters.length - 1 ? char : '_').join('');
    
    default:
      return word;
  }
}

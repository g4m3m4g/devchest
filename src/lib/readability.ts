export interface ReadabilityResult {
  words: number;
  sentences: number;
  syllables: number;
  readingEase: number;
  gradeLevel: number;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  const matches = trimmed.split(/[.!?]+/).map(s => s.trim()).filter(s => s !== '');
  return matches.length > 0 ? matches.length : 1;
}

export function countSyllablesInWord(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned === '') return 0;

  const matches = cleaned.match(/[aeiouy]+/g);
  let count = matches ? matches.length : 0;

  if (cleaned.endsWith('e') && count > 1) count--;

  return Math.max(count, 1);
}

function countTotalSyllables(text: string): number {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  return trimmed.split(/\s+/).reduce((sum, word) => sum + countSyllablesInWord(word), 0);
}

export function analyzeReadability(text: string): ReadabilityResult {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countTotalSyllables(text);

  if (words === 0 || sentences === 0) {
    return { words, sentences, syllables, readingEase: 0, gradeLevel: 0 };
  }

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;

  const readingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const gradeLevel = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  return { words, sentences, syllables, readingEase, gradeLevel };
}

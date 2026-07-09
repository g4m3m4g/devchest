import { countWords, countSentences } from './readability';

export interface SentenceCountResult {
  sentences: number;
  words: number;
  characters: number;
  averageWordsPerSentence: number;
}

export function analyzeSentences(text: string): SentenceCountResult {
  const trimmed = text.trim();
  const words = countWords(text);
  const sentences = countSentences(text);
  const characters = trimmed.length;

  return {
    sentences,
    words,
    characters,
    averageWordsPerSentence: sentences === 0 ? 0 : words / sentences,
  };
}

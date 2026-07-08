export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeSeconds: number;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countCharactersNoSpaces(text: string): number {
  return text.replace(/\s/g, '').length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(Boolean).length;
}

export function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean).length;
}

export function countLines(text: string): number {
  if (text === '') return 0;
  return text.split('\n').length;
}

export function estimateReadingTime(words: number, wordsPerMinute = 200): number {
  if (words <= 0) return 0;
  return Math.ceil((words / wordsPerMinute) * 60);
}

export function computeTextStats(text: string): TextStats {
  const words = countWords(text);
  return {
    characters: countCharacters(text),
    charactersNoSpaces: countCharactersNoSpaces(text),
    words,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    lines: countLines(text),
    readingTimeSeconds: estimateReadingTime(words),
  };
}

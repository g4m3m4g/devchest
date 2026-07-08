export const LOREM_WORDS: string[] = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum',
];

export const CLASSIC_OPENING_SENTENCE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
export const CLASSIC_OPENING_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];

const MIN_SENTENCE_WORDS = 6;
const MAX_SENTENCE_WORDS = 14;
const MIN_PARAGRAPH_SENTENCES = 3;
const MAX_PARAGRAPH_SENTENCES = 6;

export type LoremUnit = 'words' | 'sentences' | 'paragraphs';

export interface LoremOptions {
  unit: LoremUnit;
  count: number;
  startWithLorem?: boolean;
}

function randomInt(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function pickWord(random: () => number): string {
  return LOREM_WORDS[Math.floor(random() * LOREM_WORDS.length)];
}

export function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generateWords(count: number, random: () => number = Math.random, startWithLorem = false): string[] {
  if (count <= 0) return [];

  const words: string[] = startWithLorem ? CLASSIC_OPENING_WORDS.slice(0, count) : [];
  while (words.length < count) {
    words.push(pickWord(random));
  }
  return words;
}

export function generateSentence(random: () => number = Math.random, wordCount?: number): string {
  const length = wordCount ?? randomInt(random, MIN_SENTENCE_WORDS, MAX_SENTENCE_WORDS);
  const sentence = generateWords(length, random).join(' ');
  return `${capitalize(sentence)}.`;
}

export function generateSentences(count: number, random: () => number = Math.random, startWithLorem = false): string[] {
  if (count <= 0) return [];

  const sentences: string[] = startWithLorem ? [CLASSIC_OPENING_SENTENCE] : [];
  while (sentences.length < count) {
    sentences.push(generateSentence(random));
  }
  return sentences.slice(0, count);
}

export function generateParagraph(
  random: () => number = Math.random,
  options: { sentenceCount?: number; startWithLorem?: boolean } = {}
): string {
  const length = options.sentenceCount ?? randomInt(random, MIN_PARAGRAPH_SENTENCES, MAX_PARAGRAPH_SENTENCES);
  return generateSentences(length, random, options.startWithLorem).join(' ');
}

export function generateParagraphs(count: number, random: () => number = Math.random, startWithLorem = false): string[] {
  if (count <= 0) return [];

  return Array.from({ length: count }, (_, i) =>
    generateParagraph(random, { startWithLorem: i === 0 && startWithLorem })
  );
}

export function generateLoremIpsum(options: LoremOptions, random: () => number = Math.random): string {
  const { unit, count, startWithLorem = false } = options;
  if (count <= 0) return '';

  switch (unit) {
    case 'words':
      return generateWords(count, random, startWithLorem).join(' ');
    case 'sentences':
      return generateSentences(count, random, startWithLorem).join(' ');
    case 'paragraphs':
      return generateParagraphs(count, random, startWithLorem).join('\n\n');
  }
}

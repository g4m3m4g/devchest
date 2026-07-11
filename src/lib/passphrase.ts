import { wordlist } from '@scure/bip39/wordlists/english.js';

export type Separator = 'space' | 'hyphen' | 'underscore' | 'period';

export interface PassphraseOptions {
  wordCount: number;
  separator: Separator;
  capitalize: boolean;
  includeNumber: boolean;
}

export const SEPARATOR_CHARS: Record<Separator, string> = {
  space: ' ',
  hyphen: '-',
  underscore: '_',
  period: '.',
};

export const WORDLIST_SIZE = wordlist.length;

function randomIndex(max: number): number {
  const buf = new Uint16Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

function randomWord(): string {
  return wordlist[randomIndex(WORDLIST_SIZE)];
}

export function generatePassphrase(options: PassphraseOptions): string {
  if (options.wordCount < 1) {
    throw new Error('Word count must be at least 1');
  }

  const words = Array.from({ length: options.wordCount }, () => {
    const word = randomWord();
    return options.capitalize ? word[0].toUpperCase() + word.slice(1) : word;
  });

  if (options.includeNumber) {
    words.push(String(randomIndex(10)));
  }

  return words.join(SEPARATOR_CHARS[options.separator]);
}

export function calculatePassphraseEntropyBits(wordCount: number, includeNumber: boolean): number {
  if (wordCount <= 0) return 0;
  const base = wordCount * Math.log2(WORDLIST_SIZE);
  return includeNumber ? base + Math.log2(10) : base;
}

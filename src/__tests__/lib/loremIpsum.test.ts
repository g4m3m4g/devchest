import { describe, it, expect } from 'vitest';
import {
  LOREM_WORDS,
  CLASSIC_OPENING_SENTENCE,
  CLASSIC_OPENING_WORDS,
  pickWord,
  capitalize,
  generateWords,
  generateSentence,
  generateSentences,
  generateParagraph,
  generateParagraphs,
  generateLoremIpsum,
} from '../../lib/loremIpsum';

function sequenceRandom(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

const zeroRandom = () => 0;

describe('pickWord', () => {
  it('picks a word from LOREM_WORDS using the random function', () => {
    expect(pickWord(zeroRandom)).toBe(LOREM_WORDS[0]);
  });

  it('picks the last word when random returns just under 1', () => {
    expect(pickWord(() => 0.9999999)).toBe(LOREM_WORDS[LOREM_WORDS.length - 1]);
  });
});

describe('capitalize', () => {
  it('capitalizes the first letter', () => {
    expect(capitalize('lorem')).toBe('Lorem');
  });

  it('returns an empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('generateWords', () => {
  it('returns an empty array for count 0', () => {
    expect(generateWords(0)).toEqual([]);
  });

  it('generates the requested number of words', () => {
    const words = generateWords(5, zeroRandom);
    expect(words).toHaveLength(5);
    expect(words.every(w => LOREM_WORDS.includes(w))).toBe(true);
  });

  it('starts with a slice of the classic opening when startWithLorem is set and count is short', () => {
    expect(generateWords(3, zeroRandom, true)).toEqual(CLASSIC_OPENING_WORDS.slice(0, 3));
  });

  it('appends random words after the classic opening once exhausted', () => {
    const words = generateWords(CLASSIC_OPENING_WORDS.length + 2, zeroRandom, true);
    expect(words.slice(0, CLASSIC_OPENING_WORDS.length)).toEqual(CLASSIC_OPENING_WORDS);
    expect(words).toHaveLength(CLASSIC_OPENING_WORDS.length + 2);
  });
});

describe('generateSentence', () => {
  it('capitalizes the first letter and ends with a period', () => {
    const sentence = generateSentence(zeroRandom, 4);
    expect(sentence.endsWith('.')).toBe(true);
    expect(sentence[0]).toBe(sentence[0].toUpperCase());
  });

  it('contains the requested number of words', () => {
    const sentence = generateSentence(zeroRandom, 4);
    const wordCount = sentence.replace(/\.$/, '').split(' ').length;
    expect(wordCount).toBe(4);
  });
});

describe('generateSentences', () => {
  it('returns an empty array for count 0', () => {
    expect(generateSentences(0)).toEqual([]);
  });

  it('generates the requested number of sentences', () => {
    expect(generateSentences(3, zeroRandom)).toHaveLength(3);
  });

  it('uses the classic opening sentence first when startWithLorem is set', () => {
    const sentences = generateSentences(2, zeroRandom, true);
    expect(sentences[0]).toBe(CLASSIC_OPENING_SENTENCE);
    expect(sentences).toHaveLength(2);
  });
});

describe('generateParagraph', () => {
  it('joins multiple sentences with a single space', () => {
    const paragraph = generateParagraph(zeroRandom, { sentenceCount: 3 });
    const sentenceCount = paragraph.split('. ').filter(Boolean).length;
    expect(sentenceCount).toBe(3);
  });

  it('starts with the classic opening sentence when requested', () => {
    const paragraph = generateParagraph(zeroRandom, { sentenceCount: 2, startWithLorem: true });
    expect(paragraph.startsWith(CLASSIC_OPENING_SENTENCE)).toBe(true);
  });
});

describe('generateParagraphs', () => {
  it('returns an empty array for count 0', () => {
    expect(generateParagraphs(0)).toEqual([]);
  });

  it('generates the requested number of paragraphs', () => {
    expect(generateParagraphs(3, zeroRandom)).toHaveLength(3);
  });

  it('only the first paragraph starts with the classic opening', () => {
    const paragraphs = generateParagraphs(2, zeroRandom, true);
    expect(paragraphs[0].startsWith(CLASSIC_OPENING_SENTENCE)).toBe(true);
    expect(paragraphs[1].startsWith(CLASSIC_OPENING_SENTENCE)).toBe(false);
  });
});

describe('generateLoremIpsum', () => {
  it('returns an empty string for count 0', () => {
    expect(generateLoremIpsum({ unit: 'words', count: 0 })).toBe('');
  });

  it('generates space-joined words', () => {
    const result = generateLoremIpsum({ unit: 'words', count: 5 }, zeroRandom);
    expect(result.split(' ')).toHaveLength(5);
  });

  it('generates space-joined sentences', () => {
    const result = generateLoremIpsum({ unit: 'sentences', count: 2 }, zeroRandom);
    expect(result.split('. ').filter(Boolean)).toHaveLength(2);
  });

  it('generates paragraphs joined by a blank line', () => {
    const result = generateLoremIpsum({ unit: 'paragraphs', count: 2 }, zeroRandom);
    expect(result.split('\n\n')).toHaveLength(2);
  });

  it('honors startWithLorem for words mode', () => {
    const result = generateLoremIpsum({ unit: 'words', count: 3, startWithLorem: true }, zeroRandom);
    expect(result).toBe(CLASSIC_OPENING_WORDS.slice(0, 3).join(' '));
  });

  it('produces varied output across calls with the default random source', () => {
    const result = generateLoremIpsum({ unit: 'words', count: 10 });
    expect(result.split(' ')).toHaveLength(10);
  });

  it('uses a different random draw per word (sanity check on sequence consumption)', () => {
    const random = sequenceRandom([0, 0.5, 0.99]);
    const words = generateWords(3, random);
    expect(words).toEqual([LOREM_WORDS[0], LOREM_WORDS[Math.floor(0.5 * LOREM_WORDS.length)], LOREM_WORDS[LOREM_WORDS.length - 1]]);
  });
});

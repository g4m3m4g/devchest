import { describe, it, expect } from 'vitest';
import {
  countCharacters,
  countCharactersNoSpaces,
  countWords,
  countSentences,
  countParagraphs,
  countLines,
  estimateReadingTime,
  computeTextStats,
} from '../../lib/textStats';

describe('countCharacters', () => {
  it('counts all characters including spaces', () => {
    expect(countCharacters('hello world')).toBe(11);
  });

  it('returns 0 for an empty string', () => {
    expect(countCharacters('')).toBe(0);
  });
});

describe('countCharactersNoSpaces', () => {
  it('excludes spaces, tabs, and newlines', () => {
    expect(countCharactersNoSpaces('hello world')).toBe(10);
    expect(countCharactersNoSpaces('a\tb\nc')).toBe(3);
  });

  it('returns 0 for an empty string', () => {
    expect(countCharactersNoSpaces('')).toBe(0);
  });
});

describe('countWords', () => {
  it('counts space-separated words', () => {
    expect(countWords('hello world')).toBe(2);
  });

  it('collapses multiple spaces between words', () => {
    expect(countWords('hello    world')).toBe(2);
  });

  it('counts words across newlines', () => {
    expect(countWords('hello\nworld\nfoo')).toBe(3);
  });

  it('ignores leading and trailing whitespace', () => {
    expect(countWords('  hello world  ')).toBe(2);
  });

  it('returns 0 for an empty string', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only input', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });
});

describe('countSentences', () => {
  it('counts sentences ending in periods', () => {
    expect(countSentences('One. Two. Three.')).toBe(3);
  });

  it('counts sentences ending in ! or ?', () => {
    expect(countSentences('Really! Are you sure? Yes.')).toBe(3);
  });

  it('treats punctuation-less text as a single sentence', () => {
    expect(countSentences('hello world')).toBe(1);
  });

  it('returns 0 for an empty string', () => {
    expect(countSentences('')).toBe(0);
  });

  it('collapses repeated punctuation', () => {
    expect(countSentences('Wait... what?!')).toBe(2);
  });
});

describe('countParagraphs', () => {
  it('counts a single paragraph with no blank lines', () => {
    expect(countParagraphs('line one\nline two')).toBe(1);
  });

  it('splits on blank lines', () => {
    expect(countParagraphs('Para one.\n\nPara two.')).toBe(2);
  });

  it('handles multiple blank lines between paragraphs', () => {
    expect(countParagraphs('Para one.\n\n\n\nPara two.')).toBe(2);
  });

  it('returns 0 for an empty string', () => {
    expect(countParagraphs('')).toBe(0);
  });

  it('returns 0 for whitespace-only input', () => {
    expect(countParagraphs('   \n\n  ')).toBe(0);
  });
});

describe('countLines', () => {
  it('counts newline-separated lines', () => {
    expect(countLines('a\nb\nc')).toBe(3);
  });

  it('counts a single line with no newline as 1', () => {
    expect(countLines('hello')).toBe(1);
  });

  it('returns 0 for an empty string', () => {
    expect(countLines('')).toBe(0);
  });
});

describe('estimateReadingTime', () => {
  it('returns 0 for 0 words', () => {
    expect(estimateReadingTime(0)).toBe(0);
  });

  it('estimates seconds at 200 words per minute', () => {
    expect(estimateReadingTime(200)).toBe(60);
  });

  it('rounds up to the nearest second', () => {
    expect(estimateReadingTime(1)).toBe(1);
  });
});

describe('computeTextStats', () => {
  it('computes every stat for a multi-paragraph sample', () => {
    const text = 'Hello world. This is great!\n\nSecond paragraph here.';
    const stats = computeTextStats(text);
    expect(stats).toEqual({
      characters: countCharacters(text),
      charactersNoSpaces: countCharactersNoSpaces(text),
      words: countWords(text),
      sentences: countSentences(text),
      paragraphs: countParagraphs(text),
      lines: countLines(text),
      readingTimeSeconds: estimateReadingTime(countWords(text)),
    });
  });

  it('returns all zeros for an empty string', () => {
    expect(computeTextStats('')).toEqual({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeSeconds: 0,
    });
  });
});

import { describe, it, expect } from 'vitest';
import { countWords, countSentences, countSyllablesInWord, analyzeReadability } from '../../lib/readability';

describe('countWords', () => {
  it('counts words separated by whitespace', () => {
    expect(countWords('The quick brown fox')).toBe(4);
  });

  it('returns 0 for empty text', () => {
    expect(countWords('')).toBe(0);
  });

  it('returns 0 for whitespace-only text', () => {
    expect(countWords('   ')).toBe(0);
  });

  it('collapses multiple spaces between words', () => {
    expect(countWords('one   two')).toBe(2);
  });
});

describe('countSentences', () => {
  it('counts sentences ending in periods', () => {
    expect(countSentences('One. Two. Three.')).toBe(3);
  });

  it('counts sentences ending in ! or ?', () => {
    expect(countSentences('Wow! Really? Yes.')).toBe(3);
  });

  it('returns 0 for empty text', () => {
    expect(countSentences('')).toBe(0);
  });

  it('treats text with no terminal punctuation as a single sentence', () => {
    expect(countSentences('no punctuation here')).toBe(1);
  });
});

describe('countSyllablesInWord', () => {
  it('counts a single vowel group as one syllable', () => {
    expect(countSyllablesInWord('cat')).toBe(1);
    expect(countSyllablesInWord('sat')).toBe(1);
  });

  it('counts multiple vowel groups as multiple syllables', () => {
    expect(countSyllablesInWord('banana')).toBe(3);
  });

  it('returns at least 1 for any non-empty word', () => {
    expect(countSyllablesInWord('rhythm')).toBeGreaterThanOrEqual(1);
  });

  it('returns 0 for an empty word', () => {
    expect(countSyllablesInWord('')).toBe(0);
  });
});

describe('analyzeReadability', () => {
  it('computes word, sentence, and syllable counts', () => {
    const result = analyzeReadability('Cat sat.');
    expect(result.words).toBe(2);
    expect(result.sentences).toBe(1);
    expect(result.syllables).toBe(2);
  });

  it('computes the Flesch Reading Ease score', () => {
    const result = analyzeReadability('Cat sat.');
    expect(result.readingEase).toBeCloseTo(120.21, 1);
  });

  it('computes the Flesch-Kincaid Grade Level', () => {
    const result = analyzeReadability('Cat sat.');
    expect(result.gradeLevel).toBeCloseTo(-3.01, 1);
  });

  it('returns zeroed scores for empty text', () => {
    const result = analyzeReadability('');
    expect(result).toEqual({ words: 0, sentences: 0, syllables: 0, readingEase: 0, gradeLevel: 0 });
  });
});

import { describe, it, expect } from 'vitest';
import { analyzeSentences } from '../../lib/sentenceCounter';

describe('analyzeSentences', () => {
  it('counts sentences and words', () => {
    const result = analyzeSentences('One two. Three four five.');
    expect(result.sentences).toBe(2);
    expect(result.words).toBe(5);
  });

  it('computes average words per sentence', () => {
    const result = analyzeSentences('One two. Three four five.');
    expect(result.averageWordsPerSentence).toBeCloseTo(2.5, 1);
  });

  it('counts characters excluding surrounding whitespace', () => {
    const result = analyzeSentences('  abc  ');
    expect(result.characters).toBe(3);
  });

  it('returns all zeros for empty text', () => {
    expect(analyzeSentences('')).toEqual({
      sentences: 0,
      words: 0,
      characters: 0,
      averageWordsPerSentence: 0,
    });
  });

  it('treats text with no terminal punctuation as one sentence', () => {
    const result = analyzeSentences('no punctuation here');
    expect(result.sentences).toBe(1);
    expect(result.words).toBe(3);
    expect(result.averageWordsPerSentence).toBe(3);
  });
});

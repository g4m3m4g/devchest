import { describe, it, expect } from 'vitest';
import {
  generatePassphrase,
  calculatePassphraseEntropyBits,
  WORDLIST_SIZE,
  SEPARATOR_CHARS,
} from '../../lib/passphrase';
import type { PassphraseOptions } from '../../lib/passphrase';
import { wordlist } from '@scure/bip39/wordlists/english.js';

const baseOptions: PassphraseOptions = {
  wordCount: 6,
  separator: 'hyphen',
  capitalize: false,
  includeNumber: false,
};

describe('WORDLIST_SIZE', () => {
  it('matches the official BIP39 English wordlist length', () => {
    expect(WORDLIST_SIZE).toBe(2048);
    expect(wordlist.length).toBe(2048);
  });
});

describe('generatePassphrase', () => {
  it('produces the requested number of words', () => {
    const passphrase = generatePassphrase(baseOptions);
    expect(passphrase.split(SEPARATOR_CHARS.hyphen)).toHaveLength(6);
  });

  it('joins words with the requested separator', () => {
    const passphrase = generatePassphrase({ ...baseOptions, separator: 'underscore' });
    expect(passphrase).toContain('_');
    expect(passphrase).not.toContain('-');
  });

  it('uses only words from the BIP39 wordlist', () => {
    const passphrase = generatePassphrase({ ...baseOptions, wordCount: 12 });
    for (const word of passphrase.split('-')) {
      expect(wordlist).toContain(word.toLowerCase());
    }
  });

  it('capitalizes each word when capitalize is true', () => {
    const passphrase = generatePassphrase({ ...baseOptions, capitalize: true });
    for (const word of passphrase.split('-')) {
      expect(word[0]).toBe(word[0].toUpperCase());
    }
  });

  it('does not capitalize words when capitalize is false', () => {
    const passphrase = generatePassphrase({ ...baseOptions, capitalize: false });
    for (const word of passphrase.split('-')) {
      expect(word).toBe(word.toLowerCase());
    }
  });

  it('appends a trailing number segment when includeNumber is true', () => {
    const passphrase = generatePassphrase({ ...baseOptions, includeNumber: true });
    const segments = passphrase.split('-');
    expect(segments).toHaveLength(7);
    expect(segments[segments.length - 1]).toMatch(/^\d$/);
  });

  it('throws for a word count below 1', () => {
    expect(() => generatePassphrase({ ...baseOptions, wordCount: 0 })).toThrow();
  });

  it('produces different output across calls', () => {
    const a = generatePassphrase(baseOptions);
    const b = generatePassphrase(baseOptions);
    expect(a).not.toBe(b);
  });
});

describe('calculatePassphraseEntropyBits', () => {
  it('computes wordCount * log2(2048) without a trailing number', () => {
    expect(calculatePassphraseEntropyBits(6, false)).toBeCloseTo(6 * Math.log2(2048));
  });

  it('adds log2(10) bits when a trailing number is included', () => {
    expect(calculatePassphraseEntropyBits(6, true)).toBeCloseTo(6 * Math.log2(2048) + Math.log2(10));
  });

  it('returns 0 for zero words', () => {
    expect(calculatePassphraseEntropyBits(0, false)).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { computeHmac, HMAC_ALGORITHMS } from '../../lib/hmac';

describe('computeHmac', () => {
  const key = 'key';
  const message = 'The quick brown fox jumps over the lazy dog';

  it('computes the known HMAC-SHA256 test vector (hex)', () => {
    expect(computeHmac(message, key, 'SHA256', 'hex')).toBe(
      'f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'
    );
  });

  it('computes the known HMAC-SHA512 test vector (hex)', () => {
    expect(computeHmac(message, key, 'SHA512', 'hex')).toBe(
      'b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a'
    );
  });

  it('computes a base64-encoded HMAC-SHA256 output', () => {
    expect(computeHmac(message, key, 'SHA256', 'base64')).toBe('97yD9DBThCSxMpjmqm+xQ+9NWaFJRhdZl0edvC0aPNg=');
  });

  it('defaults to hex encoding', () => {
    expect(computeHmac(message, key, 'SHA256')).toBe(computeHmac(message, key, 'SHA256', 'hex'));
  });

  it('produces different output for different keys', () => {
    expect(computeHmac(message, 'key1', 'SHA256')).not.toBe(computeHmac(message, 'key2', 'SHA256'));
  });

  it('produces different output for different messages', () => {
    expect(computeHmac('a', key, 'SHA256')).not.toBe(computeHmac('b', key, 'SHA256'));
  });

  it('throws when the key is empty', () => {
    expect(() => computeHmac(message, '', 'SHA256')).toThrow();
  });
});

describe('HMAC_ALGORITHMS', () => {
  it('lists SHA256 and SHA512', () => {
    expect(HMAC_ALGORITHMS.map(a => a.id)).toEqual(['SHA256', 'SHA512']);
  });

  it('reports correct bit lengths', () => {
    expect(HMAC_ALGORITHMS.find(a => a.id === 'SHA256')?.bits).toBe(256);
    expect(HMAC_ALGORITHMS.find(a => a.id === 'SHA512')?.bits).toBe(512);
  });
});

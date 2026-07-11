import CryptoJS from 'crypto-js';

export type TotpAlgorithm = 'SHA1' | 'SHA256' | 'SHA512';

export interface TotpOptions {
  digits: number;
  period: number;
  algorithm: TotpAlgorithm;
  timestamp: number;
}

const DEFAULT_OPTIONS: TotpOptions = {
  digits: 6,
  period: 30,
  algorithm: 'SHA1',
  timestamp: Date.now(),
};

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
  if (!cleaned) {
    throw new Error('Secret is required');
  }
  for (const char of cleaned) {
    if (!BASE32_ALPHABET.includes(char)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
  }

  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const char of cleaned) {
    value = (value << 5) | BASE32_ALPHABET.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

function wordArrayToBytes(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const { words, sigBytes } = wordArray;
  const bytes = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    bytes[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return bytes;
}

function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] = (words[i >>> 2] ?? 0) | (bytes[i] << (24 - (i % 4) * 8));
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

function hmac(algorithm: TotpAlgorithm, keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
  const key = bytesToWordArray(keyBytes);
  const message = bytesToWordArray(messageBytes);
  const digest = algorithm === 'SHA1'
    ? CryptoJS.HmacSHA1(message, key)
    : algorithm === 'SHA256'
      ? CryptoJS.HmacSHA256(message, key)
      : CryptoJS.HmacSHA512(message, key);
  return wordArrayToBytes(digest);
}

function counterBytes(counter: number): Uint8Array {
  const bytes = new Uint8Array(8);
  let value = counter;
  for (let i = 7; i >= 0; i--) {
    bytes[i] = value % 256;
    value = Math.floor(value / 256);
  }
  return bytes;
}

export function generateTotp(secret: string, options: Partial<TotpOptions> = {}): string {
  if (!secret.trim()) {
    throw new Error('Secret is required');
  }

  const { digits, period, algorithm, timestamp } = { ...DEFAULT_OPTIONS, ...options };
  const counter = Math.floor(timestamp / 1000 / period);
  const keyBytes = base32Decode(secret);
  const digest = hmac(algorithm, keyBytes, counterBytes(counter));

  const offset = digest[digest.length - 1] & 0xf;
  const binCode =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binCode % 10 ** digits).padStart(digits, '0');
}

export function getRemainingSeconds(period: number, timestamp: number = Date.now()): number {
  const elapsed = Math.floor(timestamp / 1000) % period;
  return period - elapsed;
}

export function generateSecret(byteLength: number = 20): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base32Encode(bytes);
}

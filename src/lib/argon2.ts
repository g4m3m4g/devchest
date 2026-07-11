import { argon2id, argon2i, argon2d } from '@noble/hashes/argon2.js';

export type Argon2Variant = 'argon2id' | 'argon2i' | 'argon2d';

export interface Argon2Options {
  variant: Argon2Variant;
  timeCost: number;
  memoryCost: number;
  parallelism: number;
  hashLength: number;
}

export interface ParsedArgon2Hash {
  variant: Argon2Variant;
  timeCost: number;
  memoryCost: number;
  parallelism: number;
  salt: Uint8Array;
  hash: Uint8Array;
}

const DEFAULT_OPTIONS: Argon2Options = {
  variant: 'argon2id',
  timeCost: 2,
  memoryCost: 4096,
  parallelism: 1,
  hashLength: 32,
};

const VARIANT_FN = { argon2id, argon2i, argon2d };

const HASH_REGEX = /^\$(argon2id|argon2i|argon2d)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

function toBase64NoPad(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=+$/, '');
}

function fromBase64NoPad(str: string): Uint8Array {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function hashPassword(password: string, options: Partial<Argon2Options> = {}): string {
  if (!password) {
    throw new Error('Password is required');
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derive = VARIANT_FN[opts.variant];
  const hash = derive(password, salt, {
    t: opts.timeCost,
    m: opts.memoryCost,
    p: opts.parallelism,
    dkLen: opts.hashLength,
  });

  return `$${opts.variant}$v=19$m=${opts.memoryCost},t=${opts.timeCost},p=${opts.parallelism}$${toBase64NoPad(salt)}$${toBase64NoPad(hash)}`;
}

export function parseArgon2Hash(encoded: string): ParsedArgon2Hash | null {
  const match = HASH_REGEX.exec(encoded);
  if (!match) return null;

  const [, variant, , memoryCost, timeCost, parallelism, salt, hash] = match;
  return {
    variant: variant as Argon2Variant,
    memoryCost: Number(memoryCost),
    timeCost: Number(timeCost),
    parallelism: Number(parallelism),
    salt: fromBase64NoPad(salt),
    hash: fromBase64NoPad(hash),
  };
}

export function isValidArgon2Hash(encoded: string): boolean {
  return parseArgon2Hash(encoded) !== null;
}

export function verifyPassword(password: string, encoded: string): boolean {
  const parsed = parseArgon2Hash(encoded);
  if (!parsed) return false;

  const derive = VARIANT_FN[parsed.variant];
  const candidate = derive(password, parsed.salt, {
    t: parsed.timeCost,
    m: parsed.memoryCost,
    p: parsed.parallelism,
    dkLen: parsed.hash.length,
  });

  return timingSafeEqual(candidate, parsed.hash);
}

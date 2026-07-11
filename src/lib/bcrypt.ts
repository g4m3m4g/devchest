import { genSaltSync, hashSync, compareSync, getRounds } from 'bcryptjs';

const BCRYPT_HASH_REGEX = /^\$2[aby]?\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function hashPassword(password: string, rounds: number = 10): string {
  if (!password) {
    throw new Error('Password is required');
  }
  return hashSync(password, genSaltSync(rounds));
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!password || !hash) return false;
  try {
    return compareSync(password, hash);
  } catch {
    return false;
  }
}

export function getHashRounds(hash: string): number {
  return getRounds(hash);
}

export function isValidBcryptHash(hash: string): boolean {
  return BCRYPT_HASH_REGEX.test(hash);
}

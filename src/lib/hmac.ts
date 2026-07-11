import CryptoJS from 'crypto-js';

export type HmacAlgorithm = 'SHA256' | 'SHA512';
export type OutputEncoding = 'hex' | 'base64';

export const HMAC_ALGORITHMS: { id: HmacAlgorithm; label: string; bits: number }[] = [
  { id: 'SHA256', label: 'HMAC-SHA256', bits: 256 },
  { id: 'SHA512', label: 'HMAC-SHA512', bits: 512 },
];

export function computeHmac(
  message: string,
  key: string,
  algorithm: HmacAlgorithm,
  encoding: OutputEncoding = 'hex'
): string {
  if (!key) {
    throw new Error('Key is required');
  }

  const digest = algorithm === 'SHA256'
    ? CryptoJS.HmacSHA256(message, key)
    : CryptoJS.HmacSHA512(message, key);

  return encoding === 'hex' ? digest.toString(CryptoJS.enc.Hex) : digest.toString(CryptoJS.enc.Base64);
}

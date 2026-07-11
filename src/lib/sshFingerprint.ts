import CryptoJS from 'crypto-js';

export interface ParsedSshKey {
  keyType: string;
  blob: Uint8Array;
  comment: string;
}

export interface SshFingerprint {
  keyType: string;
  bits: number | null;
  comment: string;
  md5: string;
  sha256: string;
}

function readUint32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
}

function readLengthPrefixed(bytes: Uint8Array, offset: number): { value: Uint8Array; next: number } {
  if (offset + 4 > bytes.length) throw new Error('Truncated SSH key data');
  const length = readUint32(bytes, offset);
  const start = offset + 4;
  const end = start + length;
  if (end > bytes.length) throw new Error('Truncated SSH key data');
  return { value: bytes.subarray(start, end), next: end };
}

function base64ToBytes(base64: string): Uint8Array {
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('Invalid Base64 key data');
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function bytesToWordArray(bytes: Uint8Array): CryptoJS.lib.WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] = (words[i >>> 2] ?? 0) | (bytes[i] << (24 - (i % 4) * 8));
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

export function parseOpenSshPublicKey(input: string): ParsedSshKey {
  const parts = input.trim().split(/\s+/);
  if (parts.length < 2) {
    throw new Error('Expected "<key-type> <base64-blob> [comment]"');
  }

  const [keyType, base64, ...commentParts] = parts;
  const blob = base64ToBytes(base64);
  if (blob.length === 0) {
    throw new Error('Empty key data');
  }

  const { value: typeField } = readLengthPrefixed(blob, 0);
  const encodedType = new TextDecoder().decode(typeField);
  if (encodedType !== keyType) {
    throw new Error(`Declared key type "${keyType}" does not match encoded type "${encodedType}"`);
  }

  return { keyType, blob, comment: commentParts.join(' ') };
}

function bitLength(bytes: Uint8Array): number {
  const trimmed = bytes.length > 1 && bytes[0] === 0x00 ? bytes.subarray(1) : bytes;
  let bits = trimmed.length * 8;
  let leading = trimmed[0];
  while (leading !== 0 && (leading & 0x80) === 0) {
    bits--;
    leading <<= 1;
  }
  return bits;
}

function getKeyBits(keyType: string, blob: Uint8Array): number | null {
  const { next: afterType } = readLengthPrefixed(blob, 0);

  if (keyType === 'ssh-rsa') {
    const { next: afterE } = readLengthPrefixed(blob, afterType);
    const { value: n } = readLengthPrefixed(blob, afterE);
    return bitLength(n);
  }

  if (keyType === 'ssh-ed25519') return 256;
  if (keyType === 'ecdsa-sha2-nistp256') return 256;
  if (keyType === 'ecdsa-sha2-nistp384') return 384;
  if (keyType === 'ecdsa-sha2-nistp521') return 521;

  if (keyType === 'ssh-dss') {
    const { value: p } = readLengthPrefixed(blob, afterType);
    return bitLength(p);
  }

  return null;
}

function computeMd5Fingerprint(blob: Uint8Array): string {
  const hex = CryptoJS.MD5(bytesToWordArray(blob)).toString(CryptoJS.enc.Hex);
  return hex.match(/.{2}/g)?.join(':') ?? hex;
}

async function computeSha256Fingerprint(blob: Uint8Array): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', blob.slice()));
  let binary = '';
  for (const byte of digest) binary += String.fromCharCode(byte);
  return `SHA256:${btoa(binary).replace(/=+$/, '')}`;
}

export async function getSshFingerprint(input: string): Promise<SshFingerprint> {
  const { keyType, blob, comment } = parseOpenSshPublicKey(input);
  const [md5, sha256] = await Promise.all([
    Promise.resolve(computeMd5Fingerprint(blob)),
    computeSha256Fingerprint(blob),
  ]);

  return { keyType, bits: getKeyBits(keyType, blob), comment, md5, sha256 };
}

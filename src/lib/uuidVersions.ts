import CryptoJS from 'crypto-js';

type WordArray = CryptoJS.lib.WordArray;

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export const NAMESPACE_PRESETS: { value: string; label: string }[] = [
  { value: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', label: 'DNS' },
  { value: '6ba7b811-9dad-11d1-80b4-00c04fd430c8', label: 'URL' },
  { value: '6ba7b812-9dad-11d1-80b4-00c04fd430c8', label: 'OID' },
  { value: '6ba7b813-9dad-11d1-80b4-00c04fd430c8', label: 'X.500 DN' },
];

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.slice(i, i + 2), 16));
  }
  return bytes;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToUuidString(bytes: number[]): string {
  const hex = bytesToHex(bytes);
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function bytesToWordArray(bytes: number[]): WordArray {
  const words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, bytes.length);
}

function wordArrayToBytes(wordArray: WordArray): number[] {
  const { words, sigBytes } = wordArray;
  const bytes: number[] = [];
  for (let i = 0; i < sigBytes; i++) {
    bytes.push((words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff);
  }
  return bytes;
}

function uuidFromNameHash(
  name: string,
  namespace: string,
  hashFn: (wordArray: WordArray) => WordArray,
  version: number
): string {
  const trimmedNamespace = namespace.trim();
  if (!isValidUuid(trimmedNamespace)) {
    throw new Error('Invalid namespace UUID');
  }
  const namespaceBytes = hexToBytes(trimmedNamespace.replace(/-/g, ''));
  const nameBytes = Array.from(new TextEncoder().encode(name));
  const combined = bytesToWordArray([...namespaceBytes, ...nameBytes]);
  const hashBytes = wordArrayToBytes(hashFn(combined)).slice(0, 16);
  hashBytes[6] = (hashBytes[6] & 0x0f) | (version << 4);
  hashBytes[8] = (hashBytes[8] & 0x3f) | 0x80;
  return bytesToUuidString(hashBytes);
}

export function generateUuidV3(name: string, namespace: string): string {
  return uuidFromNameHash(name, namespace, CryptoJS.MD5, 3);
}

export function generateUuidV5(name: string, namespace: string): string {
  return uuidFromNameHash(name, namespace, CryptoJS.SHA1, 5);
}

const GREGORIAN_OFFSET = 122192928000000000n;
let lastV1Time = 0;
let v1Counter = 0;

export function generateUuidV1(): string {
  const now = Date.now();
  if (now === lastV1Time) {
    v1Counter++;
  } else {
    lastV1Time = now;
    v1Counter = 0;
  }

  const ts = BigInt(now) * 10000n + GREGORIAN_OFFSET + BigInt(v1Counter);
  const timeLow = ts & 0xffffffffn;
  const timeMid = (ts >> 32n) & 0xffffn;
  const timeHiAndVersion = ((ts >> 48n) & 0x0fffn) | 0x1000n;

  const clockSeqBytes = crypto.getRandomValues(new Uint8Array(2));
  const clockSeq = (((clockSeqBytes[0] << 8) | clockSeqBytes[1]) & 0x3fff) | 0x8000;

  const nodeBytes = crypto.getRandomValues(new Uint8Array(6));
  nodeBytes[0] |= 0x01;

  return [
    timeLow.toString(16).padStart(8, '0'),
    timeMid.toString(16).padStart(4, '0'),
    timeHiAndVersion.toString(16).padStart(4, '0'),
    clockSeq.toString(16).padStart(4, '0'),
    bytesToHex(Array.from(nodeBytes)),
  ].join('-');
}

export function generateUuidV7(): string {
  const timeHex = BigInt(Date.now()).toString(16).padStart(12, '0');
  const randBytes = crypto.getRandomValues(new Uint8Array(10));

  const randA = (((randBytes[0] << 8) | randBytes[1]) & 0x0fff) | 0x7000;

  const randB = Array.from(randBytes.slice(2));
  randB[0] = (randB[0] & 0x3f) | 0x80;

  return [
    timeHex.slice(0, 8),
    timeHex.slice(8, 12),
    randA.toString(16).padStart(4, '0'),
    bytesToHex(randB.slice(0, 2)),
    bytesToHex(randB.slice(2)),
  ].join('-');
}

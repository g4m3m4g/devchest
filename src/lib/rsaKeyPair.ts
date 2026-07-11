export type RsaAlgorithm = 'RSA-OAEP' | 'RSASSA-PKCS1-v1_5';
export type RsaHash = 'SHA-256' | 'SHA-384' | 'SHA-512';
export type RsaModulusLength = 2048 | 3072 | 4096;

export interface RsaKeyPairOptions {
  modulusLength: RsaModulusLength;
  algorithm: RsaAlgorithm;
  hash: RsaHash;
}

export interface RsaKeyPairPem {
  publicKey: string;
  privateKey: string;
}

const DEFAULT_OPTIONS: RsaKeyPairOptions = {
  modulusLength: 2048,
  algorithm: 'RSA-OAEP',
  hash: 'SHA-256',
};

const KEY_USAGES: Record<RsaAlgorithm, KeyUsage[]> = {
  'RSA-OAEP': ['encrypt', 'decrypt'],
  'RSASSA-PKCS1-v1_5': ['sign', 'verify'],
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function wrapPem(base64: string, label: string): string {
  const lines = base64.match(/.{1,64}/g) ?? [base64];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export async function generateRsaKeyPair(options: Partial<RsaKeyPairOptions> = {}): Promise<RsaKeyPairPem> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const keyPair = await crypto.subtle.generateKey(
    {
      name: opts.algorithm,
      modulusLength: opts.modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: opts.hash,
    },
    true,
    KEY_USAGES[opts.algorithm]
  ) as CryptoKeyPair;

  const [spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey('spki', keyPair.publicKey),
    crypto.subtle.exportKey('pkcs8', keyPair.privateKey),
  ]);

  return {
    publicKey: wrapPem(arrayBufferToBase64(spki), 'PUBLIC KEY'),
    privateKey: wrapPem(arrayBufferToBase64(pkcs8), 'PRIVATE KEY'),
  };
}

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

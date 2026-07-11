export type CsrfEncoding = 'hex' | 'base64' | 'base64url' | 'alphanumeric';

export interface CsrfTokenOptions {
  byteLength: number;
  encoding: CsrfEncoding;
}

const MIN_BYTE_LENGTH = 16;
const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);
  return urlSafe ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : base64;
}

function randomAlphanumeric(length: number): string {
  const maxValid = Math.floor(256 / ALPHANUMERIC.length) * ALPHANUMERIC.length;
  const result = new Array<string>(length);
  let filled = 0;
  while (filled < length) {
    const bytes = randomBytes(length - filled);
    for (const byte of bytes) {
      if (byte < maxValid) {
        result[filled] = ALPHANUMERIC[byte % ALPHANUMERIC.length];
        filled++;
      }
    }
  }
  return result.join('');
}

export function generateCsrfToken(options: Partial<CsrfTokenOptions> = {}): string {
  const byteLength = options.byteLength ?? 32;
  const encoding = options.encoding ?? 'base64url';

  if (byteLength < MIN_BYTE_LENGTH) {
    throw new Error(`Token must be at least ${MIN_BYTE_LENGTH} bytes (${MIN_BYTE_LENGTH * 8} bits) for adequate CSRF protection`);
  }

  switch (encoding) {
    case 'hex':
      return bytesToHex(randomBytes(byteLength));
    case 'base64':
      return bytesToBase64(randomBytes(byteLength), false);
    case 'base64url':
      return bytesToBase64(randomBytes(byteLength), true);
    case 'alphanumeric':
      return randomAlphanumeric(byteLength);
  }
}

export function calculateEntropyBits(byteLength: number): number {
  return byteLength * 8;
}

export function buildHiddenInputSnippet(token: string, fieldName: string = 'csrf_token'): string {
  return `<input type="hidden" name="${fieldName}" value="${token}">`;
}

export function buildHeaderSnippet(token: string, headerName: string = 'X-CSRF-Token'): string {
  return `${headerName}: ${token}`;
}

export type HexDelimiter = 'none' | 'space' | 'colon';

export interface EncodeHexOptions {
  delimiter?: HexDelimiter;
  uppercase?: boolean;
}

const DELIMITER_CHAR: Record<HexDelimiter, string> = {
  none: '',
  space: ' ',
  colon: ':',
};

export function encodeHex(text: string, options: EncodeHexOptions = {}): string {
  const { delimiter = 'none', uppercase = false } = options;
  const bytes = new TextEncoder().encode(text);
  const separator = DELIMITER_CHAR[delimiter];
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join(separator);
  return uppercase ? hex.toUpperCase() : hex;
}

export function decodeHex(hex: string): string {
  const cleaned = hex.replace(/[\s:]/g, '');
  if (cleaned.length === 0) return '';
  if (cleaned.length % 2 !== 0) {
    throw new Error('Hex string must have an even number of digits');
  }
  if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
    throw new Error('Hex string contains non-hexadecimal characters');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return new TextDecoder().decode(bytes);
}

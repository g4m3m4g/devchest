export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

export const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

const AMBIGUOUS = /[il1Lo0O]/g;

export function buildCharset(options: PasswordOptions): string {
  let charset = '';
  if (options.uppercase) charset += CHARSETS.uppercase;
  if (options.lowercase) charset += CHARSETS.lowercase;
  if (options.digits) charset += CHARSETS.digits;
  if (options.symbols) charset += CHARSETS.symbols;
  if (options.excludeAmbiguous) charset = charset.replace(AMBIGUOUS, '');
  return charset;
}

export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  if (!charset) {
    throw new Error('At least one character set must be enabled');
  }

  const result = new Array<string>(options.length);
  const maxValid = Math.floor(256 / charset.length) * charset.length;
  let filled = 0;
  while (filled < options.length) {
    const bytes = crypto.getRandomValues(new Uint8Array(options.length - filled));
    for (const byte of bytes) {
      if (byte < maxValid) {
        result[filled] = charset[byte % charset.length];
        filled++;
      }
    }
  }
  return result.join('');
}

export function calculateEntropyBits(length: number, charsetSize: number): number {
  return length > 0 && charsetSize > 0 ? length * Math.log2(charsetSize) : 0;
}

export type PasswordStrength = 'weak' | 'fair' | 'strong' | 'very-strong';

export function classifyStrength(entropyBits: number): PasswordStrength {
  if (entropyBits < 40) return 'weak';
  if (entropyBits < 60) return 'fair';
  if (entropyBits < 80) return 'strong';
  return 'very-strong';
}

export const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
export const DEFAULT_SIZE = 21;

export function generateNanoId(size: number = DEFAULT_SIZE, alphabet: string = DEFAULT_ALPHABET): string {
  if (size < 1) {
    throw new Error('Size must be at least 1');
  }
  if (alphabet.length < 2) {
    throw new Error('Alphabet must contain at least 2 characters');
  }

  const maxValid = Math.floor(256 / alphabet.length) * alphabet.length;
  const result = new Array<string>(size);
  let filled = 0;
  while (filled < size) {
    const bytes = crypto.getRandomValues(new Uint8Array(size - filled));
    for (const byte of bytes) {
      if (byte < maxValid) {
        result[filled] = alphabet[byte % alphabet.length];
        filled++;
      }
    }
  }
  return result.join('');
}

export function calculateNanoIdEntropyBits(size: number, alphabetLength: number): number {
  return size > 0 && alphabetLength > 0 ? size * Math.log2(alphabetLength) : 0;
}

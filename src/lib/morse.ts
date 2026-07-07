const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
  H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
  O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
  V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
  0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
  5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

const REVERSE_MORSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE_MAP).map(([char, code]) => [code, char])
);

export function encodeMorse(text: string): string {
  return text
    .toUpperCase()
    .split(/(\s+)/)
    .map(chunk => {
      if (/^\s+$/.test(chunk)) return '/';
      return chunk
        .split('')
        .map(char => {
          const code = MORSE_MAP[char];
          if (code === undefined) {
            throw new Error(`Cannot encode character: "${char}"`);
          }
          return code;
        })
        .join(' ');
    })
    .join(' ')
    .replace(/ ?\/ ?/g, ' / ')
    .trim();
}

export function decodeMorse(morse: string): string {
  const trimmed = morse.trim();
  if (trimmed.length === 0) return '';
  return trimmed
    .split(/\s*\/\s*/)
    .map(word =>
      word
        .split(/\s+/)
        .filter(Boolean)
        .map(code => {
          const char = REVERSE_MORSE_MAP[code];
          if (char === undefined) {
            throw new Error(`Invalid Morse code sequence: "${code}"`);
          }
          return char;
        })
        .join('')
    )
    .join(' ');
}

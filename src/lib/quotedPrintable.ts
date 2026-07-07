export interface EncodeQuotedPrintableOptions {
  lineLength?: number;
}

const SAFE_MIN = 33;
const SAFE_MAX = 126;

function isSafeByte(byte: number): boolean {
  return byte >= SAFE_MIN && byte <= SAFE_MAX && byte !== 0x3d;
}

function toHexEscape(byte: number): string {
  return '=' + byte.toString(16).toUpperCase().padStart(2, '0');
}

function isLineEnd(bytes: Uint8Array, index: number): boolean {
  const next = bytes[index + 1];
  if (next === undefined) return true;
  if (next === 0x0a) return true;
  if (next === 0x0d && bytes[index + 2] === 0x0a) return true;
  return false;
}

export function encodeQuotedPrintable(text: string, options: EncodeQuotedPrintableOptions = {}): string {
  const { lineLength = 76 } = options;
  const bytes = new TextEncoder().encode(text);
  let output = '';
  let column = 0;

  const emit = (token: string) => {
    if (column + token.length > lineLength - 1) {
      output += '=\n';
      column = 0;
    }
    output += token;
    column += token.length;
  };

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];

    if (byte === 0x0d && bytes[i + 1] === 0x0a) {
      continue;
    }

    if (byte === 0x0a) {
      output += '\n';
      column = 0;
      continue;
    }

    if (byte === 0x20 || byte === 0x09) {
      emit(isLineEnd(bytes, i) ? toHexEscape(byte) : String.fromCharCode(byte));
      continue;
    }

    emit(isSafeByte(byte) ? String.fromCharCode(byte) : toHexEscape(byte));
  }

  return output;
}

export function decodeQuotedPrintable(input: string): string {
  const bytes: number[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (ch === '=') {
      if (input[i + 1] === '\n') {
        i += 2;
        continue;
      }
      if (input[i + 1] === '\r' && input[i + 2] === '\n') {
        i += 3;
        continue;
      }
      const hex = input.slice(i + 1, i + 3);
      if (!/^[0-9A-Fa-f]{2}$/.test(hex)) {
        throw new Error(`Invalid quoted-printable sequence: "=${input.slice(i + 1, i + 3)}"`);
      }
      bytes.push(parseInt(hex, 16));
      i += 3;
      continue;
    }

    const code = ch.charCodeAt(0);
    if (code > 0x7f) {
      throw new Error(`Quoted-printable input must be ASCII, found: "${ch}"`);
    }
    bytes.push(code);
    i += 1;
  }

  return new TextDecoder().decode(new Uint8Array(bytes));
}

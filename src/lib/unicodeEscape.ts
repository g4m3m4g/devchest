export type EscapeStyle = 'js' | 'css' | 'python' | 'codepoint';
export type EncodeScope = 'nonAscii' | 'all';

function toHex(codePoint: number, minDigits: number): string {
  return codePoint.toString(16).padStart(minDigits, '0');
}

function formatEscape(codePoint: number, style: EscapeStyle): string {
  const isAstral = codePoint > 0xffff;
  switch (style) {
    case 'js':
      return isAstral ? `\\u{${toHex(codePoint, 1)}}` : `\\u${toHex(codePoint, 4)}`;
    case 'css':
      return `\\${toHex(codePoint, 1)} `;
    case 'python':
      return isAstral ? `\\U${toHex(codePoint, 8)}` : `\\u${toHex(codePoint, 4)}`;
    case 'codepoint':
      return `U+${toHex(codePoint, 4).toUpperCase()}`;
  }
}

export function encodeUnicode(text: string, style: EscapeStyle = 'js', scope: EncodeScope = 'nonAscii'): string {
  let result = '';
  for (const char of text) {
    const codePoint = char.codePointAt(0)!;
    result += scope === 'all' || codePoint > 127 ? formatEscape(codePoint, style) : char;
  }
  return result;
}

const ESCAPE_REGEX = /\\u\{([0-9a-fA-F]+)\}|\\U([0-9a-fA-F]{8})|\\u([0-9a-fA-F]{4})|\\([0-9a-fA-F]{1,6})\s?|U\+([0-9a-fA-F]{4,6})/g;

export function decodeUnicode(text: string): string {
  return text.replace(ESCAPE_REGEX, (match, jsExt, py8, u4, cssHex, uplus) => {
    const hex = jsExt ?? py8 ?? u4 ?? cssHex ?? uplus;
    const codePoint = parseInt(hex, 16);
    if (Number.isNaN(codePoint) || codePoint > 0x10ffff) return match;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return match;
    }
  });
}

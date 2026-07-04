export type EncodeMode = 'named' | 'all';

const NAMED_ENCODE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const NAMED_DECODE_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  copy: '©',
  reg: '®',
  trade: '™',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  laquo: '«',
  raquo: '»',
  ldquo: '“',
  rdquo: '”',
  lsquo: '‘',
  rsquo: '’',
};

export function encodeHtmlEntities(text: string, mode: EncodeMode = 'named'): string {
  let result = '';
  for (const char of text) {
    if (NAMED_ENCODE_MAP[char]) {
      result += NAMED_ENCODE_MAP[char];
    } else if (mode === 'all' && char.codePointAt(0)! > 127) {
      result += `&#${char.codePointAt(0)};`;
    } else {
      result += char;
    }
  }
  return result;
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity[0] === '#') {
      const codePoint = entity[1] === 'x' || entity[1] === 'X'
        ? parseInt(entity.slice(2), 16)
        : parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return NAMED_DECODE_MAP[entity] ?? match;
  });
}

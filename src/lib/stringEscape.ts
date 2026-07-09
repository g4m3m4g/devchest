export type StringEscapeFormat = 'js' | 'python' | 'sql';

const BACKSLASH_ESCAPES: [string, string][] = [
  ['\\', '\\\\'],
  ['\n', '\\n'],
  ['\r', '\\r'],
  ['\t', '\\t'],
];

function escapeBackslashStyle(text: string, quote: string): string {
  let result = '';
  for (const char of text) {
    const escape = BACKSLASH_ESCAPES.find(([raw]) => raw === char);
    if (escape) {
      result += escape[1];
    } else if (char === quote) {
      result += '\\' + quote;
    } else {
      result += char;
    }
  }
  return result;
}

function unescapeBackslashStyle(text: string, quote: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\\' && i + 1 < text.length) {
      const next = text[i + 1];
      if (next === 'n') {
        result += '\n';
      } else if (next === 'r') {
        result += '\r';
      } else if (next === 't') {
        result += '\t';
      } else if (next === '\\') {
        result += '\\';
      } else if (next === quote) {
        result += quote;
      } else {
        result += next;
      }
      i++;
    } else {
      result += char;
    }
  }
  return result;
}

export function escapeString(text: string, format: StringEscapeFormat): string {
  if (format === 'sql') return text.replace(/'/g, "''");
  const quote = format === 'js' ? '"' : "'";
  return escapeBackslashStyle(text, quote);
}

export function unescapeString(text: string, format: StringEscapeFormat): string {
  if (format === 'sql') return text.replace(/''/g, "'");
  const quote = format === 'js' ? '"' : "'";
  return unescapeBackslashStyle(text, quote);
}

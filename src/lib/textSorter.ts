export type SortMode = 'alphabetical' | 'numeric' | 'length';
export type SortDirection = 'asc' | 'desc';

export interface TextSortOptions {
  mode: SortMode;
  direction?: SortDirection;
  caseSensitive?: boolean;
  dedupe?: boolean;
  trimLines?: boolean;
  removeEmpty?: boolean;
}

export function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

export function extractNumber(line: string): number | null {
  const match = line.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return parseFloat(match[0]);
}

export function dedupeLines(lines: string[], caseSensitive = true): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of lines) {
    const key = caseSensitive ? line : line.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }
  return result;
}

export function sortTextLines(text: string, options: TextSortOptions): string[] {
  const {
    mode,
    direction = 'asc',
    caseSensitive = false,
    dedupe = false,
    trimLines = false,
    removeEmpty = false,
  } = options;

  let lines = splitLines(text);
  if (trimLines) lines = lines.map(l => l.trim());
  if (removeEmpty) lines = lines.filter(l => l.trim() !== '');
  if (dedupe) lines = dedupeLines(lines, caseSensitive);

  const sign = direction === 'desc' ? -1 : 1;

  return [...lines].sort((a, b) => {
    if (mode === 'numeric') {
      const na = extractNumber(a);
      const nb = extractNumber(b);
      if (na === null && nb === null) return 0;
      if (na === null) return 1;
      if (nb === null) return -1;
      return sign * (na - nb);
    }

    if (mode === 'length') {
      return sign * (a.length - b.length);
    }

    const ca = caseSensitive ? a : a.toLowerCase();
    const cb = caseSensitive ? b : b.toLowerCase();
    return sign * (ca < cb ? -1 : ca > cb ? 1 : 0);
  });
}

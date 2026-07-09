export type LineFilterMode = 'keep' | 'remove';

export interface LineFilterOptions {
  pattern: string;
  mode: LineFilterMode;
  useRegex: boolean;
  caseSensitive: boolean;
}

export interface LineFilterResult {
  lines: string[];
  error: string | null;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

export function filterLines(text: string, options: LineFilterOptions): LineFilterResult {
  const { pattern, mode, useRegex, caseSensitive } = options;
  const lines = splitLines(text);

  if (pattern === '') {
    return { lines, error: null };
  }

  const source = useRegex ? pattern : escapeRegExp(pattern);
  let regex: RegExp;
  try {
    regex = new RegExp(source, caseSensitive ? '' : 'i');
  } catch (e) {
    return { lines: [], error: (e as Error).message };
  }

  const filtered = lines.filter(line => {
    const matches = regex.test(line);
    return mode === 'keep' ? matches : !matches;
  });

  return { lines: filtered, error: null };
}

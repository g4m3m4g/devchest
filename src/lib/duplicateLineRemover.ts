export interface DuplicateLineOptions {
  caseSensitive: boolean;
  trimLines: boolean;
}

function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

export function removeDuplicateLines(text: string, options: DuplicateLineOptions): string[] {
  const { caseSensitive, trimLines } = options;
  const lines = splitLines(text).map(line => (trimLines ? line.trim() : line));

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

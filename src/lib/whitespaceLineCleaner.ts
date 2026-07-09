export interface WhitespaceCleanOptions {
  trimLines?: boolean;
  collapseSpaces?: boolean;
  collapseBlankLines?: boolean;
  stripBlankLines?: boolean;
  trimDocument?: boolean;
}

export function splitLines(text: string): string[] {
  if (text === '') return [];
  return text.split(/\r?\n/);
}

function isBlank(line: string): boolean {
  return line.trim() === '';
}

export function trimLines(lines: string[]): string[] {
  return lines.map(l => l.trim());
}

export function collapseSpaces(lines: string[]): string[] {
  return lines.map(l => l.replace(/[ \t]+/g, ' '));
}

export function collapseBlankLines(lines: string[]): string[] {
  const result: string[] = [];
  let prevBlank = false;
  for (const line of lines) {
    const blank = isBlank(line);
    if (blank && prevBlank) continue;
    result.push(line);
    prevBlank = blank;
  }
  return result;
}

export function stripBlankLines(lines: string[]): string[] {
  return lines.filter(l => !isBlank(l));
}

function trimDocumentLines(lines: string[]): string[] {
  let start = 0;
  let end = lines.length;
  while (start < end && isBlank(lines[start])) start++;
  while (end > start && isBlank(lines[end - 1])) end--;
  return lines.slice(start, end);
}

export function cleanWhitespace(text: string, options: WhitespaceCleanOptions): string[] {
  const {
    trimLines: shouldTrimLines = false,
    collapseSpaces: shouldCollapseSpaces = false,
    collapseBlankLines: shouldCollapseBlankLines = false,
    stripBlankLines: shouldStripBlankLines = false,
    trimDocument: shouldTrimDocument = false,
  } = options;

  let lines = splitLines(text);
  if (shouldTrimLines) lines = trimLines(lines);
  if (shouldCollapseSpaces) lines = collapseSpaces(lines);

  if (shouldStripBlankLines) {
    lines = stripBlankLines(lines);
  } else if (shouldCollapseBlankLines) {
    lines = collapseBlankLines(lines);
  }

  if (shouldTrimDocument) lines = trimDocumentLines(lines);

  return lines;
}

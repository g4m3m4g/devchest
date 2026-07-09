export interface ColumnExtractorOptions {
  delimiter: string;
  columns: string;
  outputDelimiter: string;
}

export interface ColumnExtractorResult {
  output: string;
  error: string | null;
}

export function parseColumnSpec(spec: string): number[] | null {
  const trimmed = spec.trim();
  if (trimmed === '') return null;

  const columns: number[] = [];
  for (const part of trimmed.split(',')) {
    const entry = part.trim();
    const rangeMatch = entry.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      if (start < 1 || end < start) return null;
      for (let i = start; i <= end; i++) columns.push(i);
      continue;
    }

    if (!/^\d+$/.test(entry)) return null;
    const n = parseInt(entry, 10);
    if (n < 1) return null;
    columns.push(n);
  }

  return columns;
}

export function extractColumns(text: string, options: ColumnExtractorOptions): ColumnExtractorResult {
  const { delimiter, columns, outputDelimiter } = options;

  if (text === '') {
    return { output: '', error: null };
  }

  const indices = parseColumnSpec(columns);
  if (indices === null) {
    return { output: '', error: `Invalid column selection: "${columns}"` };
  }

  const lines = text.split(/\r?\n/).map(line => {
    const fields = line.split(delimiter);
    return indices.map(i => fields[i - 1] ?? '').join(outputDelimiter);
  });

  return { output: lines.join('\n'), error: null };
}

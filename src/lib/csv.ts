import Papa from 'papaparse';

export interface CsvParseResult {
  headers: string[];
  rows: string[][];
  rowCount: number;
  colCount: number;
  error: string | null;
}

export interface CsvFormatOptions {
  delimiter: string;
  quoteAll?: boolean;
}

const DELIMITERS = [',', ';', '\t', '|'] as const;

export function detectDelimiter(input: string): string {
  const firstLine = input.split('\n')[0] ?? '';
  let best = ',';
  let bestCount = 0;
  for (const d of DELIMITERS) {
    const count = firstLine.split(d).length - 1;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

export function parseCSV(input: string, delimiter = ','): CsvParseResult {
  const trimmed = input.trim();
  if (!trimmed) return { headers: [], rows: [], rowCount: 0, colCount: 0, error: null };

  const result = Papa.parse<string[]>(trimmed, {
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    return { headers: [], rows: [], rowCount: 0, colCount: 0, error: result.errors[0]?.message ?? 'Parse error' };
  }

  const [headers = [], ...rows] = result.data;
  return {
    headers,
    rows,
    rowCount: rows.length,
    colCount: headers.length,
    error: null,
  };
}

export function formatCSV(headers: string[], rows: string[][], options: CsvFormatOptions): string {
  if (headers.length === 0) return '';
  return Papa.unparse([headers, ...rows], {
    delimiter: options.delimiter,
    quotes: options.quoteAll ?? false,
  });
}

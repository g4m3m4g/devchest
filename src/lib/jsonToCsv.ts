import Papa from 'papaparse';

export interface JsonToCsvResult {
  output: string;
  error: string | null;
}

export function jsonToCsv(jsonInput: string): JsonToCsvResult {
  const trimmed = jsonInput.trim();
  if (!trimmed) return { output: '', error: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }

  if (!Array.isArray(parsed)) {
    return { output: '', error: 'Input must be a JSON array of objects' };
  }
  if (parsed.length === 0) {
    return { output: '', error: null };
  }
  if (!parsed.every(isPlainObject)) {
    return { output: '', error: 'Array elements must be objects' };
  }

  const flatRows = parsed.map(obj => flatten(obj));

  const headers: string[] = [];
  const seenHeaders = new Set<string>();
  for (const row of flatRows) {
    for (const key of Object.keys(row)) {
      if (!seenHeaders.has(key)) {
        seenHeaders.add(key);
        headers.push(key);
      }
    }
  }

  const rows = flatRows.map(row => headers.map(h => stringifyValue(row[h])));
  const output = Papa.unparse([headers, ...rows]);
  return { output, error: null };
}

function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      Object.assign(result, flatten(value, path));
    } else {
      result[path] = value;
    }
  }
  return result;
}

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

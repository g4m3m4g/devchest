import Papa from 'papaparse';

export interface CsvToJsonResult {
  output: string;
  error: string | null;
}

export function csvToJson(csvInput: string, delimiter = ','): CsvToJsonResult {
  const trimmed = csvInput.trim();
  if (!trimmed) return { output: '', error: null };

  const result = Papa.parse<Record<string, string>>(trimmed, {
    header: true,
    delimiter,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    return { output: '', error: result.errors[0]?.message ?? 'Parse error' };
  }

  const rows = result.data.map(row => {
    const obj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      obj[key] = coerce(value);
    }
    return obj;
  });

  return { output: JSON.stringify(rows, null, 2), error: null };
}

function coerce(value: string): unknown {
  if (value === '') return '';
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

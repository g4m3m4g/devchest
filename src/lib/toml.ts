import { parse as parseToml, stringify as stringifyToml } from 'smol-toml';

export interface TomlResult {
  output: string;
  error: string | null;
}

export function formatToml(toml: string): TomlResult {
  const input = toml.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = parseToml(input);
    return { output: stringifyToml(parsed).trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

export function tomlToJson(toml: string, indent = 2): TomlResult {
  const input = toml.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = parseToml(input);
    return { output: JSON.stringify(parsed, null, indent), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

export function jsonToToml(json: string): TomlResult {
  const input = json.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return { output: '', error: 'TOML root must be a table (object), not an array' };
    }
    return { output: stringifyToml(parsed as Record<string, unknown>).trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

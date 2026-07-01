import { load, dump } from 'js-yaml';

export interface YamlResult {
  output: string;
  error: string | null;
}

export function formatYaml(yaml: string): YamlResult {
  const input = yaml.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = load(input);
    return { output: dump(parsed, { indent: 2 }).trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

export function yamlToJson(yaml: string, indent = 2): YamlResult {
  const input = yaml.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = load(input);
    return { output: JSON.stringify(parsed, null, indent), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

export function jsonToYaml(json: string): YamlResult {
  const input = json.trim();
  if (!input) return { output: '', error: null };
  try {
    const parsed = JSON.parse(input);
    return { output: dump(parsed, { indent: 2 }).trim(), error: null };
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }
}

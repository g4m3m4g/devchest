import { describe, it, expect } from 'vitest';
import { formatYaml, yamlToJson, jsonToYaml } from '../../lib/yaml';

describe('formatYaml', () => {
  it('returns empty output for empty input', () => {
    const result = formatYaml('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = formatYaml('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a simple key-value pair', () => {
    const result = formatYaml('name: Alice');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name: Alice');
  });

  it('formats nested YAML', () => {
    const result = formatYaml('person:\n  name: Alice\n  age: 30');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name: Alice');
    expect(result.output).toContain('age: 30');
  });

  it('formats a YAML list', () => {
    const result = formatYaml('items:\n  - foo\n  - bar');
    expect(result.error).toBeNull();
    expect(result.output).toContain('foo');
    expect(result.output).toContain('bar');
  });

  it('returns error for invalid YAML', () => {
    const result = formatYaml('key: [unclosed bracket');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('handles boolean and number values', () => {
    const result = formatYaml('flag: true\ncount: 42');
    expect(result.error).toBeNull();
    expect(result.output).toContain('flag');
    expect(result.output).toContain('count');
  });
});

describe('yamlToJson', () => {
  it('converts a simple YAML to JSON', () => {
    const result = yamlToJson('name: Alice\nage: 30');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('converts nested YAML to JSON', () => {
    const result = yamlToJson('person:\n  name: Alice');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed.person.name).toBe('Alice');
  });

  it('converts YAML array to JSON array', () => {
    const result = yamlToJson('- a\n- b\n- c');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toEqual(['a', 'b', 'c']);
  });

  it('returns empty output for empty input', () => {
    const result = yamlToJson('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns error for invalid YAML', () => {
    const result = yamlToJson('key: [unclosed bracket');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('uses 2-space indent by default', () => {
    const result = yamlToJson('a:\n  b: 1');
    expect(result.error).toBeNull();
    expect(result.output).toContain('  ');
  });

  it('uses custom indent when specified', () => {
    const result = yamlToJson('a: 1', 4);
    expect(result.error).toBeNull();
    const lines = result.output.split('\n');
    expect(lines[0]).toBe('{');
  });
});

describe('jsonToYaml', () => {
  it('converts a simple JSON object to YAML', () => {
    const result = jsonToYaml('{"name":"Alice","age":30}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name: Alice');
    expect(result.output).toContain('age: 30');
  });

  it('converts a JSON array to YAML', () => {
    const result = jsonToYaml('["a","b","c"]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('- a');
    expect(result.output).toContain('- b');
  });

  it('converts nested JSON to YAML', () => {
    const result = jsonToYaml('{"person":{"name":"Alice"}}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('person:');
    expect(result.output).toContain('name: Alice');
  });

  it('returns empty output for empty input', () => {
    const result = jsonToYaml('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns error for invalid JSON', () => {
    const result = jsonToYaml('{bad json}');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('round-trips through YAML and back to equivalent JSON', () => {
    const original = '{"key":"value","num":42}';
    const toYaml = jsonToYaml(original);
    expect(toYaml.error).toBeNull();
    const backToJson = yamlToJson(toYaml.output);
    expect(backToJson.error).toBeNull();
    expect(JSON.parse(backToJson.output)).toEqual(JSON.parse(original));
  });
});

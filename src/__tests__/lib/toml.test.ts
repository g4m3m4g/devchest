import { describe, it, expect } from 'vitest';
import { formatToml, tomlToJson, jsonToToml } from '../../lib/toml';

describe('formatToml', () => {
  it('returns empty output for empty input', () => {
    const result = formatToml('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = formatToml('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a simple key-value pair', () => {
    const result = formatToml('name = "Alice"');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name');
    expect(result.output).toContain('Alice');
  });

  it('formats a TOML table', () => {
    const result = formatToml('[person]\nname = "Alice"\nage = 30');
    expect(result.error).toBeNull();
    expect(result.output).toContain('[person]');
    expect(result.output).toContain('name');
  });

  it('formats a TOML array', () => {
    const result = formatToml('items = ["a", "b", "c"]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('items');
  });

  it('returns error for invalid TOML', () => {
    const result = formatToml('key = [unclosed bracket');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('handles boolean and integer values', () => {
    const result = formatToml('flag = true\ncount = 42');
    expect(result.error).toBeNull();
    expect(result.output).toContain('flag');
    expect(result.output).toContain('count');
  });
});

describe('tomlToJson', () => {
  it('converts a simple TOML to JSON', () => {
    const result = tomlToJson('name = "Alice"\nage = 30');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed.name).toBe('Alice');
    expect(parsed.age).toBe(30);
  });

  it('converts a TOML table to a nested JSON object', () => {
    const result = tomlToJson('[person]\nname = "Alice"');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed.person.name).toBe('Alice');
  });

  it('converts a TOML array to a JSON array', () => {
    const result = tomlToJson('items = ["a", "b", "c"]');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(Array.isArray(parsed.items)).toBe(true);
    expect(parsed.items).toEqual(['a', 'b', 'c']);
  });

  it('returns empty output for empty input', () => {
    const result = tomlToJson('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns error for invalid TOML', () => {
    const result = tomlToJson('key = [unclosed');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('uses 2-space indent by default', () => {
    const result = tomlToJson('[a]\nb = 1');
    expect(result.error).toBeNull();
    expect(result.output).toContain('  ');
  });

  it('handles boolean values', () => {
    const result = tomlToJson('flag = true');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed.flag).toBe(true);
  });
});

describe('jsonToToml', () => {
  it('converts a simple JSON object to TOML', () => {
    const result = jsonToToml('{"name":"Alice","age":30}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name');
    expect(result.output).toContain('Alice');
    expect(result.output).toContain('age');
  });

  it('converts nested JSON to TOML tables', () => {
    const result = jsonToToml('{"person":{"name":"Alice"}}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('[person]');
    expect(result.output).toContain('name');
  });

  it('converts a JSON array value to TOML array', () => {
    const result = jsonToToml('{"items":["a","b","c"]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('items');
  });

  it('returns empty output for empty input', () => {
    const result = jsonToToml('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns error for invalid JSON', () => {
    const result = jsonToToml('{bad json}');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('returns error for JSON array at root (TOML requires a root table)', () => {
    const result = jsonToToml('["a","b"]');
    expect(result.error).not.toBeNull();
  });

  it('round-trips through TOML and back to equivalent JSON', () => {
    const original = '{"key":"value","num":42}';
    const toToml = jsonToToml(original);
    expect(toToml.error).toBeNull();
    const backToJson = tomlToJson(toToml.output);
    expect(backToJson.error).toBeNull();
    expect(JSON.parse(backToJson.output)).toEqual(JSON.parse(original));
  });
});

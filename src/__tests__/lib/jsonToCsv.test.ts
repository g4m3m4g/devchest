import { describe, it, expect } from 'vitest';
import { jsonToCsv } from '../../lib/jsonToCsv';

describe('jsonToCsv', () => {
  it('returns empty output for empty input', () => {
    const result = jsonToCsv('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = jsonToCsv('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns an error for invalid JSON', () => {
    const result = jsonToCsv('{bad json}');
    expect(result.output).toBe('');
    expect(result.error).not.toBeNull();
  });

  it('returns an error when the JSON is not an array', () => {
    const result = jsonToCsv('{"a":1}');
    expect(result.output).toBe('');
    expect(result.error).toContain('array');
  });

  it('returns an error when the array does not contain objects', () => {
    const result = jsonToCsv('[1,2,3]');
    expect(result.output).toBe('');
    expect(result.error).not.toBeNull();
  });

  it('converts an array of flat objects to CSV', () => {
    const result = jsonToCsv('[{"name":"Alice","age":30},{"name":"Bob","age":25}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('name,age');
    expect(result.output).toContain('Alice,30');
    expect(result.output).toContain('Bob,25');
  });

  it('unions headers across objects with differing keys', () => {
    const result = jsonToCsv('[{"a":1},{"a":2,"b":3}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('a,b');
    expect(result.output).toContain('1,');
    expect(result.output).toContain('2,3');
  });

  it('flattens nested objects using dot notation', () => {
    const result = jsonToCsv('[{"user":{"name":"Alice","address":{"city":"NYC"}}}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('user.name,user.address.city');
    expect(result.output).toContain('Alice,NYC');
  });

  it('serializes arrays within objects as JSON strings', () => {
    const result = jsonToCsv('[{"tags":["a","b"]}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('tags');
    expect(result.output).toContain('"[""a"",""b""]"');
  });

  it('returns an empty string for an empty array', () => {
    const result = jsonToCsv('[]');
    expect(result.error).toBeNull();
    expect(result.output).toBe('');
  });
});

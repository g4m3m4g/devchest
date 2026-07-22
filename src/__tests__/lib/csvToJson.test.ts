import { describe, it, expect } from 'vitest';
import { csvToJson } from '../../lib/csvToJson';

describe('csvToJson', () => {
  it('returns empty output for empty input', () => {
    const result = csvToJson('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = csvToJson('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('converts a simple CSV to a JSON array of objects', () => {
    const result = csvToJson('name,age\nAlice,30\nBob,25');
    expect(result.error).toBeNull();
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ]);
  });

  it('coerces booleans', () => {
    const result = csvToJson('name,active\nAlice,true\nBob,false');
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual([
      { name: 'Alice', active: true },
      { name: 'Bob', active: false },
    ]);
  });

  it('keeps non-numeric, non-boolean fields as strings', () => {
    const result = csvToJson('name,code\nAlice,007');
    const parsed = JSON.parse(result.output);
    expect(parsed[0].code).toBe('007');
  });

  it('leaves empty fields as empty strings', () => {
    const result = csvToJson('name,age\nAlice,');
    const parsed = JSON.parse(result.output);
    expect(parsed[0].age).toBe('');
  });

  it('parses with a custom delimiter', () => {
    const result = csvToJson('name;age\nAlice;30', ';');
    const parsed = JSON.parse(result.output);
    expect(parsed).toEqual([{ name: 'Alice', age: 30 }]);
  });

  it('returns an empty array for header-only CSV', () => {
    const result = csvToJson('name,age');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual([]);
  });

  it('returns an error for malformed CSV', () => {
    const result = csvToJson('"unterminated,value\nrow2,data');
    expect(result.error).not.toBeNull();
  });
});

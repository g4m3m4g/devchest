import { describe, it, expect } from 'vitest';
import { parseColumnSpec, extractColumns } from '../../lib/columnExtractor';
import type { ColumnExtractorOptions } from '../../lib/columnExtractor';

describe('parseColumnSpec', () => {
  it('parses a single column number', () => {
    expect(parseColumnSpec('2')).toEqual([2]);
  });

  it('parses a comma-separated list', () => {
    expect(parseColumnSpec('1,3,5')).toEqual([1, 3, 5]);
  });

  it('parses a range', () => {
    expect(parseColumnSpec('2-4')).toEqual([2, 3, 4]);
  });

  it('parses a mix of individual columns and ranges', () => {
    expect(parseColumnSpec('1,3-5,7')).toEqual([1, 3, 4, 5, 7]);
  });

  it('ignores whitespace around entries', () => {
    expect(parseColumnSpec(' 1 , 2 ')).toEqual([1, 2]);
  });

  it('returns null for an empty spec', () => {
    expect(parseColumnSpec('')).toBeNull();
  });

  it('returns null for a non-numeric spec', () => {
    expect(parseColumnSpec('a,b')).toBeNull();
  });

  it('returns null when a column number is less than 1', () => {
    expect(parseColumnSpec('0')).toBeNull();
  });
});

const base: ColumnExtractorOptions = {
  delimiter: ',',
  columns: '1',
  outputDelimiter: ',',
};

describe('extractColumns', () => {
  it('extracts a single column from each line', () => {
    const result = extractColumns('a,b,c\nd,e,f', { ...base, columns: '2' });
    expect(result).toEqual({ output: 'b\ne', error: null });
  });

  it('extracts multiple columns in the given order', () => {
    const result = extractColumns('a,b,c\nd,e,f', { ...base, columns: '3,1' });
    expect(result).toEqual({ output: 'c,a\nf,d', error: null });
  });

  it('extracts a range of columns', () => {
    const result = extractColumns('a,b,c,d\n1,2,3,4', { ...base, columns: '2-3' });
    expect(result).toEqual({ output: 'b,c\n2,3', error: null });
  });

  it('supports a custom output delimiter', () => {
    const result = extractColumns('a,b,c', { ...base, columns: '1,3', outputDelimiter: ' | ' });
    expect(result).toEqual({ output: 'a | c', error: null });
  });

  it('supports tab delimiters', () => {
    const result = extractColumns('a\tb\tc', { ...base, delimiter: '\t', columns: '2' });
    expect(result).toEqual({ output: 'b', error: null });
  });

  it('outputs empty string for out-of-range columns', () => {
    const result = extractColumns('a,b', { ...base, columns: '5' });
    expect(result).toEqual({ output: '', error: null });
  });

  it('returns an error for an invalid column spec', () => {
    const result = extractColumns('a,b,c', { ...base, columns: 'x' });
    expect(result.output).toBe('');
    expect(result.error).not.toBeNull();
  });

  it('returns empty output for empty input', () => {
    const result = extractColumns('', base);
    expect(result).toEqual({ output: '', error: null });
  });
});

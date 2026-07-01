import { describe, it, expect } from 'vitest';
import { parseCSV, formatCSV, detectDelimiter } from '../../lib/csv';

describe('detectDelimiter', () => {
  it('detects comma as delimiter', () => {
    expect(detectDelimiter('a,b,c\n1,2,3')).toBe(',');
  });

  it('detects semicolon as delimiter', () => {
    expect(detectDelimiter('a;b;c\n1;2;3')).toBe(';');
  });

  it('detects tab as delimiter', () => {
    expect(detectDelimiter('a\tb\tc\n1\t2\t3')).toBe('\t');
  });

  it('detects pipe as delimiter', () => {
    expect(detectDelimiter('a|b|c\n1|2|3')).toBe('|');
  });

  it('defaults to comma for empty input', () => {
    expect(detectDelimiter('')).toBe(',');
  });

  it('defaults to comma when no clear delimiter', () => {
    expect(detectDelimiter('hello world')).toBe(',');
  });
});

describe('parseCSV', () => {
  it('returns empty result for empty input', () => {
    const result = parseCSV('');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('returns empty result for whitespace-only input', () => {
    const result = parseCSV('   ');
    expect(result.headers).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('parses a simple CSV with headers', () => {
    const result = parseCSV('name,age\nAlice,30\nBob,25');
    expect(result.error).toBeNull();
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toEqual(['Alice', '30']);
    expect(result.rows[1]).toEqual(['Bob', '25']);
  });

  it('parses a single header row with no data rows', () => {
    const result = parseCSV('name,age,city');
    expect(result.error).toBeNull();
    expect(result.headers).toEqual(['name', 'age', 'city']);
    expect(result.rows).toHaveLength(0);
  });

  it('handles quoted fields containing commas', () => {
    const result = parseCSV('name,age\n"Smith, John",30\n"Doe, Jane",25', ',');
    expect(result.error).toBeNull();
    expect(result.rows[0][0]).toBe('Smith, John');
    expect(result.rows[1][0]).toBe('Doe, Jane');
  });

  it('handles quoted fields containing newlines', () => {
    const result = parseCSV('field1,field2\n"line1\nline2",value');
    expect(result.error).toBeNull();
    expect(result.rows[0][0]).toContain('line1');
  });

  it('handles escaped double quotes inside quoted fields', () => {
    const result = parseCSV('name,val\n"say ""hello""",30');
    expect(result.error).toBeNull();
    expect(result.rows[0][0]).toBe('say "hello"');
  });

  it('parses with semicolon delimiter', () => {
    const result = parseCSV('name;age\nAlice;30', ';');
    expect(result.error).toBeNull();
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows[0]).toEqual(['Alice', '30']);
  });

  it('parses with tab delimiter', () => {
    const result = parseCSV('name\tage\nAlice\t30', '\t');
    expect(result.error).toBeNull();
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows[0]).toEqual(['Alice', '30']);
  });

  it('parses with pipe delimiter', () => {
    const result = parseCSV('name|age\nAlice|30', '|');
    expect(result.error).toBeNull();
    expect(result.headers).toEqual(['name', 'age']);
    expect(result.rows[0]).toEqual(['Alice', '30']);
  });

  it('handles empty fields', () => {
    const result = parseCSV('a,b,c\n1,,3');
    expect(result.error).toBeNull();
    expect(result.rows[0]).toEqual(['1', '', '3']);
  });

  it('exposes colCount equal to header length', () => {
    const result = parseCSV('a,b,c\n1,2,3');
    expect(result.colCount).toBe(3);
  });

  it('exposes rowCount equal to data row count', () => {
    const result = parseCSV('a,b\n1,2\n3,4\n5,6');
    expect(result.rowCount).toBe(3);
  });
});

describe('formatCSV', () => {
  it('formats with comma delimiter by default', () => {
    const result = formatCSV(['name', 'age'], [['Alice', '30']], { delimiter: ',' });
    expect(result).toContain('name,age');
    expect(result).toContain('Alice,30');
  });

  it('formats with semicolon delimiter', () => {
    const result = formatCSV(['name', 'age'], [['Alice', '30']], { delimiter: ';' });
    expect(result).toContain('name;age');
    expect(result).toContain('Alice;30');
  });

  it('formats with tab delimiter', () => {
    const result = formatCSV(['a', 'b'], [['1', '2']], { delimiter: '\t' });
    expect(result).toContain('a\tb');
  });

  it('quotes all fields when quoteAll is true', () => {
    const result = formatCSV(['name'], [['Alice']], { delimiter: ',', quoteAll: true });
    expect(result).toContain('"name"');
    expect(result).toContain('"Alice"');
  });

  it('returns empty string for empty headers', () => {
    const result = formatCSV([], [], { delimiter: ',' });
    expect(result.trim()).toBe('');
  });

  it('round-trips through parse and format', () => {
    const original = 'name,age\nAlice,30\nBob,25';
    const parsed = parseCSV(original);
    const formatted = formatCSV(parsed.headers, parsed.rows, { delimiter: ',' });
    const reparsed = parseCSV(formatted);
    expect(reparsed.headers).toEqual(parsed.headers);
    expect(reparsed.rows).toEqual(parsed.rows);
  });
});

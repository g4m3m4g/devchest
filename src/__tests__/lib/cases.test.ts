import { describe, it, expect } from 'vitest';
import {
  tokenize,
  toCamelCase,
  toPascalCase,
  toSnakeCase,
  toScreamingSnakeCase,
  toKebabCase,
  toTitleCase,
  CONVERSIONS,
} from '../../lib/cases';

describe('tokenize', () => {
  it('splits space-separated words', () => {
    expect(tokenize('hello world')).toEqual(['hello', 'world']);
  });

  it('splits snake_case', () => {
    expect(tokenize('hello_world')).toEqual(['hello', 'world']);
  });

  it('splits kebab-case', () => {
    expect(tokenize('hello-world')).toEqual(['hello', 'world']);
  });

  it('splits camelCase', () => {
    expect(tokenize('helloWorld')).toEqual(['hello', 'world']);
  });

  it('splits PascalCase', () => {
    expect(tokenize('HelloWorld')).toEqual(['hello', 'world']);
  });

  it('splits consecutive uppercase (SCREAMING)', () => {
    expect(tokenize('HELLO_WORLD')).toEqual(['hello', 'world']);
  });

  it('lowercases all tokens', () => {
    expect(tokenize('Hello World')).toEqual(['hello', 'world']);
  });

  it('filters empty strings', () => {
    expect(tokenize('  hello  world  ')).toEqual(['hello', 'world']);
  });

  it('returns empty array for empty string', () => {
    expect(tokenize('')).toEqual([]);
  });

  it('handles single word', () => {
    expect(tokenize('hello')).toEqual(['hello']);
  });

  it('handles dot and slash separators', () => {
    expect(tokenize('path/to.file')).toEqual(['path', 'to', 'file']);
  });
});

describe('toCamelCase', () => {
  it('converts space-separated words', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld');
  });

  it('converts snake_case', () => {
    expect(toCamelCase('hello_world')).toBe('helloWorld');
  });

  it('converts PascalCase', () => {
    expect(toCamelCase('HelloWorld')).toBe('helloWorld');
  });

  it('converts multi-word', () => {
    expect(toCamelCase('the quick brown fox')).toBe('theQuickBrownFox');
  });

  it('handles single word', () => {
    expect(toCamelCase('hello')).toBe('hello');
  });

  it('returns empty string for empty input', () => {
    expect(toCamelCase('')).toBe('');
  });
});

describe('toPascalCase', () => {
  it('converts space-separated words', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld');
  });

  it('converts snake_case', () => {
    expect(toPascalCase('hello_world')).toBe('HelloWorld');
  });

  it('capitalizes first letter', () => {
    expect(toPascalCase('hello')).toBe('Hello');
  });
});

describe('toSnakeCase', () => {
  it('converts space-separated to snake_case', () => {
    expect(toSnakeCase('hello world')).toBe('hello_world');
  });

  it('converts camelCase to snake_case', () => {
    expect(toSnakeCase('helloWorld')).toBe('hello_world');
  });

  it('converts PascalCase to snake_case', () => {
    expect(toSnakeCase('HelloWorld')).toBe('hello_world');
  });

  it('handles multi-word', () => {
    expect(toSnakeCase('the quick brown fox')).toBe('the_quick_brown_fox');
  });
});

describe('toScreamingSnakeCase', () => {
  it('produces uppercase with underscores', () => {
    expect(toScreamingSnakeCase('hello world')).toBe('HELLO_WORLD');
  });

  it('converts camelCase', () => {
    expect(toScreamingSnakeCase('helloWorld')).toBe('HELLO_WORLD');
  });
});

describe('toKebabCase', () => {
  it('converts space-separated to kebab-case', () => {
    expect(toKebabCase('hello world')).toBe('hello-world');
  });

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('helloWorld')).toBe('hello-world');
  });

  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('HelloWorld')).toBe('hello-world');
  });
});

describe('toTitleCase', () => {
  it('capitalizes each word with spaces', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  it('converts camelCase to Title Case', () => {
    expect(toTitleCase('helloWorld')).toBe('Hello World');
  });
});

describe('CONVERSIONS', () => {
  it('exports 8 conversion entries', () => {
    expect(CONVERSIONS).toHaveLength(8);
  });

  it('each entry has id, label, sample, and convert function', () => {
    for (const c of CONVERSIONS) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.label).toBe('string');
      expect(typeof c.sample).toBe('string');
      expect(typeof c.convert).toBe('function');
    }
  });

  it('each convert function works with "hello world"', () => {
    for (const c of CONVERSIONS) {
      const result = c.convert('hello world');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    }
  });
});

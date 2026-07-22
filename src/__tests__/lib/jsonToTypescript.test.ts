import { describe, it, expect } from 'vitest';
import { generateTypeScriptInterfaces } from '../../lib/jsonToTypescript';

describe('generateTypeScriptInterfaces', () => {
  it('returns empty output for empty input', () => {
    const result = generateTypeScriptInterfaces('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = generateTypeScriptInterfaces('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns an error for invalid JSON', () => {
    const result = generateTypeScriptInterfaces('{bad json}');
    expect(result.output).toBe('');
    expect(result.error).not.toBeNull();
  });

  it('generates an interface for a flat object', () => {
    const result = generateTypeScriptInterfaces('{"name":"Alice","age":30,"active":true}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface Root {');
    expect(result.output).toContain('name: string;');
    expect(result.output).toContain('age: number;');
    expect(result.output).toContain('active: boolean;');
  });

  it('generates a nested interface for a nested object', () => {
    const result = generateTypeScriptInterfaces('{"user":{"name":"Bo"}}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface User {');
    expect(result.output).toContain('name: string;');
    expect(result.output).toContain('interface Root {');
    expect(result.output).toContain('user: User;');
  });

  it('generates a primitive array type', () => {
    const result = generateTypeScriptInterfaces('{"tags":["a","b"]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('tags: string[];');
  });

  it('generates a union type for a mixed primitive array', () => {
    const result = generateTypeScriptInterfaces('{"values":[1,"a"]}');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/values: \((number \| string|string \| number)\)\[\];/);
  });

  it('generates a singular interface name for an array of objects', () => {
    const result = generateTypeScriptInterfaces('{"items":[{"id":1},{"id":2}]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface Item {');
    expect(result.output).toContain('id: number;');
    expect(result.output).toContain('items: Item[];');
  });

  it('handles null values', () => {
    const result = generateTypeScriptInterfaces('{"x":null}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('x: null;');
  });

  it('marks fields missing from some array elements as optional', () => {
    const result = generateTypeScriptInterfaces('{"items":[{"a":1},{"a":1,"b":2}]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('a: number;');
    expect(result.output).toContain('b?: number;');
  });

  it('quotes non-identifier keys', () => {
    const result = generateTypeScriptInterfaces('{"foo-bar":1}');
    expect(result.error).toBeNull();
    expect(result.output).toContain("'foo-bar': number;");
  });

  it('generates a type alias with an item interface for a root array of objects', () => {
    const result = generateTypeScriptInterfaces('[{"a":1},{"a":2}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface RootItem {');
    expect(result.output).toContain('type Root = RootItem[];');
  });

  it('generates a type alias for a root primitive array', () => {
    const result = generateTypeScriptInterfaces('[1,2,3]');
    expect(result.error).toBeNull();
    expect(result.output).toBe('type Root = number[];');
  });

  it('renders an empty interface for an empty object', () => {
    const result = generateTypeScriptInterfaces('{}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('interface Root {}');
  });
});

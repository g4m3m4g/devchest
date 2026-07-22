import { describe, it, expect } from 'vitest';
import { generateZodSchema } from '../../lib/jsonToZod';

describe('generateZodSchema', () => {
  it('returns empty output for empty input', () => {
    const result = generateZodSchema('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = generateZodSchema('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns an error for invalid JSON', () => {
    const result = generateZodSchema('{bad json}');
    expect(result.output).toBe('');
    expect(result.error).not.toBeNull();
  });

  it('generates a schema for a flat object', () => {
    const result = generateZodSchema('{"name":"Alice","age":30,"active":true}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('const RootSchema = z.object({');
    expect(result.output).toContain('name: z.string(),');
    expect(result.output).toContain('age: z.number(),');
    expect(result.output).toContain('active: z.boolean(),');
  });

  it('generates a nested object schema', () => {
    const result = generateZodSchema('{"user":{"name":"Bo"}}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('user: z.object({');
    expect(result.output).toContain('name: z.string(),');
  });

  it('generates an array schema for a primitive array', () => {
    const result = generateZodSchema('{"tags":["a","b"]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('tags: z.array(z.string()),');
  });

  it('generates a union type for a mixed primitive array', () => {
    const result = generateZodSchema('{"values":[1,"a"]}');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/values: z\.array\(z\.union\(\[z\.(number\(\), z\.string\(\)|string\(\), z\.number\(\))\]\)\),/);
  });

  it('marks fields missing from some array elements as optional', () => {
    const result = generateZodSchema('{"items":[{"a":1},{"a":1,"b":2}]}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('a: z.number(),');
    expect(result.output).toContain('b: z.number().optional(),');
  });

  it('handles null values as nullable', () => {
    const result = generateZodSchema('{"x":null}');
    expect(result.error).toBeNull();
    expect(result.output).toContain('x: z.null(),');
  });

  it('quotes non-identifier keys', () => {
    const result = generateZodSchema('{"foo-bar":1}');
    expect(result.error).toBeNull();
    expect(result.output).toContain("'foo-bar': z.number(),");
  });

  it('generates a schema for a root array of objects', () => {
    const result = generateZodSchema('[{"a":1},{"a":2}]');
    expect(result.error).toBeNull();
    expect(result.output).toContain('const RootSchema = z.array(z.object({');
    expect(result.output).toContain('a: z.number(),');
  });

  it('generates a schema for a root primitive array', () => {
    const result = generateZodSchema('[1,2,3]');
    expect(result.error).toBeNull();
    expect(result.output).toBe('const RootSchema = z.array(z.number());');
  });

  it('renders an empty object schema for an empty object', () => {
    const result = generateZodSchema('{}');
    expect(result.error).toBeNull();
    expect(result.output).toBe('const RootSchema = z.object({});');
  });

  it('respects a custom root name', () => {
    const result = generateZodSchema('{"a":1}', 'Person');
    expect(result.error).toBeNull();
    expect(result.output).toContain('const PersonSchema = z.object({');
  });
});

import { describe, it, expect } from 'vitest';
import { validateJsonSchema } from '../../lib/jsonSchemaValidator';

describe('validateJsonSchema', () => {
  it('returns an error when the instance JSON is empty', () => {
    const result = validateJsonSchema('', '{"type":"string"}');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('returns an error when the schema JSON is empty', () => {
    const result = validateJsonSchema('"x"', '');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('returns an error for invalid instance JSON', () => {
    const result = validateJsonSchema('{bad json}', '{"type":"object"}');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('returns an error for invalid schema JSON', () => {
    const result = validateJsonSchema('{}', '{bad json}');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('validates a matching type', () => {
    const result = validateJsonSchema('"hello"', '{"type":"string"}');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports a type mismatch', () => {
    const result = validateJsonSchema('42', '{"type":"string"}');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].path).toBe('$');
  });

  it('validates required properties', () => {
    const schema = '{"type":"object","required":["name"]}';
    const missing = validateJsonSchema('{}', schema);
    expect(missing.valid).toBe(false);
    expect(missing.errors[0].message).toContain('name');

    const present = validateJsonSchema('{"name":"Alice"}', schema);
    expect(present.valid).toBe(true);
  });

  it('validates nested properties', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name', 'age'],
    });
    const result = validateJsonSchema('{"name":"Alice","age":"30"}', schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$.age')).toBe(true);
  });

  it('rejects additional properties when additionalProperties is false', () => {
    const schema = JSON.stringify({
      type: 'object',
      properties: { name: { type: 'string' } },
      additionalProperties: false,
    });
    const result = validateJsonSchema('{"name":"Alice","extra":1}', schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$.extra')).toBe(true);
  });

  it('validates enum values', () => {
    const schema = '{"enum":["a","b","c"]}';
    expect(validateJsonSchema('"a"', schema).valid).toBe(true);
    expect(validateJsonSchema('"z"', schema).valid).toBe(false);
  });

  it('validates const values', () => {
    const schema = '{"const":42}';
    expect(validateJsonSchema('42', schema).valid).toBe(true);
    expect(validateJsonSchema('43', schema).valid).toBe(false);
  });

  it('validates numeric bounds', () => {
    const schema = '{"type":"number","minimum":0,"maximum":10}';
    expect(validateJsonSchema('5', schema).valid).toBe(true);
    expect(validateJsonSchema('-1', schema).valid).toBe(false);
    expect(validateJsonSchema('11', schema).valid).toBe(false);
  });

  it('validates exclusive numeric bounds', () => {
    const schema = '{"type":"number","exclusiveMinimum":0,"exclusiveMaximum":10}';
    expect(validateJsonSchema('0', schema).valid).toBe(false);
    expect(validateJsonSchema('10', schema).valid).toBe(false);
    expect(validateJsonSchema('5', schema).valid).toBe(true);
  });

  it('validates string length bounds', () => {
    const schema = '{"type":"string","minLength":2,"maxLength":4}';
    expect(validateJsonSchema('"ab"', schema).valid).toBe(true);
    expect(validateJsonSchema('"a"', schema).valid).toBe(false);
    expect(validateJsonSchema('"abcde"', schema).valid).toBe(false);
  });

  it('validates a string pattern', () => {
    const schema = '{"type":"string","pattern":"^[a-z]+$"}';
    expect(validateJsonSchema('"abc"', schema).valid).toBe(true);
    expect(validateJsonSchema('"ABC"', schema).valid).toBe(false);
  });

  it('validates array items against a schema', () => {
    const schema = '{"type":"array","items":{"type":"number"}}';
    expect(validateJsonSchema('[1,2,3]', schema).valid).toBe(true);
    const result = validateJsonSchema('[1,"a",3]', schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$[1]')).toBe(true);
  });

  it('validates array length bounds', () => {
    const schema = '{"type":"array","minItems":1,"maxItems":2}';
    expect(validateJsonSchema('[]', schema).valid).toBe(false);
    expect(validateJsonSchema('[1]', schema).valid).toBe(true);
    expect(validateJsonSchema('[1,2,3]', schema).valid).toBe(false);
  });

  it('validates uniqueItems', () => {
    const schema = '{"type":"array","uniqueItems":true}';
    expect(validateJsonSchema('[1,2,3]', schema).valid).toBe(true);
    expect(validateJsonSchema('[1,2,2]', schema).valid).toBe(false);
  });

  it('validates oneOf', () => {
    const schema = '{"oneOf":[{"type":"string"},{"type":"number"}]}';
    expect(validateJsonSchema('"a"', schema).valid).toBe(true);
    expect(validateJsonSchema('1', schema).valid).toBe(true);
    expect(validateJsonSchema('true', schema).valid).toBe(false);
  });

  it('validates anyOf', () => {
    const schema = '{"anyOf":[{"minimum":10},{"maximum":0}]}';
    expect(validateJsonSchema('20', schema).valid).toBe(true);
    expect(validateJsonSchema('-5', schema).valid).toBe(true);
    expect(validateJsonSchema('5', schema).valid).toBe(false);
  });

  it('validates allOf', () => {
    const schema = '{"allOf":[{"type":"number"},{"minimum":5}]}';
    expect(validateJsonSchema('10', schema).valid).toBe(true);
    expect(validateJsonSchema('3', schema).valid).toBe(false);
  });

  it('accepts multiple types in a type array', () => {
    const schema = '{"type":["string","null"]}';
    expect(validateJsonSchema('"a"', schema).valid).toBe(true);
    expect(validateJsonSchema('null', schema).valid).toBe(true);
    expect(validateJsonSchema('1', schema).valid).toBe(false);
  });
});

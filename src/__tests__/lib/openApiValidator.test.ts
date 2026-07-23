import { describe, it, expect } from 'vitest';
import { validateOpenApi } from '../../lib/openApiValidator';

const validOpenApi3 = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Sample API', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: { '200': { description: 'OK' } },
      },
    },
    '/pets/{id}': {
      get: {
        operationId: 'getPet',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
  },
});

const validSwagger2 = JSON.stringify({
  swagger: '2.0',
  info: { title: 'Sample API', version: '1.0.0' },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: { '200': { description: 'OK' } },
      },
    },
  },
});

describe('validateOpenApi', () => {
  it('returns a parse error when the input is empty', () => {
    const result = validateOpenApi('');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('returns a parse error for invalid JSON/YAML', () => {
    const result = validateOpenApi('{ not: valid: yaml: : }');
    expect(result.valid).toBe(false);
    expect(result.parseError).not.toBeNull();
  });

  it('validates a well-formed OpenAPI 3.x document', () => {
    const result = validateOpenApi(validOpenApi3);
    expect(result.parseError).toBeNull();
    expect(result.valid).toBe(true);
    expect(result.version).toBe('3.0.0');
    expect(result.errors).toEqual([]);
  });

  it('validates a well-formed Swagger 2.0 document', () => {
    const result = validateOpenApi(validSwagger2);
    expect(result.parseError).toBeNull();
    expect(result.valid).toBe(true);
    expect(result.version).toBe('2.0');
  });

  it('accepts YAML input', () => {
    const yaml = [
      'openapi: 3.0.0',
      'info:',
      '  title: Sample API',
      '  version: 1.0.0',
      'paths:',
      '  /pets:',
      '    get:',
      '      responses:',
      "        '200':",
      '          description: OK',
    ].join('\n');
    const result = validateOpenApi(yaml);
    expect(result.parseError).toBeNull();
    expect(result.valid).toBe(true);
  });

  it('reports a missing version field', () => {
    const result = validateOpenApi(JSON.stringify({ info: { title: 'x', version: '1' }, paths: {} }));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$' && /openapi|swagger/.test(e.message))).toBe(true);
  });

  it('reports a missing info object', () => {
    const result = validateOpenApi(JSON.stringify({ openapi: '3.0.0', paths: {} }));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$.info')).toBe(true);
  });

  it('reports missing info.title and info.version', () => {
    const result = validateOpenApi(JSON.stringify({ openapi: '3.0.0', info: {}, paths: {} }));
    expect(result.errors.some(e => e.path === '$.info.title')).toBe(true);
    expect(result.errors.some(e => e.path === '$.info.version')).toBe(true);
  });

  it('reports a missing paths object', () => {
    const result = validateOpenApi(JSON.stringify({ openapi: '3.0.0', info: { title: 'x', version: '1' } }));
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.path === '$.paths')).toBe(true);
  });

  it('reports a path key that does not start with a slash', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: { pets: { get: { responses: { '200': { description: 'OK' } } } } },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => e.path === '$.paths.pets' && /must start with/.test(e.message))).toBe(true);
  });

  it('reports an operation missing responses', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: { '/pets': { get: {} } },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => e.path === '$.paths./pets.get.responses')).toBe(true);
  });

  it('reports an invalid response status code key', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: { '/pets': { get: { responses: { ok: { description: 'OK' } } } } },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => e.path === '$.paths./pets.get.responses.ok')).toBe(true);
  });

  it('reports a parameter missing name or in', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/pets/{id}': {
          get: { parameters: [{ required: true }], responses: { '200': { description: 'OK' } } },
        },
      },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => /name/.test(e.message))).toBe(true);
    expect(result.errors.some(e => /'in'/.test(e.message))).toBe(true);
  });

  it('reports a path parameter that is not marked required', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/pets/{id}': {
          get: {
            parameters: [{ name: 'id', in: 'path' }],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => /must be required/.test(e.message))).toBe(true);
  });

  it('rejects an invalid "in" value for the detected version', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/pets': {
          get: {
            parameters: [{ name: 'id', in: 'formData' }],
            responses: { '200': { description: 'OK' } },
          },
        },
      },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => /formData/.test(e.message))).toBe(true);
  });

  it('reports duplicate operationIds', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/pets': { get: { operationId: 'listPets', responses: { '200': { description: 'OK' } } } },
        '/owners': { get: { operationId: 'listPets', responses: { '200': { description: 'OK' } } } },
      },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.errors.some(e => /Duplicate operationId/.test(e.message))).toBe(true);
  });

  it('allows an empty paths object', () => {
    const doc = { openapi: '3.0.0', info: { title: 'x', version: '1' }, paths: {} };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.valid).toBe(true);
  });

  it('ignores non-operation keys within a path item', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: 'x', version: '1' },
      paths: {
        '/pets': {
          summary: 'Pet operations',
          parameters: [],
          get: { responses: { '200': { description: 'OK' } } },
        },
      },
    };
    const result = validateOpenApi(JSON.stringify(doc));
    expect(result.valid).toBe(true);
  });
});

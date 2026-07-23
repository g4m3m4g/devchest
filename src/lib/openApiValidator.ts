import { load } from 'js-yaml';

export interface ValidationError {
  path: string;
  message: string;
}

export interface OpenApiValidationResult {
  valid: boolean;
  version: string | null;
  errors: ValidationError[];
  parseError: string | null;
}

const OPENAPI_3_PARAM_LOCATIONS = ['query', 'header', 'path', 'cookie'];
const SWAGGER_2_PARAM_LOCATIONS = ['query', 'header', 'path', 'body', 'formData'];
const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const RESPONSE_KEY_PATTERN = /^([1-5][0-9]{2}|default)$/;

export function validateOpenApi(input: string): OpenApiValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { valid: false, version: null, errors: [], parseError: 'Input is empty' };
  }

  let doc: unknown;
  try {
    doc = trimmed.startsWith('{') || trimmed.startsWith('[') ? JSON.parse(trimmed) : load(trimmed);
  } catch (e) {
    return { valid: false, version: null, errors: [], parseError: (e as Error).message };
  }

  if (!isPlainObject(doc)) {
    return {
      valid: false,
      version: null,
      errors: [{ path: '$', message: 'Root must be an object' }],
      parseError: null,
    };
  }

  const errors: ValidationError[] = [];
  const version = detectVersion(doc);
  const paramLocations = version === '2.0' ? SWAGGER_2_PARAM_LOCATIONS : OPENAPI_3_PARAM_LOCATIONS;

  if (version === null) {
    errors.push({ path: '$', message: "Missing required field: 'openapi' (3.x) or 'swagger: \"2.0\"'" });
  }

  validateInfo(doc.info, errors);
  validateParameters(doc.parameters, '$.parameters', paramLocations, errors);
  validatePaths(doc.paths, paramLocations, errors);

  return { valid: errors.length === 0, version, errors, parseError: null };
}

function detectVersion(doc: Record<string, unknown>): string | null {
  if (typeof doc.openapi === 'string' && doc.openapi.startsWith('3.')) return doc.openapi;
  if (typeof doc.swagger === 'string' && doc.swagger === '2.0') return '2.0';
  return null;
}

function validateInfo(info: unknown, errors: ValidationError[]): void {
  if (!isPlainObject(info)) {
    errors.push({ path: '$.info', message: "Missing required object 'info'" });
    return;
  }
  if (typeof info.title !== 'string') {
    errors.push({ path: '$.info.title', message: "Missing required string 'info.title'" });
  }
  if (typeof info.version !== 'string') {
    errors.push({ path: '$.info.version', message: "Missing required string 'info.version'" });
  }
}

function validatePaths(paths: unknown, paramLocations: string[], errors: ValidationError[]): void {
  if (!isPlainObject(paths)) {
    errors.push({ path: '$.paths', message: "Missing required object 'paths'" });
    return;
  }

  const operationIds = new Map<string, string[]>();

  for (const [pathKey, pathItem] of Object.entries(paths)) {
    const pathPath = `$.paths.${pathKey}`;
    if (!pathKey.startsWith('/')) {
      errors.push({ path: pathPath, message: `Path key '${pathKey}' must start with '/'` });
      continue;
    }
    if (!isPlainObject(pathItem)) {
      errors.push({ path: pathPath, message: 'Path item must be an object' });
      continue;
    }

    if ('parameters' in pathItem) {
      validateParameters(pathItem.parameters, `${pathPath}.parameters`, paramLocations, errors);
    }

    for (const [key, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.includes(key)) continue;
      const opPath = `${pathPath}.${key}`;

      if (!isPlainObject(operation)) {
        errors.push({ path: opPath, message: 'Operation must be an object' });
        continue;
      }

      if ('operationId' in operation) {
        if (typeof operation.operationId !== 'string') {
          errors.push({ path: `${opPath}.operationId`, message: "'operationId' must be a string" });
        } else {
          const existing = operationIds.get(operation.operationId) ?? [];
          existing.push(opPath);
          operationIds.set(operation.operationId, existing);
        }
      }

      validateResponses(operation.responses, `${opPath}.responses`, errors);

      if ('parameters' in operation) {
        validateParameters(operation.parameters, `${opPath}.parameters`, paramLocations, errors);
      }
    }
  }

  for (const [operationId, locations] of operationIds) {
    if (locations.length > 1) {
      for (const loc of locations) {
        errors.push({ path: `${loc}.operationId`, message: `Duplicate operationId '${operationId}'` });
      }
    }
  }
}

function validateResponses(responses: unknown, path: string, errors: ValidationError[]): void {
  if (!isPlainObject(responses) || Object.keys(responses).length === 0) {
    errors.push({ path, message: "Missing required non-empty object 'responses'" });
    return;
  }
  for (const statusKey of Object.keys(responses)) {
    if (!RESPONSE_KEY_PATTERN.test(statusKey)) {
      errors.push({ path: `${path}.${statusKey}`, message: `Invalid response status code '${statusKey}'` });
    }
  }
}

function validateParameters(
  parameters: unknown,
  path: string,
  paramLocations: string[],
  errors: ValidationError[],
): void {
  if (parameters === undefined) return;
  if (!Array.isArray(parameters)) {
    errors.push({ path, message: "'parameters' must be an array" });
    return;
  }

  parameters.forEach((param, i) => {
    const paramPath = `${path}[${i}]`;
    if (!isPlainObject(param)) {
      errors.push({ path: paramPath, message: 'Parameter must be an object' });
      return;
    }
    if ('$ref' in param) return;

    if (typeof param.name !== 'string' || param.name === '') {
      errors.push({ path: paramPath, message: "Parameter is missing required string 'name'" });
    }
    if (typeof param.in !== 'string') {
      errors.push({ path: paramPath, message: "Parameter is missing required string 'in'" });
    } else if (!paramLocations.includes(param.in)) {
      errors.push({
        path: paramPath,
        message: `Parameter 'in' value '${param.in}' is not valid (expected one of: ${paramLocations.join(', ')})`,
      });
    } else if (param.in === 'path' && param.required !== true) {
      errors.push({ path: paramPath, message: "Path parameters must be required (set 'required: true')" });
    }
  });
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

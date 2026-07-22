export interface ValidationError {
  path: string;
  message: string;
}

export interface JsonSchemaValidationResult {
  valid: boolean;
  errors: ValidationError[];
  parseError: string | null;
}

export function validateJsonSchema(instanceInput: string, schemaInput: string): JsonSchemaValidationResult {
  const instanceTrimmed = instanceInput.trim();
  const schemaTrimmed = schemaInput.trim();

  if (!instanceTrimmed) return { valid: false, errors: [], parseError: 'Instance JSON is empty' };
  if (!schemaTrimmed) return { valid: false, errors: [], parseError: 'Schema JSON is empty' };

  let instance: unknown;
  try {
    instance = JSON.parse(instanceTrimmed);
  } catch (e) {
    return { valid: false, errors: [], parseError: `Instance JSON: ${(e as Error).message}` };
  }

  let schema: unknown;
  try {
    schema = JSON.parse(schemaTrimmed);
  } catch (e) {
    return { valid: false, errors: [], parseError: `Schema JSON: ${(e as Error).message}` };
  }

  const errors: ValidationError[] = [];
  if (isPlainObject(schema)) {
    validateNode(instance, schema, '$', errors);
  }

  return { valid: errors.length === 0, errors, parseError: null };
}

function validateNode(value: unknown, schema: Record<string, unknown>, path: string, errors: ValidationError[]): void {
  if ('type' in schema) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    const matches = (types as string[]).some(t => matchesType(value, t));
    if (!matches) {
      errors.push({ path, message: `Expected type ${(types as string[]).join(' | ')} but got ${typeOf(value)}` });
    }
  }

  if ('enum' in schema) {
    const options = schema.enum as unknown[];
    if (!options.some(o => deepEqual(o, value))) {
      errors.push({ path, message: `Value must be one of: ${options.map(o => JSON.stringify(o)).join(', ')}` });
    }
  }

  if ('const' in schema) {
    if (!deepEqual(schema.const, value)) {
      errors.push({ path, message: `Value must equal ${JSON.stringify(schema.const)}` });
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      errors.push({ path, message: `Value must be >= ${schema.minimum}` });
    }
    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      errors.push({ path, message: `Value must be <= ${schema.maximum}` });
    }
    if (typeof schema.exclusiveMinimum === 'number' && value <= schema.exclusiveMinimum) {
      errors.push({ path, message: `Value must be > ${schema.exclusiveMinimum}` });
    }
    if (typeof schema.exclusiveMaximum === 'number' && value >= schema.exclusiveMaximum) {
      errors.push({ path, message: `Value must be < ${schema.exclusiveMaximum}` });
    }
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push({ path, message: `String must be at least ${schema.minLength} characters` });
    }
    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      errors.push({ path, message: `String must be at most ${schema.maxLength} characters` });
    }
    if (typeof schema.pattern === 'string') {
      if (!new RegExp(schema.pattern).test(value)) {
        errors.push({ path, message: `String must match pattern ${schema.pattern}` });
      }
    }
  }

  if (Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push({ path, message: `Array must have at least ${schema.minItems} items` });
    }
    if (typeof schema.maxItems === 'number' && value.length > schema.maxItems) {
      errors.push({ path, message: `Array must have at most ${schema.maxItems} items` });
    }
    if (schema.uniqueItems === true) {
      const seen: unknown[] = [];
      for (const item of value) {
        if (seen.some(s => deepEqual(s, item))) {
          errors.push({ path, message: 'Array items must be unique' });
          break;
        }
        seen.push(item);
      }
    }
    if (isPlainObject(schema.items)) {
      value.forEach((item, i) => validateNode(item, schema.items as Record<string, unknown>, `${path}[${i}]`, errors));
    }
  }

  if (isPlainObject(value)) {
    if (Array.isArray(schema.required)) {
      for (const key of schema.required as string[]) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push({ path, message: `Missing required property '${key}'` });
        }
      }
    }

    const propsSchema = isPlainObject(schema.properties) ? (schema.properties as Record<string, unknown>) : {};
    for (const [key, propSchema] of Object.entries(propsSchema)) {
      if (Object.prototype.hasOwnProperty.call(value, key) && isPlainObject(propSchema)) {
        validateNode(value[key], propSchema, `${path}.${key}`, errors);
      }
    }

    if (schema.additionalProperties === false) {
      const allowedKeys = new Set(Object.keys(propsSchema));
      for (const key of Object.keys(value)) {
        if (!allowedKeys.has(key)) {
          errors.push({ path: `${path}.${key}`, message: `Additional property '${key}' is not allowed` });
        }
      }
    }
  }

  if (Array.isArray(schema.oneOf)) {
    const matchingCount = (schema.oneOf as Record<string, unknown>[]).filter(s => isValidAgainst(value, s)).length;
    if (matchingCount !== 1) {
      errors.push({ path, message: `Value must match exactly one schema in oneOf (matched ${matchingCount})` });
    }
  }

  if (Array.isArray(schema.anyOf)) {
    const anyMatches = (schema.anyOf as Record<string, unknown>[]).some(s => isValidAgainst(value, s));
    if (!anyMatches) {
      errors.push({ path, message: 'Value must match at least one schema in anyOf' });
    }
  }

  if (Array.isArray(schema.allOf)) {
    for (const sub of schema.allOf as Record<string, unknown>[]) {
      validateNode(value, sub, path, errors);
    }
  }
}

function isValidAgainst(value: unknown, schema: Record<string, unknown>): boolean {
  const subErrors: ValidationError[] = [];
  validateNode(value, schema, '$', subErrors);
  return subErrors.length === 0;
}

function matchesType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return isPlainObject(value);
    case 'array':
      return Array.isArray(value);
    case 'null':
      return value === null;
    default:
      return true;
  }
}

function typeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

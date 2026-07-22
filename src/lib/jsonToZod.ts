export interface JsonToZodResult {
  output: string;
  error: string | null;
}

export function generateZodSchema(jsonInput: string, rootName = 'Root'): JsonToZodResult {
  const trimmed = jsonInput.trim();
  if (!trimmed) return { output: '', error: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }

  const expr = valueToZodExpr(parsed, 0);
  const name = `${rootName.trim() || 'Root'}Schema`;
  return { output: `const ${name} = ${expr};`, error: null };
}

function valueToZodExpr(value: unknown, indent: number): string {
  if (value === null) return 'z.null()';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'z.array(z.unknown())';

    if (value.every(isPlainObject)) {
      return `z.array(${objectToZodExpr(value as Record<string, unknown>[], indent)})`;
    }

    const exprs = Array.from(new Set(value.map(v => valueToZodExpr(v, indent))));
    const elementExpr = exprs.length === 1 ? exprs[0] : `z.union([${exprs.join(', ')}])`;
    return `z.array(${elementExpr})`;
  }

  if (isPlainObject(value)) {
    return objectToZodExpr([value], indent);
  }

  const t = typeof value;
  if (t === 'string') return 'z.string()';
  if (t === 'number') return 'z.number()';
  if (t === 'boolean') return 'z.boolean()';
  return 'z.unknown()';
}

function objectToZodExpr(objects: Record<string, unknown>[], indent: number): string {
  const allKeys: string[] = [];
  const seenKeys = new Set<string>();
  for (const obj of objects) {
    for (const key of Object.keys(obj)) {
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        allKeys.push(key);
      }
    }
  }

  if (allKeys.length === 0) return 'z.object({})';

  const innerIndent = '  '.repeat(indent + 1);
  const closingIndent = '  '.repeat(indent);

  const lines = allKeys.map(key => {
    const owners = objects.filter(o => Object.prototype.hasOwnProperty.call(o, key));
    const optional = owners.length < objects.length;
    const valueExprs = Array.from(new Set(owners.map(o => valueToZodExpr(o[key], indent + 1))));
    let expr = valueExprs.length === 1 ? valueExprs[0] : `z.union([${valueExprs.join(', ')}])`;
    if (optional) expr += '.optional()';
    const keyStr = isValidIdentifier(key) ? key : `'${key}'`;
    return `${innerIndent}${keyStr}: ${expr},`;
  });

  return `z.object({\n${lines.join('\n')}\n${closingIndent}})`;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidIdentifier(key: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

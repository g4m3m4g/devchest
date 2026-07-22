export interface JsonToTsResult {
  output: string;
  error: string | null;
}

interface ObjectTypeInfo {
  name: string;
  fields: { key: string; typeStr: string; optional: boolean }[];
}

export function generateTypeScriptInterfaces(jsonInput: string, rootName = 'Root'): JsonToTsResult {
  const trimmed = jsonInput.trim();
  if (!trimmed) return { output: '', error: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    return { output: '', error: (e as Error).message };
  }

  const interfaces: ObjectTypeInfo[] = [];
  const usedNames = new Set<string>();

  const rootTypeStr = toTypeString(parsed, rootName, interfaces, usedNames);
  const blocks = interfaces.map(renderInterface);

  if (!isPlainObject(parsed)) {
    blocks.push(`type ${rootName} = ${rootTypeStr};`);
  }

  return { output: blocks.join('\n\n'), error: null };
}

function toTypeString(
  value: unknown,
  nameHint: string,
  interfaces: ObjectTypeInfo[],
  usedNames: Set<string>,
): string {
  if (value === null) return 'null';

  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';

    if (value.every(isPlainObject)) {
      const elementName = arrayElementName(nameHint);
      const typeStr = objectsToInterface(value as Record<string, unknown>[], elementName, interfaces, usedNames);
      return `${typeStr}[]`;
    }

    const elementTypeStrs = value.map(v => toTypeString(v, singularize(nameHint), interfaces, usedNames));
    const uniqueTypes = Array.from(new Set(elementTypeStrs));
    const elementType = uniqueTypes.length === 1 ? uniqueTypes[0] : `(${uniqueTypes.join(' | ')})`;
    return `${elementType}[]`;
  }

  if (isPlainObject(value)) {
    return objectsToInterface([value], toPascalCase(nameHint), interfaces, usedNames);
  }

  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  return 'unknown';
}

function objectsToInterface(
  objects: Record<string, unknown>[],
  nameHint: string,
  interfaces: ObjectTypeInfo[],
  usedNames: Set<string>,
): string {
  const name = uniqueName(nameHint, usedNames);

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

  const fields = allKeys.map(key => {
    const owners = objects.filter(o => Object.prototype.hasOwnProperty.call(o, key));
    const optional = owners.length < objects.length;
    const typeStrs = Array.from(new Set(owners.map(o => toTypeString(o[key], key, interfaces, usedNames))));
    const typeStr = typeStrs.join(' | ');
    return { key, typeStr, optional };
  });

  interfaces.push({ name, fields });
  return name;
}

function renderInterface(info: ObjectTypeInfo): string {
  if (info.fields.length === 0) return `interface ${info.name} {}`;
  const lines = info.fields.map(f => {
    const key = isValidIdentifier(f.key) ? f.key : `'${f.key}'`;
    return `  ${key}${f.optional ? '?' : ''}: ${f.typeStr};`;
  });
  return `interface ${info.name} {\n${lines.join('\n')}\n}`;
}

function uniqueName(base: string, usedNames: Set<string>): string {
  const root = base || 'Field';
  let candidate = root;
  let i = 2;
  while (usedNames.has(candidate)) {
    candidate = `${root}${i}`;
    i++;
  }
  usedNames.add(candidate);
  return candidate;
}

function toPascalCase(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  if (!cleaned) return 'Field';
  return cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function arrayElementName(nameHint: string): string {
  const singular = singularize(nameHint);
  if (singular !== nameHint) return toPascalCase(singular);
  return `${toPascalCase(nameHint)}Item`;
}

function singularize(name: string): string {
  if (/ies$/i.test(name)) return name.replace(/ies$/i, 'y');
  if (/ses$/i.test(name)) return name.replace(/es$/i, '');
  if (/s$/i.test(name) && !/ss$/i.test(name)) return name.replace(/s$/i, '');
  return name;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isValidIdentifier(key: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key);
}

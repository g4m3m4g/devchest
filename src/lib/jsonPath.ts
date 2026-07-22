export interface JsonPathResult {
  matches: unknown[];
  error: string | null;
}

type Segment =
  | { type: 'prop'; name: string }
  | { type: 'wildcard' }
  | { type: 'index'; index: number }
  | { type: 'slice'; start: number | null; end: number | null }
  | { type: 'recursive' }
  | { type: 'filter'; field: string; op: string; value: unknown };

export function evaluateJsonPath(jsonInput: string, path: string): JsonPathResult {
  const trimmedJson = jsonInput.trim();
  if (!trimmedJson) return { matches: [], error: 'JSON input is empty' };

  let data: unknown;
  try {
    data = JSON.parse(trimmedJson);
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }

  const trimmedPath = path.trim();
  if (!trimmedPath) return { matches: [], error: 'Path is empty' };

  let segments: Segment[];
  try {
    segments = parsePath(trimmedPath);
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }

  let current: unknown[] = [data];
  for (const seg of segments) {
    current = applySegment(current, seg);
  }

  return { matches: current, error: null };
}

function parsePath(path: string): Segment[] {
  if (path[0] !== '$') throw new Error('Path must start with $');
  const segments: Segment[] = [];
  let i = 1;

  while (i < path.length) {
    if (path[i] === '.') {
      if (path[i + 1] === '.') {
        segments.push({ type: 'recursive' });
        i += 2;
      } else {
        i += 1;
      }

      if (path[i] === '*') {
        segments.push({ type: 'wildcard' });
        i += 1;
      } else if (path[i] === '[' || path[i] === undefined) {
        // bracket or trailing recursive descent handled by the outer loop
      } else {
        const { name, next } = readIdentifier(path, i);
        segments.push({ type: 'prop', name });
        i = next;
      }
      continue;
    }

    if (path[i] === '[') {
      const close = path.indexOf(']', i);
      if (close === -1) throw new Error('Unterminated [ in path');
      const inner = path.slice(i + 1, close);
      segments.push(parseBracket(inner));
      i = close + 1;
      continue;
    }

    throw new Error(`Unexpected character '${path[i]}' in path at position ${i}`);
  }

  return segments;
}

function readIdentifier(path: string, start: number): { name: string; next: number } {
  let j = start;
  while (j < path.length && /[A-Za-z0-9_$]/.test(path[j])) j += 1;
  if (j === start) throw new Error(`Expected identifier at position ${start}`);
  return { name: path.slice(start, j), next: j };
}

function parseBracket(inner: string): Segment {
  const trimmed = inner.trim();

  if (trimmed === '*') return { type: 'wildcard' };

  if (trimmed.startsWith('?(') && trimmed.endsWith(')')) {
    return parseFilter(trimmed.slice(2, -1));
  }

  if (/^'.*'$/.test(trimmed) || /^".*"$/.test(trimmed)) {
    return { type: 'prop', name: trimmed.slice(1, -1) };
  }

  if (/^-?\d+$/.test(trimmed)) {
    return { type: 'index', index: Number(trimmed) };
  }

  if (trimmed.includes(':')) {
    const [startStr, endStr] = trimmed.split(':');
    const start = startStr.trim() === '' ? null : Number(startStr);
    const end = endStr.trim() === '' ? null : Number(endStr);
    return { type: 'slice', start, end };
  }

  throw new Error(`Unsupported bracket expression: [${inner}]`);
}

function parseFilter(expr: string): Segment {
  const match = expr.trim().match(/^@\.([A-Za-z0-9_$]+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
  if (!match) throw new Error(`Unsupported filter expression: ${expr}`);
  const [, field, op, rawValue] = match;
  const value = parseFilterValue(rawValue.trim());
  return { type: 'filter', field, op, value };
}

function parseFilterValue(raw: string): unknown {
  if (/^'.*'$/.test(raw) || /^".*"$/.test(raw)) return raw.slice(1, -1);
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  const num = Number(raw);
  if (!Number.isNaN(num)) return num;
  throw new Error(`Unsupported filter value: ${raw}`);
}

function applySegment(current: unknown[], seg: Segment): unknown[] {
  switch (seg.type) {
    case 'prop':
      return current.flatMap(node => {
        if (isPlainObject(node) && Object.prototype.hasOwnProperty.call(node, seg.name)) {
          return [node[seg.name]];
        }
        return [];
      });

    case 'wildcard':
      return current.flatMap(node => {
        if (Array.isArray(node)) return node;
        if (isPlainObject(node)) return Object.values(node);
        return [];
      });

    case 'index':
      return current.flatMap(node => {
        if (!Array.isArray(node)) return [];
        const idx = seg.index < 0 ? node.length + seg.index : seg.index;
        return idx >= 0 && idx < node.length ? [node[idx]] : [];
      });

    case 'slice':
      return current.flatMap(node => {
        if (!Array.isArray(node)) return [];
        const start = seg.start ?? 0;
        const end = seg.end ?? node.length;
        return node.slice(start, end);
      });

    case 'recursive':
      return current.flatMap(node => collectDescendants(node));

    case 'filter':
      return current.flatMap(node => {
        if (!Array.isArray(node)) return [];
        return node.filter(item => matchesFilter(item, seg));
      });

    default:
      return current;
  }
}

function collectDescendants(node: unknown): unknown[] {
  const result: unknown[] = [node];
  if (Array.isArray(node)) {
    for (const item of node) result.push(...collectDescendants(item));
  } else if (isPlainObject(node)) {
    for (const value of Object.values(node)) result.push(...collectDescendants(value));
  }
  return result;
}

function matchesFilter(item: unknown, seg: Extract<Segment, { type: 'filter' }>): boolean {
  if (!isPlainObject(item) || !(seg.field in item)) return false;
  const actual = item[seg.field];
  switch (seg.op) {
    case '==':
      return actual === seg.value;
    case '!=':
      return actual !== seg.value;
    case '<':
      return (actual as number) < (seg.value as number);
    case '>':
      return (actual as number) > (seg.value as number);
    case '<=':
      return (actual as number) <= (seg.value as number);
    case '>=':
      return (actual as number) >= (seg.value as number);
    default:
      return false;
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  index: number;
  timestamp: string | null;
  level: LogLevel | null;
  message: string | null;
  fields: Record<string, unknown>;
  raw: string;
  parseError: boolean;
}

export interface LogFormatOptions {
  minLevel: LogLevel | 'all';
  showMeta: boolean;
}

export interface LogFormatResult {
  entries: LogEntry[];
  visibleEntries: LogEntry[];
  output: string;
  error: string | null;
}

const TIMESTAMP_FIELDS = ['time', 'timestamp', 'ts', '@timestamp', 'datetime', 'date'];
const LEVEL_FIELDS = ['level', 'severity', 'lvl', 'log_level'];
const MESSAGE_FIELDS = ['msg', 'message', 'event', 'text'];

const NUMERIC_LEVELS: Partial<Record<number, LogLevel>> = {
  10: 'trace', 20: 'debug', 30: 'info', 40: 'warn', 50: 'error', 60: 'fatal',
};

const LEVEL_ALIASES: Record<string, LogLevel> = {
  trace: 'trace',
  debug: 'debug', verbose: 'debug', dbg: 'debug',
  info: 'info', information: 'info', informational: 'info',
  warn: 'warn', warning: 'warn',
  error: 'error', err: 'error',
  fatal: 'fatal', critical: 'fatal', crit: 'fatal',
};

export const LEVEL_ORDER: Record<LogLevel | 'all', number> = {
  all: 0, trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60,
};

const CORE_FIELDS = new Set([...TIMESTAMP_FIELDS, ...LEVEL_FIELDS, ...MESSAGE_FIELDS]);

function normalizeTimestamp(val: unknown): string | null {
  if (typeof val === 'number' && Number.isFinite(val)) {
    const ms = val > 1e12 ? val : val * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof val === 'string' && val.trim()) return val.trim();
  return null;
}

function normalizeLevel(val: unknown): LogLevel | null {
  if (typeof val === 'number') return NUMERIC_LEVELS[val] ?? null;
  if (typeof val === 'string') return LEVEL_ALIASES[val.toLowerCase()] ?? null;
  return null;
}

function parseEntry(line: string, index: number): LogEntry {
  const raw = line.trim();

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { index, timestamp: null, level: null, message: raw, fields: {}, raw, parseError: true };
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    const message = typeof json === 'string' ? json : JSON.stringify(json);
    return { index, timestamp: null, level: null, message, fields: {}, raw, parseError: true };
  }

  const obj = json as Record<string, unknown>;

  let timestamp: string | null = null;
  for (const f of TIMESTAMP_FIELDS) {
    if (f in obj) { timestamp = normalizeTimestamp(obj[f]); break; }
  }

  let level: LogLevel | null = null;
  for (const f of LEVEL_FIELDS) {
    if (f in obj) { level = normalizeLevel(obj[f]); break; }
  }

  let message: string | null = null;
  for (const f of MESSAGE_FIELDS) {
    if (f in obj) {
      const v = obj[f];
      message = typeof v === 'string' ? v : JSON.stringify(v);
      break;
    }
  }

  const fields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!CORE_FIELDS.has(k)) fields[k] = v;
  }

  return { index, timestamp, level, message, fields, raw, parseError: false };
}

function entryToText(entry: LogEntry, showMeta: boolean): string {
  if (entry.parseError) {
    return `[PARSE ERROR] ${entry.message ?? entry.raw}`;
  }

  const ts = entry.timestamp ?? 'no-timestamp';
  const lvl = (entry.level ?? 'unknown').toUpperCase().padEnd(5);
  const msg = entry.message ?? '(no message)';
  const header = `[${ts}] ${lvl} ${msg}`;

  if (!showMeta || Object.keys(entry.fields).length === 0) return header;

  const metaLines = Object.entries(entry.fields).map(
    ([k, v]) => `  ${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`,
  );
  return [header, ...metaLines].join('\n');
}

export function formatLogEntries(input: string, options: LogFormatOptions): LogFormatResult {
  const trimmed = input.trim();
  if (!trimmed) return { entries: [], visibleEntries: [], output: '', error: null };

  const lines = trimmed.split('\n').filter(l => l.trim());
  const entries = lines.map((l, i) => parseEntry(l, i));

  const minOrder = LEVEL_ORDER[options.minLevel] ?? 0;
  const visibleEntries = entries.filter(e => {
    if (e.parseError) return true;
    if (!e.level) return true;
    return LEVEL_ORDER[e.level] >= minOrder;
  });

  const output = visibleEntries.map(e => entryToText(e, options.showMeta)).join('\n');

  return { entries, visibleEntries, output, error: null };
}

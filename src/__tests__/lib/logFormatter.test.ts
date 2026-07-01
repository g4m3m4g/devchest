import { describe, it, expect } from 'vitest';
import { formatLogEntries } from '../../lib/logFormatter';

const DEFAULT = { minLevel: 'all' as const, showMeta: true };

// ── helpers ────────────────────────────────────────────────────────────────
const line = (obj: object) => JSON.stringify(obj);

describe('formatLogEntries', () => {
  // ── empty / whitespace ──────────────────────────────────────────────────
  it('returns empty result for empty input', () => {
    const r = formatLogEntries('', DEFAULT);
    expect(r.entries).toHaveLength(0);
    expect(r.visibleEntries).toHaveLength(0);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('returns empty result for whitespace-only input', () => {
    const r = formatLogEntries('   \n  ', DEFAULT);
    expect(r.entries).toHaveLength(0);
    expect(r.output).toBe('');
  });

  // ── single entry parsing ────────────────────────────────────────────────
  it('parses a single JSON log line', () => {
    const r = formatLogEntries(line({ level: 'info', msg: 'hello' }), DEFAULT);
    expect(r.error).toBeNull();
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].parseError).toBe(false);
  });

  it('marks invalid JSON lines as parse errors', () => {
    const r = formatLogEntries('not json at all', DEFAULT);
    expect(r.entries).toHaveLength(1);
    expect(r.entries[0].parseError).toBe(true);
  });

  it('marks JSON arrays as parse errors', () => {
    const r = formatLogEntries('[1,2,3]', DEFAULT);
    expect(r.entries[0].parseError).toBe(true);
  });

  it('marks JSON primitives as parse errors', () => {
    const r = formatLogEntries('"just a string"', DEFAULT);
    expect(r.entries[0].parseError).toBe(true);
  });

  // ── multiple entries ────────────────────────────────────────────────────
  it('parses multiple NDJSON lines', () => {
    const input = [
      line({ level: 'info', msg: 'a' }),
      line({ level: 'warn', msg: 'b' }),
      line({ level: 'error', msg: 'c' }),
    ].join('\n');
    const r = formatLogEntries(input, DEFAULT);
    expect(r.entries).toHaveLength(3);
  });

  it('skips blank lines between entries', () => {
    const input = line({ msg: 'a' }) + '\n\n' + line({ msg: 'b' });
    const r = formatLogEntries(input, DEFAULT);
    expect(r.entries).toHaveLength(2);
  });

  it('handles a mix of valid and invalid lines', () => {
    const input = line({ msg: 'good' }) + '\nbad json\n' + line({ msg: 'good2' });
    const r = formatLogEntries(input, DEFAULT);
    expect(r.entries).toHaveLength(3);
    expect(r.entries[0].parseError).toBe(false);
    expect(r.entries[1].parseError).toBe(true);
    expect(r.entries[2].parseError).toBe(false);
  });

  it('assigns sequential index to entries', () => {
    const input = [line({ msg: 'a' }), line({ msg: 'b' })].join('\n');
    const r = formatLogEntries(input, DEFAULT);
    expect(r.entries[0].index).toBe(0);
    expect(r.entries[1].index).toBe(1);
  });

  // ── timestamp extraction ────────────────────────────────────────────────
  it('extracts timestamp from "time" field (pino)', () => {
    const r = formatLogEntries(line({ time: 1640995200000, msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).not.toBeNull();
    expect(r.entries[0].timestamp).toContain('2022');
  });

  it('extracts timestamp from "timestamp" field (winston)', () => {
    const r = formatLogEntries(line({ timestamp: '2022-01-01T00:00:00.000Z', msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).toBe('2022-01-01T00:00:00.000Z');
  });

  it('extracts timestamp from "ts" field', () => {
    const r = formatLogEntries(line({ ts: '2022-01-01T00:00:00Z', msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).toBe('2022-01-01T00:00:00Z');
  });

  it('extracts timestamp from "@timestamp" field (ECS / Elasticsearch)', () => {
    const r = formatLogEntries(line({ '@timestamp': '2022-01-01T00:00:00.000Z', msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).toBe('2022-01-01T00:00:00.000Z');
  });

  it('converts unix-millisecond timestamp number to ISO string', () => {
    const r = formatLogEntries(line({ time: 1640995200000, msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).toBe('2022-01-01T00:00:00.000Z');
  });

  it('converts unix-seconds timestamp number to ISO string', () => {
    const r = formatLogEntries(line({ time: 1640995200, msg: 'x' }), DEFAULT);
    expect(r.entries[0].timestamp).not.toBeNull();
    expect(r.entries[0].timestamp).toContain('2022');
  });

  it('returns null timestamp when no timestamp field present', () => {
    const r = formatLogEntries(line({ msg: 'no timestamp' }), DEFAULT);
    expect(r.entries[0].timestamp).toBeNull();
  });

  // ── level extraction ────────────────────────────────────────────────────
  it('extracts level from "level" field as string', () => {
    const r = formatLogEntries(line({ level: 'info', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('info');
  });

  it('extracts level from "severity" field (GCP Cloud Logging)', () => {
    const r = formatLogEntries(line({ severity: 'ERROR', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('error');
  });

  it('extracts level from "lvl" field', () => {
    const r = formatLogEntries(line({ lvl: 'warn', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('warn');
  });

  it('normalizes pino numeric level 30 to info', () => {
    const r = formatLogEntries(line({ level: 30, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('info');
  });

  it('normalizes pino numeric level 10 to trace', () => {
    const r = formatLogEntries(line({ level: 10, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('trace');
  });

  it('normalizes pino numeric level 20 to debug', () => {
    const r = formatLogEntries(line({ level: 20, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('debug');
  });

  it('normalizes pino numeric level 40 to warn', () => {
    const r = formatLogEntries(line({ level: 40, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('warn');
  });

  it('normalizes pino numeric level 50 to error', () => {
    const r = formatLogEntries(line({ level: 50, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('error');
  });

  it('normalizes pino numeric level 60 to fatal', () => {
    const r = formatLogEntries(line({ level: 60, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('fatal');
  });

  it('normalizes "warning" to warn', () => {
    const r = formatLogEntries(line({ level: 'warning', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('warn');
  });

  it('normalizes "critical" to fatal', () => {
    const r = formatLogEntries(line({ level: 'critical', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('fatal');
  });

  it('normalizes case-insensitive level strings', () => {
    const r = formatLogEntries(line({ level: 'INFO', msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBe('info');
  });

  it('returns null level when no level field present', () => {
    const r = formatLogEntries(line({ msg: 'no level' }), DEFAULT);
    expect(r.entries[0].level).toBeNull();
  });

  it('returns null level for unrecognized numeric level', () => {
    const r = formatLogEntries(line({ level: 35, msg: 'x' }), DEFAULT);
    expect(r.entries[0].level).toBeNull();
  });

  // ── message extraction ──────────────────────────────────────────────────
  it('extracts message from "msg" field (pino / bunyan)', () => {
    const r = formatLogEntries(line({ msg: 'hello world' }), DEFAULT);
    expect(r.entries[0].message).toBe('hello world');
  });

  it('extracts message from "message" field (winston)', () => {
    const r = formatLogEntries(line({ message: 'hello winston' }), DEFAULT);
    expect(r.entries[0].message).toBe('hello winston');
  });

  it('extracts message from "event" field (structlog)', () => {
    const r = formatLogEntries(line({ event: 'user.login' }), DEFAULT);
    expect(r.entries[0].message).toBe('user.login');
  });

  it('returns null message when no message field present', () => {
    const r = formatLogEntries(line({ level: 'info' }), DEFAULT);
    expect(r.entries[0].message).toBeNull();
  });

  // ── extra fields ────────────────────────────────────────────────────────
  it('collects extra fields into fields object', () => {
    const r = formatLogEntries(line({ level: 'info', msg: 'x', pid: 1234, hostname: 'srv' }), DEFAULT);
    expect(r.entries[0].fields).toEqual({ pid: 1234, hostname: 'srv' });
  });

  it('excludes timestamp/level/message fields from fields', () => {
    const r = formatLogEntries(
      line({ time: 1640995200000, level: 'info', msg: 'x', extra: 'val' }),
      DEFAULT,
    );
    expect(r.entries[0].fields).toEqual({ extra: 'val' });
    expect(r.entries[0].fields).not.toHaveProperty('time');
    expect(r.entries[0].fields).not.toHaveProperty('level');
    expect(r.entries[0].fields).not.toHaveProperty('msg');
  });

  it('handles entries with no extra fields', () => {
    const r = formatLogEntries(line({ level: 'info', msg: 'x' }), DEFAULT);
    expect(r.entries[0].fields).toEqual({});
  });

  // ── minLevel filtering ──────────────────────────────────────────────────
  it('shows all entries when minLevel is "all"', () => {
    const input = [
      line({ level: 'trace', msg: 'a' }),
      line({ level: 'debug', msg: 'b' }),
      line({ level: 'info', msg: 'c' }),
    ].join('\n');
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'all' });
    expect(r.visibleEntries).toHaveLength(3);
  });

  it('filters out entries below minLevel', () => {
    const input = [
      line({ level: 'debug', msg: 'debug' }),
      line({ level: 'info', msg: 'info' }),
      line({ level: 'warn', msg: 'warn' }),
    ].join('\n');
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'warn' });
    expect(r.visibleEntries).toHaveLength(1);
    expect(r.visibleEntries[0].message).toBe('warn');
  });

  it('includes fatal entries when minLevel is "error"', () => {
    const input = [
      line({ level: 'error', msg: 'err' }),
      line({ level: 'fatal', msg: 'fatal' }),
    ].join('\n');
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'error' });
    expect(r.visibleEntries).toHaveLength(2);
  });

  it('always includes parse-error entries regardless of minLevel', () => {
    const input = line({ level: 'debug', msg: 'ok' }) + '\nnot json';
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'error' });
    expect(r.visibleEntries.some(e => e.parseError)).toBe(true);
  });

  it('always includes null-level entries regardless of minLevel', () => {
    const r = formatLogEntries(line({ msg: 'no level' }), { ...DEFAULT, minLevel: 'error' });
    expect(r.visibleEntries).toHaveLength(1);
  });

  it('does not mutate entries when filtering', () => {
    const input = [
      line({ level: 'debug', msg: 'a' }),
      line({ level: 'info', msg: 'b' }),
    ].join('\n');
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'info' });
    expect(r.entries).toHaveLength(2);
    expect(r.visibleEntries).toHaveLength(1);
  });

  // ── output text ─────────────────────────────────────────────────────────
  it('output contains the message text', () => {
    const r = formatLogEntries(line({ level: 'info', msg: 'test message' }), DEFAULT);
    expect(r.output).toContain('test message');
  });

  it('output contains the level', () => {
    const r = formatLogEntries(line({ level: 'error', msg: 'x' }), DEFAULT);
    expect(r.output).toContain('ERROR');
  });

  it('output contains the timestamp', () => {
    const r = formatLogEntries(
      line({ level: 'info', time: 1640995200000, msg: 'x' }),
      DEFAULT,
    );
    expect(r.output).toContain('2022');
  });

  it('includes metadata in output when showMeta is true', () => {
    const r = formatLogEntries(
      line({ level: 'info', msg: 'x', request_id: 'abc123' }),
      { ...DEFAULT, showMeta: true },
    );
    expect(r.output).toContain('request_id');
    expect(r.output).toContain('abc123');
  });

  it('excludes metadata from output when showMeta is false', () => {
    const r = formatLogEntries(
      line({ level: 'info', msg: 'x', request_id: 'abc123' }),
      { ...DEFAULT, showMeta: false },
    );
    expect(r.output).toContain('x');
    expect(r.output).not.toContain('request_id');
  });

  it('output only contains visible (filtered) entries', () => {
    const input = [
      line({ level: 'debug', msg: 'debug msg' }),
      line({ level: 'error', msg: 'error msg' }),
    ].join('\n');
    const r = formatLogEntries(input, { ...DEFAULT, minLevel: 'error' });
    expect(r.output).not.toContain('debug msg');
    expect(r.output).toContain('error msg');
  });

  it('marks parse-error lines in output', () => {
    const r = formatLogEntries('not valid json', DEFAULT);
    expect(r.output).toContain('PARSE ERROR');
  });

  // ── realistic log formats ───────────────────────────────────────────────
  it('handles a realistic pino log line', () => {
    const pinoLine = line({
      level: 30,
      time: 1640995200000,
      pid: 12345,
      hostname: 'web-01',
      msg: 'Request received',
      req: { method: 'GET', url: '/api/users' },
      res: { statusCode: 200 },
      responseTime: 42,
    });
    const r = formatLogEntries(pinoLine, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.entries[0].level).toBe('info');
    expect(r.entries[0].message).toBe('Request received');
    expect(r.entries[0].timestamp).toBe('2022-01-01T00:00:00.000Z');
    expect(r.entries[0].fields).toHaveProperty('pid', 12345);
    expect(r.entries[0].fields).toHaveProperty('responseTime', 42);
  });

  it('handles a realistic winston log line', () => {
    const winstonLine = line({
      level: 'warn',
      message: 'Slow database query',
      timestamp: '2022-06-15T10:23:45.123Z',
      service: 'api',
      duration_ms: 2300,
      query: 'SELECT * FROM orders',
    });
    const r = formatLogEntries(winstonLine, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.entries[0].level).toBe('warn');
    expect(r.entries[0].message).toBe('Slow database query');
    expect(r.entries[0].fields).toHaveProperty('duration_ms', 2300);
  });

  it('handles a realistic structured multi-line log', () => {
    const input = [
      line({ level: 30, time: 1640995200000, pid: 1, msg: 'Server started', port: 3000 }),
      line({ level: 30, time: 1640995201000, pid: 1, msg: 'Connected to DB', db: 'postgres' }),
      line({ level: 50, time: 1640995202000, pid: 1, msg: 'Unhandled error', err: { message: 'ECONNREFUSED' } }),
    ].join('\n');
    const r = formatLogEntries(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.entries).toHaveLength(3);
    expect(r.entries[2].level).toBe('error');
  });
});

import { describe, it, expect } from 'vitest';
import { formatIni } from '../../lib/ini';

const DEFAULT = { separator: '=' as const, sortSections: false, sortKeys: false };

describe('formatIni', () => {
  it('returns empty output for empty input', () => {
    const r = formatIni('', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const r = formatIni('   \n  ', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('formats a simple key-value pair', () => {
    const r = formatIni('key=value', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('key = value');
  });

  it('normalizes spacing around = separator', () => {
    const r = formatIni('name  =  Alice', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('name = Alice');
  });

  it('uses : separator when configured', () => {
    const r = formatIni('host=localhost', { ...DEFAULT, separator: ':' });
    expect(r.error).toBeNull();
    expect(r.output).toBe('host: localhost');
  });

  it('normalizes : input to = output', () => {
    const r = formatIni('port: 5432', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('port = 5432');
  });

  it('normalizes = input to : output', () => {
    const r = formatIni('port = 5432', { ...DEFAULT, separator: ':' });
    expect(r.error).toBeNull();
    expect(r.output).toBe('port: 5432');
  });

  it('formats a section header', () => {
    const r = formatIni('[database]\nhost = localhost', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('[database]');
    expect(r.output).toContain('host = localhost');
  });

  it('preserves comments', () => {
    const r = formatIni('; config file\n# another comment\nkey = val', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('; config file');
    expect(r.output).toContain('# another comment');
  });

  it('handles global keys before sections', () => {
    const input = 'global = yes\n[section]\nlocal = no';
    const r = formatIni(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('global = yes');
    expect(r.output).toContain('[section]');
    expect(r.output).toContain('local = no');
    const gIdx = r.output.indexOf('global = yes');
    const sIdx = r.output.indexOf('[section]');
    expect(gIdx).toBeLessThan(sIdx);
  });

  it('separates sections with a blank line', () => {
    const input = '[a]\nx = 1\n[b]\ny = 2';
    const r = formatIni(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('\n\n[b]');
  });

  it('sorts sections alphabetically when sortSections is true', () => {
    const input = '[zebra]\na = 1\n[alpha]\nb = 2';
    const r = formatIni(input, { ...DEFAULT, sortSections: true });
    expect(r.error).toBeNull();
    const alphaIdx = r.output.indexOf('[alpha]');
    const zebraIdx = r.output.indexOf('[zebra]');
    expect(alphaIdx).toBeLessThan(zebraIdx);
  });

  it('sorts keys within sections when sortKeys is true', () => {
    const input = '[db]\nport = 5432\nhost = localhost\nuser = admin';
    const r = formatIni(input, { ...DEFAULT, sortKeys: true });
    expect(r.error).toBeNull();
    const hostIdx = r.output.indexOf('host =');
    const portIdx = r.output.indexOf('port =');
    const userIdx = r.output.indexOf('user =');
    expect(hostIdx).toBeLessThan(portIdx);
    expect(portIdx).toBeLessThan(userIdx);
  });

  it('keeps global section first when sorting sections', () => {
    const input = 'global = 1\n[z]\na = 2\n[a]\nb = 3';
    const r = formatIni(input, { ...DEFAULT, sortSections: true });
    expect(r.error).toBeNull();
    const globalIdx = r.output.indexOf('global = 1');
    const aIdx = r.output.indexOf('[a]');
    expect(globalIdx).toBeLessThan(aIdx);
  });

  it('handles keys with empty values', () => {
    const r = formatIni('flag=', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('flag =');
  });

  it('handles empty values with : separator', () => {
    const r = formatIni('flag=', { ...DEFAULT, separator: ':' });
    expect(r.error).toBeNull();
    expect(r.output).toBe('flag:');
  });

  it('preserves values with = in them', () => {
    const r = formatIni('query = a=1&b=2', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('query = a=1&b=2');
  });

  it('preserves values with : in them (URLs)', () => {
    const r = formatIni('url = https://example.com', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('url = https://example.com');
  });

  it('collapses multiple blank lines between sections to one', () => {
    const input = '[a]\nx = 1\n\n\n\n[b]\ny = 2';
    const r = formatIni(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).not.toMatch(/\n{3,}/);
  });

  it('returns error for unclosed section bracket', () => {
    const r = formatIni('[section', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  it('returns error for empty section name', () => {
    const r = formatIni('[]', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  it('formats a realistic config file', () => {
    const input = [
      '; App config',
      '[server]',
      'host=0.0.0.0',
      'port=8080',
      '[database]',
      'url=postgres://localhost/app',
      'pool=5',
    ].join('\n');
    const r = formatIni(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('[server]');
    expect(r.output).toContain('host = 0.0.0.0');
    expect(r.output).toContain('[database]');
    expect(r.output).toContain('url = postgres://localhost/app');
  });
});

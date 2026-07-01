import { describe, it, expect } from 'vitest';
import { formatNginxConfig } from '../../lib/nginxConfig';

const DEFAULT = { indentSize: 4 as const };

describe('formatNginxConfig', () => {
  it('returns empty output for empty input', () => {
    const r = formatNginxConfig('', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const r = formatNginxConfig('   \n  ', DEFAULT);
    expect(r.output).toBe('');
    expect(r.error).toBeNull();
  });

  it('formats a simple directive', () => {
    const r = formatNginxConfig('worker_processes 1;', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('worker_processes 1;');
  });

  it('normalizes extra spaces in a directive', () => {
    const r = formatNginxConfig('worker_processes    1;', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('worker_processes 1;');
  });

  it('formats a block with indented content', () => {
    const r = formatNginxConfig('server { listen 80; }', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('server {');
    expect(r.output).toContain('    listen 80;');
    expect(r.output).toContain('}');
  });

  it('uses 2-space indent when configured', () => {
    const r = formatNginxConfig('http { server { listen 80; } }', { indentSize: 2 });
    expect(r.error).toBeNull();
    expect(r.output).toContain('  server {');
    expect(r.output).toContain('    listen 80;');
  });

  it('uses 4-space indent by default', () => {
    const r = formatNginxConfig('server { listen 80; }', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('    listen 80;');
  });

  it('formats nested blocks', () => {
    const input = 'http { server { listen 80; } }';
    const r = formatNginxConfig(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('http {');
    expect(r.output).toContain('    server {');
    expect(r.output).toContain('        listen 80;');
    expect(r.output).toContain('    }');
    expect(r.output).toContain('}');
  });

  it('preserves comments at top level', () => {
    const r = formatNginxConfig('# main config\nworker_processes 1;', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('# main config');
    expect(r.output).toContain('worker_processes 1;');
  });

  it('indents comments inside blocks', () => {
    const r = formatNginxConfig('server {\n# listen port\nlisten 80;\n}', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('    # listen port');
    expect(r.output).toContain('    listen 80;');
  });

  it('handles multiple directives in a block', () => {
    const input = 'server { listen 80; server_name example.com; root /var/www; }';
    const r = formatNginxConfig(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('    listen 80;');
    expect(r.output).toContain('    server_name example.com;');
    expect(r.output).toContain('    root /var/www;');
  });

  it('handles directives with multiple values', () => {
    const r = formatNginxConfig('access_log /var/log/nginx/access.log combined;', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('access_log /var/log/nginx/access.log combined;');
  });

  it('handles directives with quoted values', () => {
    const r = formatNginxConfig('add_header X-Frame-Options "SAMEORIGIN";', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('add_header X-Frame-Options "SAMEORIGIN";');
  });

  it('handles nginx variables ($ prefix)', () => {
    const r = formatNginxConfig('proxy_set_header Host $host;', DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toBe('proxy_set_header Host $host;');
  });

  it('handles location blocks', () => {
    const input = 'server { location / { proxy_pass http://backend; } }';
    const r = formatNginxConfig(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('    location / {');
    expect(r.output).toContain('        proxy_pass http://backend;');
  });

  it('returns error for unmatched opening brace', () => {
    const r = formatNginxConfig('server {', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  it('returns error for unmatched closing brace', () => {
    const r = formatNginxConfig('worker_processes 1; }', DEFAULT);
    expect(r.error).not.toBeNull();
    expect(r.output).toBe('');
  });

  it('formats a block with brace on its own line', () => {
    const input = 'server\n{\nlisten 80;\n}';
    const r = formatNginxConfig(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('server {');
    expect(r.output).toContain('    listen 80;');
  });

  it('formats a realistic nginx config', () => {
    const input = [
      'worker_processes auto;',
      'events { worker_connections 1024; }',
      'http {',
      '  include mime.types;',
      '  server {',
      '    listen 80;',
      '    server_name example.com;',
      '    location / { root /var/www/html; index index.html; }',
      '  }',
      '}',
    ].join('\n');
    const r = formatNginxConfig(input, DEFAULT);
    expect(r.error).toBeNull();
    expect(r.output).toContain('worker_processes auto;');
    expect(r.output).toContain('events {');
    expect(r.output).toContain('    worker_connections 1024;');
    expect(r.output).toContain('http {');
    expect(r.output).toContain('    server {');
    expect(r.output).toContain('        listen 80;');
    expect(r.output).toContain('        server_name example.com;');
    expect(r.output).toContain('        location / {');
    expect(r.output).toContain('            root /var/www/html;');
  });
});

import { describe, it, expect } from 'vitest';
import { buildHtaccess, DEFAULT_HTACCESS_CONFIG } from '../../lib/htaccess';
import type { HtaccessConfig } from '../../lib/htaccess';

const BASE: HtaccessConfig = { ...DEFAULT_HTACCESS_CONFIG };

describe('buildHtaccess', () => {
  it('returns an empty string when nothing is enabled', () => {
    expect(buildHtaccess(BASE)).toBe('');
  });

  it('emits a force-HTTPS rewrite rule under a single RewriteEngine On', () => {
    const output = buildHtaccess({ ...BASE, forceHttps: true });
    expect(output).toBe(
      'RewriteEngine On\nRewriteCond %{HTTPS} off\nRewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]'
    );
  });

  it('combines force-HTTPS and www canonicalization under one RewriteEngine On', () => {
    const output = buildHtaccess({ ...BASE, forceHttps: true, wwwCanonicalization: 'www' });
    const rewriteEngineCount = (output.match(/RewriteEngine On/g) ?? []).length;
    expect(rewriteEngineCount).toBe(1);
    expect(output).toContain('RewriteCond %{HTTPS} off');
    expect(output).toContain('RewriteCond %{HTTP_HOST} !^www\\. [NC]');
  });

  it('emits a non-www canonicalization rule', () => {
    const output = buildHtaccess({ ...BASE, wwwCanonicalization: 'non-www' });
    expect(output).toContain('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
    expect(output).toContain('RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [L,R=301]');
  });

  it('emits Redirect directives for custom redirects', () => {
    const output = buildHtaccess({
      ...BASE,
      redirects: [{ from: '/old', to: '/new', type: '301' }, { from: '/temp', to: '/dest', type: '302' }],
    });
    expect(output).toBe('Redirect 301 /old /new\nRedirect 302 /temp /dest');
  });

  it('emits ErrorDocument directives', () => {
    const output = buildHtaccess({ ...BASE, errorPages: [{ code: '404', path: '/404.html' }] });
    expect(output).toBe('ErrorDocument 404 /404.html');
  });

  it('disables directory listing', () => {
    expect(buildHtaccess({ ...BASE, disableDirectoryListing: true })).toBe('Options -Indexes');
  });

  it('sets a custom DirectoryIndex', () => {
    expect(buildHtaccess({ ...BASE, indexFiles: ['index.php', 'index.html'] })).toBe('DirectoryIndex index.php index.html');
  });

  it('emits a mod_deflate block for gzip compression', () => {
    const output = buildHtaccess({ ...BASE, enableGzip: true });
    expect(output).toContain('<IfModule mod_deflate.c>');
    expect(output).toContain('AddOutputFilterByType DEFLATE');
    expect(output).toContain('</IfModule>');
  });

  it('emits a mod_expires block for browser caching', () => {
    const output = buildHtaccess({ ...BASE, enableBrowserCaching: true });
    expect(output).toContain('<IfModule mod_expires.c>');
    expect(output).toContain('ExpiresActive On');
  });

  it('blocks access to dotfiles', () => {
    const output = buildHtaccess({ ...BASE, blockHiddenFiles: true });
    expect(output).toContain('<FilesMatch "^\\.">');
    expect(output).toContain('Require all denied');
  });

  it('appends trimmed custom rules verbatim', () => {
    const output = buildHtaccess({ ...BASE, customRules: '  RewriteRule ^foo$ /bar [L]  \n' });
    expect(output).toBe('RewriteRule ^foo$ /bar [L]');
  });

  it('joins multiple enabled sections with a blank line', () => {
    const output = buildHtaccess({ ...BASE, disableDirectoryListing: true, blockHiddenFiles: true });
    expect(output).toBe('Options -Indexes\n\n<FilesMatch "^\\.">\n  Require all denied\n</FilesMatch>');
  });
});

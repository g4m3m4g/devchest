export interface RedirectRule {
  from: string;
  to: string;
  type: '301' | '302';
}

export interface ErrorPageRule {
  code: string;
  path: string;
}

export type WwwCanonicalization = 'none' | 'www' | 'non-www';

export interface HtaccessConfig {
  forceHttps: boolean;
  wwwCanonicalization: WwwCanonicalization;
  redirects: RedirectRule[];
  errorPages: ErrorPageRule[];
  disableDirectoryListing: boolean;
  indexFiles: string[];
  enableGzip: boolean;
  enableBrowserCaching: boolean;
  blockHiddenFiles: boolean;
  customRules: string;
}

export const DEFAULT_HTACCESS_CONFIG: HtaccessConfig = {
  forceHttps: false,
  wwwCanonicalization: 'none',
  redirects: [],
  errorPages: [],
  disableDirectoryListing: false,
  indexFiles: [],
  enableGzip: false,
  enableBrowserCaching: false,
  blockHiddenFiles: false,
  customRules: '',
};

export function buildHtaccess(config: HtaccessConfig): string {
  const sections: string[] = [];

  const rewriteLines: string[] = [];
  if (config.forceHttps) {
    rewriteLines.push('RewriteCond %{HTTPS} off');
    rewriteLines.push('RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
  }
  if (config.wwwCanonicalization === 'www') {
    rewriteLines.push('RewriteCond %{HTTP_HOST} !^www\\. [NC]');
    rewriteLines.push('RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]');
  } else if (config.wwwCanonicalization === 'non-www') {
    rewriteLines.push('RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]');
    rewriteLines.push('RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [L,R=301]');
  }
  if (rewriteLines.length > 0) {
    sections.push(['RewriteEngine On', ...rewriteLines].join('\n'));
  }

  if (config.redirects.length > 0) {
    sections.push(config.redirects.map(r => `Redirect ${r.type} ${r.from} ${r.to}`).join('\n'));
  }

  if (config.errorPages.length > 0) {
    sections.push(config.errorPages.map(e => `ErrorDocument ${e.code} ${e.path}`).join('\n'));
  }

  if (config.disableDirectoryListing) {
    sections.push('Options -Indexes');
  }

  if (config.indexFiles.length > 0) {
    sections.push(`DirectoryIndex ${config.indexFiles.join(' ')}`);
  }

  if (config.enableGzip) {
    sections.push([
      '<IfModule mod_deflate.c>',
      '  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json',
      '</IfModule>',
    ].join('\n'));
  }

  if (config.enableBrowserCaching) {
    sections.push([
      '<IfModule mod_expires.c>',
      '  ExpiresActive On',
      '  ExpiresByType image/jpg "access plus 1 year"',
      '  ExpiresByType image/jpeg "access plus 1 year"',
      '  ExpiresByType image/png "access plus 1 year"',
      '  ExpiresByType image/gif "access plus 1 year"',
      '  ExpiresByType image/svg+xml "access plus 1 year"',
      '  ExpiresByType text/css "access plus 1 month"',
      '  ExpiresByType application/javascript "access plus 1 month"',
      '  ExpiresByType text/html "access plus 1 day"',
      '</IfModule>',
    ].join('\n'));
  }

  if (config.blockHiddenFiles) {
    sections.push([
      '<FilesMatch "^\\.">',
      '  Require all denied',
      '</FilesMatch>',
    ].join('\n'));
  }

  if (config.customRules.trim()) {
    sections.push(config.customRules.trim());
  }

  return sections.join('\n\n');
}

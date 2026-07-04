import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOOLS } from '../src/config/tools';
import {
  SITE_URL,
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCatalogJsonLd,
  buildCatalogSeoMeta,
  buildToolJsonLd,
  buildToolSeoMeta,
  getCategoryForTool,
} from '../src/lib/seo';
import type { SeoMeta } from '../src/lib/seo';

const DIST_DIR = resolve(import.meta.dirname, '../dist');
const INDEX_HTML_PATH = resolve(DIST_DIR, 'index.html');

function replaceMarker(html: string, marker: string, replacement: string): string {
  const pattern = new RegExp(`<!--SEO:${marker}-->[\\s\\S]*?<!--\\/SEO:${marker}-->`);
  if (!pattern.test(html)) {
    throw new Error(`build-seo: could not find marker "${marker}" in index.html template — aborting build.`);
  }
  return html.replace(pattern, replacement);
}

function applySeo(template: string, meta: SeoMeta, jsonLd: object, robots: string): string {
  let html = template;
  html = replaceMarker(html, 'TITLE', `<title>${meta.title}</title>`);
  html = replaceMarker(html, 'DESC', `<meta name="description" content="${escapeHtml(meta.description)}" />`);
  html = replaceMarker(
    html,
    'CANONICAL',
    `<link rel="canonical" href="${absoluteUrl(meta.canonicalPath)}" />`,
  );
  html = replaceMarker(
    html,
    'OG',
    [
      `<meta property="og:site_name" content="DevChest" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
      `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
      `<meta property="og:url" content="${absoluteUrl(meta.canonicalPath)}" />`,
      `<meta property="og:image" content="${SITE_URL}/DEVCHEST-LOGO.png" />`,
      `<meta name="twitter:card" content="summary" />`,
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    ].join('\n    '),
  );
  html = replaceMarker(
    html,
    'JSONLD',
    `<script type="application/ld+json" id="structured-data">${JSON.stringify(jsonLd)}</script>`,
  );
  html = html.replace(
    /<meta name="robots" content="[^"]*" \/>/,
    `<meta name="robots" content="${robots}" />`,
  );
  return html;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function writeFile(path: string, contents: string) {
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, contents);
}

function main() {
  if (!existsSync(INDEX_HTML_PATH)) {
    throw new Error(`build-seo: ${INDEX_HTML_PATH} does not exist — run "vite build" first.`);
  }

  const template = readFileSync(INDEX_HTML_PATH, 'utf-8');

  // Per-tool static pages, generated from the pristine template.
  for (const tool of TOOLS) {
    const category = getCategoryForTool(tool);
    const meta = buildToolSeoMeta(tool);
    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [buildToolJsonLd(tool), buildBreadcrumbJsonLd(tool, category)],
    };
    const html = applySeo(template, meta, jsonLd, 'index, follow');
    writeFile(resolve(DIST_DIR, 'tools', tool.id, 'index.html'), html);
  }

  // Catalog root, overwritten in place with catalog-level SEO.
  const catalogHtml = applySeo(template, buildCatalogSeoMeta(), buildCatalogJsonLd(), 'index, follow');
  writeFileSync(INDEX_HTML_PATH, catalogHtml);

  // 404 fallback: same shell, guaranteed-correct hashed asset paths since it's post-build.
  writeFileSync(resolve(DIST_DIR, '404.html'), catalogHtml);

  // Sitemap.
  const urls = [
    `/`,
    ...TOOLS.map(tool => `/tools/${tool.id}/`),
  ];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(path => `  <url><loc>${absoluteUrl(path)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');
  writeFileSync(resolve(DIST_DIR, 'sitemap.xml'), sitemap);

  console.log(`build-seo: generated ${TOOLS.length} tool pages, sitemap.xml, and 404.html.`);
}

main();

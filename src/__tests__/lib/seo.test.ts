import { describe, expect, it } from 'vitest';
import { TOOLS } from '../../config/tools';
import {
  absoluteUrl,
  buildBreadcrumbJsonLd,
  buildCatalogJsonLd,
  buildCatalogSeoMeta,
  buildNotFoundSeoMeta,
  buildToolJsonLd,
  buildToolSeoMeta,
  getCategoryForTool,
  SITE_URL,
} from '../../lib/seo';

const sampleTool = TOOLS.find(t => t.id === 'json-formatter')!;

describe('absoluteUrl', () => {
  it('joins the site URL and path without double slashes', () => {
    expect(absoluteUrl('/tools/json-formatter/')).toBe(`${SITE_URL}/tools/json-formatter/`);
    expect(absoluteUrl('tools/json-formatter/')).toBe(`${SITE_URL}/tools/json-formatter/`);
    expect(absoluteUrl('/')).toBe(`${SITE_URL}/`);
  });
});

describe('buildToolSeoMeta', () => {
  it('builds a unique title and reuses the tool description verbatim', () => {
    const meta = buildToolSeoMeta(sampleTool);
    expect(meta.title).toBe(`${sampleTool.name} — DevChest`);
    expect(meta.description).toBe(sampleTool.description);
    expect(meta.canonicalPath).toBe('/tools/json-formatter/');
  });
});

describe('buildCatalogSeoMeta', () => {
  it('builds catalog-level meta for the root path', () => {
    const meta = buildCatalogSeoMeta();
    expect(meta.canonicalPath).toBe('/');
    expect(meta.title).toContain('DevChest');
    expect(meta.description.length).toBeGreaterThan(0);
  });
});

describe('buildNotFoundSeoMeta', () => {
  it('builds noindex-friendly meta pointing back at root', () => {
    const meta = buildNotFoundSeoMeta();
    expect(meta.canonicalPath).toBe('/');
    expect(meta.title).toContain('Not Found');
  });
});

describe('buildToolJsonLd', () => {
  it('returns a SoftwareApplication schema populated from the tool', () => {
    const jsonLd = buildToolJsonLd(sampleTool) as Record<string, unknown>;
    expect(jsonLd['@type']).toBe('SoftwareApplication');
    expect(jsonLd.name).toBe(sampleTool.name);
    expect(jsonLd.description).toBe(sampleTool.description);
    expect(jsonLd.url).toBe(`${SITE_URL}/tools/json-formatter/`);
    expect(jsonLd.applicationCategory).toBe('DeveloperApplication');
  });
});

describe('buildCatalogJsonLd', () => {
  it('includes an ItemList with an entry for every tool', () => {
    const jsonLd = buildCatalogJsonLd() as { '@graph': Array<Record<string, unknown>> };
    const itemList = jsonLd['@graph'].find(node => node['@type'] === 'ItemList');
    expect(itemList).toBeDefined();
    expect((itemList!.itemListElement as unknown[]).length).toBe(TOOLS.length);
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('builds a 3-level BreadcrumbList for a tool', () => {
    const category = getCategoryForTool(sampleTool);
    const jsonLd = buildBreadcrumbJsonLd(sampleTool, category) as {
      itemListElement: Array<Record<string, unknown>>;
    };
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].name).toBe('Home');
    expect(jsonLd.itemListElement[2].name).toBe(sampleTool.name);
  });
});

describe('getCategoryForTool', () => {
  it('resolves the category for a known tool', () => {
    const category = getCategoryForTool(sampleTool);
    expect(category.id).toBe(sampleTool.categoryId);
  });

  it('throws for an unknown categoryId', () => {
    expect(() => getCategoryForTool({ ...sampleTool, categoryId: 'nope' })).toThrow();
  });
});

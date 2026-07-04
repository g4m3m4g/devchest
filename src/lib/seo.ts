import type { Tool, Category } from '../config/tools';
import { CATEGORIES, TOOLS } from '../config/tools';

export const SITE_NAME = 'DevChest';
export const SITE_URL = 'https://g4m3m4g.github.io/devchest';
export const SITE_DESCRIPTION =
  'DevChest — A developer utility hub for formatters, encoders, text tools, and generators. 24 tools, zero backend, everything runs in your browser.';

export interface SeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}/${path.replace(/^\/+/, '')}`.replace(/([^:]\/)\/+/g, '$1');
}

export function buildToolSeoMeta(tool: Tool): SeoMeta {
  return {
    title: `${tool.name} — ${SITE_NAME}`,
    description: tool.description,
    canonicalPath: `/tools/${tool.id}/`,
  };
}

export function buildCatalogSeoMeta(): SeoMeta {
  return {
    title: `${SITE_NAME} — Developer Utility Hub`,
    description: SITE_DESCRIPTION,
    canonicalPath: '/',
  };
}

export function buildNotFoundSeoMeta(): SeoMeta {
  return {
    title: `Not Found — ${SITE_NAME}`,
    description: 'The tool you are looking for does not exist.',
    canonicalPath: '/',
  };
}

export function buildToolJsonLd(tool: Tool): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(`/tools/${tool.id}/`),
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  };
}

export function buildCatalogJsonLd(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: absoluteUrl('/'),
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: absoluteUrl('/'),
      },
      {
        '@type': 'ItemList',
        itemListElement: TOOLS.map((tool, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: tool.name,
          url: absoluteUrl(`/tools/${tool.id}/`),
        })),
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(tool: Tool, category: Category): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: absoluteUrl('/'),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: category.name,
        item: absoluteUrl(`/#${category.id}`),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: tool.name,
        item: absoluteUrl(`/tools/${tool.id}/`),
      },
    ],
  };
}

export function getCategoryForTool(tool: Tool): Category {
  const category = CATEGORIES.find(c => c.id === tool.categoryId);
  if (!category) {
    throw new Error(`Unknown categoryId "${tool.categoryId}" for tool "${tool.id}"`);
  }
  return category;
}

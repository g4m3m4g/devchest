import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { useSEO } from '../../hooks/useSEO';
import type { SeoMeta } from '../../lib/seo';

function TestComponent({ meta, jsonLd }: { meta: SeoMeta; jsonLd: object }) {
  useSEO(meta, jsonLd);
  return null;
}

const metaA: SeoMeta = { title: 'Tool A — DevChest', description: 'Description A', canonicalPath: '/tools/a/' };
const metaB: SeoMeta = { title: 'Tool B — DevChest', description: 'Description B', canonicalPath: '/tools/b/' };

describe('useSEO', () => {
  it('sets document title, canonical link, meta description, and JSON-LD', () => {
    render(<TestComponent meta={metaA} jsonLd={{ '@type': 'Thing' }} />);

    expect(document.title).toBe('Tool A — DevChest');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://g4m3m4g.github.io/devchest/tools/a/',
    );
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe('Description A');
    expect(document.getElementById('structured-data')?.textContent).toBe(JSON.stringify({ '@type': 'Thing' }));
  });

  it('updates existing tags in place without duplicating them on re-render', () => {
    const { rerender } = render(<TestComponent meta={metaA} jsonLd={{ '@type': 'Thing' }} />);
    rerender(<TestComponent meta={metaB} jsonLd={{ '@type': 'Other' }} />);

    expect(document.title).toBe('Tool B — DevChest');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1);
    expect(document.querySelectorAll('#structured-data')).toHaveLength(1);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://g4m3m4g.github.io/devchest/tools/b/',
    );
  });
});

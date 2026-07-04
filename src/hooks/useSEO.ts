import { useEffect } from 'react';
import type { SeoMeta } from '../lib/seo';
import { absoluteUrl } from '../lib/seo';

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', 'canonical');
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function upsertJsonLd(jsonLd: object) {
  let tag = document.getElementById('structured-data') as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement('script');
    tag.id = 'structured-data';
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(jsonLd);
}

export function useSEO(meta: SeoMeta, jsonLd: object, robots: string = 'index, follow') {
  useEffect(() => {
    const canonicalUrl = absoluteUrl(meta.canonicalPath);

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', robots);
    upsertCanonical(canonicalUrl);

    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', 'website');

    upsertMeta('name', 'twitter:card', 'summary');
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);

    upsertJsonLd(jsonLd);
  }, [meta, jsonLd, robots]);
}

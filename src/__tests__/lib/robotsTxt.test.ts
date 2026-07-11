import { describe, it, expect } from 'vitest';
import { buildRobotsTxt, parseRobotsTxt } from '../../lib/robotsTxt';
import type { RobotsConfig } from '../../lib/robotsTxt';

describe('buildRobotsTxt', () => {
  it('builds a single user-agent block with disallow and allow rules', () => {
    const config: RobotsConfig = {
      rules: [{ userAgent: '*', disallow: ['/admin/', '/private/'], allow: ['/admin/public/'] }],
      sitemaps: [],
    };
    expect(buildRobotsTxt(config)).toBe(
      'User-agent: *\nDisallow: /admin/\nDisallow: /private/\nAllow: /admin/public/'
    );
  });

  it('includes crawl-delay when set', () => {
    const config: RobotsConfig = {
      rules: [{ userAgent: 'Bingbot', disallow: [], allow: [], crawlDelay: 10 }],
      sitemaps: [],
    };
    expect(buildRobotsTxt(config)).toBe('User-agent: Bingbot\nCrawl-delay: 10');
  });

  it('joins multiple rule blocks with a blank line', () => {
    const config: RobotsConfig = {
      rules: [
        { userAgent: '*', disallow: ['/admin/'], allow: [] },
        { userAgent: 'GPTBot', disallow: ['/'], allow: [] },
      ],
      sitemaps: [],
    };
    expect(buildRobotsTxt(config)).toBe(
      'User-agent: *\nDisallow: /admin/\n\nUser-agent: GPTBot\nDisallow: /'
    );
  });

  it('appends sitemap lines after a blank line', () => {
    const config: RobotsConfig = {
      rules: [{ userAgent: '*', disallow: [], allow: [] }],
      sitemaps: ['https://example.com/sitemap.xml', 'https://example.com/sitemap-news.xml'],
    };
    expect(buildRobotsTxt(config)).toBe(
      'User-agent: *\n\nSitemap: https://example.com/sitemap.xml\nSitemap: https://example.com/sitemap-news.xml'
    );
  });

  it('returns an empty string for an empty config', () => {
    expect(buildRobotsTxt({ rules: [], sitemaps: [] })).toBe('');
  });

  it('emits an allow-all rule with no disallow lines', () => {
    const config: RobotsConfig = { rules: [{ userAgent: '*', disallow: [], allow: [] }], sitemaps: [] };
    expect(buildRobotsTxt(config)).toBe('User-agent: *');
  });
});

describe('parseRobotsTxt', () => {
  it('parses a single-block robots.txt', () => {
    const parsed = parseRobotsTxt('User-agent: *\nDisallow: /admin/\nAllow: /admin/public/');
    expect(parsed.rules).toEqual([{ userAgent: '*', disallow: ['/admin/'], allow: ['/admin/public/'] }]);
  });

  it('parses multiple blocks and sitemaps', () => {
    const parsed = parseRobotsTxt(
      'User-agent: *\nDisallow: /admin/\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml'
    );
    expect(parsed.rules).toHaveLength(2);
    expect(parsed.rules[1]).toEqual({ userAgent: 'GPTBot', disallow: ['/'], allow: [] });
    expect(parsed.sitemaps).toEqual(['https://example.com/sitemap.xml']);
  });

  it('parses crawl-delay as a number', () => {
    const parsed = parseRobotsTxt('User-agent: Bingbot\nCrawl-delay: 10');
    expect(parsed.rules[0].crawlDelay).toBe(10);
  });

  it('ignores comments and blank lines', () => {
    const parsed = parseRobotsTxt('# comment\nUser-agent: *\n\n# another comment\nDisallow: /admin/');
    expect(parsed.rules).toEqual([{ userAgent: '*', disallow: ['/admin/'], allow: [] }]);
  });

  it('round-trips through buildRobotsTxt', () => {
    const original = 'User-agent: *\nDisallow: /admin/\nAllow: /admin/public/\n\nSitemap: https://example.com/sitemap.xml';
    expect(buildRobotsTxt(parseRobotsTxt(original))).toBe(original);
  });

  it('returns empty rules and sitemaps for an empty string', () => {
    expect(parseRobotsTxt('')).toEqual({ rules: [], sitemaps: [] });
  });
});

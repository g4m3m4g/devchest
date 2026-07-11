export interface RobotsRule {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
}

export interface RobotsConfig {
  rules: RobotsRule[];
  sitemaps: string[];
}

export const COMMON_USER_AGENTS = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'CCBot', 'ClaudeBot'] as const;

export function buildRobotsTxt(config: RobotsConfig): string {
  const blocks = config.rules.map(rule => {
    const lines = [`User-agent: ${rule.userAgent}`];
    for (const path of rule.disallow) lines.push(`Disallow: ${path}`);
    for (const path of rule.allow) lines.push(`Allow: ${path}`);
    if (rule.crawlDelay !== undefined) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
    return lines.join('\n');
  });

  const sections = [...blocks];
  if (config.sitemaps.length > 0) {
    sections.push(config.sitemaps.map(url => `Sitemap: ${url}`).join('\n'));
  }

  return sections.join('\n\n');
}

export function parseRobotsTxt(text: string): RobotsConfig {
  const rules: RobotsRule[] = [];
  const sitemaps: string[] = [];
  let current: RobotsRule | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim().toLowerCase();
    const value = line.slice(colonIndex + 1).trim();

    if (key === 'user-agent') {
      current = { userAgent: value, allow: [], disallow: [] };
      rules.push(current);
    } else if (key === 'disallow' && current) {
      current.disallow.push(value);
    } else if (key === 'allow' && current) {
      current.allow.push(value);
    } else if (key === 'crawl-delay' && current) {
      current.crawlDelay = Number(value);
    } else if (key === 'sitemap') {
      sitemaps.push(value);
    }
  }

  return { rules, sitemaps };
}

export const CSP_DIRECTIVES = [
  'default-src',
  'script-src',
  'style-src',
  'img-src',
  'font-src',
  'connect-src',
  'media-src',
  'object-src',
  'frame-src',
  'frame-ancestors',
  'base-uri',
  'form-action',
  'worker-src',
  'manifest-src',
  'child-src',
] as const;

export type CspDirective = typeof CSP_DIRECTIVES[number];

export const CSP_KEYWORDS = ["'self'", "'none'", "'unsafe-inline'", "'unsafe-eval'", "'strict-dynamic'"] as const;

export type CspPolicy = Partial<Record<CspDirective, string[]>>;

export interface CspWarning {
  directive: string;
  message: string;
}

export function buildCsp(policy: CspPolicy, options: { upgradeInsecureRequests?: boolean } = {}): string {
  const parts: string[] = [];
  for (const directive of CSP_DIRECTIVES) {
    const sources = policy[directive];
    if (sources && sources.length > 0) {
      parts.push(`${directive} ${sources.join(' ')}`);
    }
  }
  if (options.upgradeInsecureRequests) {
    parts.push('upgrade-insecure-requests');
  }
  return parts.join('; ');
}

export function parseCsp(policyString: string): CspPolicy {
  const policy: CspPolicy = {};
  for (const segment of policyString.split(';')) {
    const trimmed = segment.trim();
    if (!trimmed) continue;
    const [name, ...sources] = trimmed.split(/\s+/);
    if ((CSP_DIRECTIVES as readonly string[]).includes(name)) {
      policy[name as CspDirective] = sources;
    }
  }
  return policy;
}

export function getCspWarnings(policy: CspPolicy): CspWarning[] {
  const warnings: CspWarning[] = [];

  for (const directive of CSP_DIRECTIVES) {
    const sources = policy[directive];
    if (!sources) continue;

    if (sources.includes("'unsafe-inline'")) {
      warnings.push({ directive, message: `${directive} allows 'unsafe-inline', which weakens XSS protection` });
    }
    if (sources.includes("'unsafe-eval'")) {
      warnings.push({ directive, message: `${directive} allows 'unsafe-eval', which weakens XSS protection` });
    }
    if (sources.includes('*')) {
      warnings.push({ directive, message: `${directive} allows any origin (*), consider restricting it` });
    }
  }

  if (!policy['object-src']) {
    warnings.push({ directive: 'object-src', message: "Missing object-src — consider setting it to 'none' to block legacy plugins" });
  }

  return warnings;
}

export function buildMetaTag(policyString: string): string {
  return `<meta http-equiv="Content-Security-Policy" content="${policyString}">`;
}

export function buildHeaderLine(policyString: string): string {
  return `Content-Security-Policy: ${policyString}`;
}

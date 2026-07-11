import { describe, it, expect } from 'vitest';
import {
  buildCsp,
  parseCsp,
  getCspWarnings,
  buildMetaTag,
  buildHeaderLine,
  CSP_DIRECTIVES,
} from '../../lib/csp';

describe('buildCsp', () => {
  it('joins directives with their sources', () => {
    const policy = { 'default-src': ["'self'"], 'script-src': ["'self'", 'https://cdn.example.com'] };
    expect(buildCsp(policy)).toBe("default-src 'self'; script-src 'self' https://cdn.example.com");
  });

  it('skips directives with no sources', () => {
    const policy = { 'default-src': ["'self'"], 'img-src': [] };
    expect(buildCsp(policy)).toBe("default-src 'self'");
  });

  it('appends upgrade-insecure-requests when requested', () => {
    const policy = { 'default-src': ["'self'"] };
    expect(buildCsp(policy, { upgradeInsecureRequests: true })).toBe("default-src 'self'; upgrade-insecure-requests");
  });

  it('returns an empty string for an empty policy', () => {
    expect(buildCsp({})).toBe('');
  });

  it('emits directives in a stable, canonical order regardless of input order', () => {
    const policy = { 'script-src': ["'self'"], 'default-src': ["'self'"] };
    expect(buildCsp(policy)).toBe("default-src 'self'; script-src 'self'");
  });
});

describe('parseCsp', () => {
  it('parses a policy string back into a directive map', () => {
    const parsed = parseCsp("default-src 'self'; script-src 'self' https://cdn.example.com");
    expect(parsed['default-src']).toEqual(["'self'"]);
    expect(parsed['script-src']).toEqual(["'self'", 'https://cdn.example.com']);
  });

  it('ignores unknown directives', () => {
    const parsed = parseCsp('totally-not-a-directive foo; default-src \'self\'');
    expect(parsed['default-src']).toEqual(["'self'"]);
    expect(Object.keys(parsed)).not.toContain('totally-not-a-directive');
  });

  it('round-trips through buildCsp', () => {
    const original = "default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none'";
    expect(buildCsp(parseCsp(original))).toBe(original);
  });

  it('returns an empty object for an empty string', () => {
    expect(parseCsp('')).toEqual({});
  });
});

describe('getCspWarnings', () => {
  it('flags unsafe-inline', () => {
    const warnings = getCspWarnings({ 'script-src': ["'self'", "'unsafe-inline'"], 'object-src': ["'none'"] });
    expect(warnings.some(w => w.directive === 'script-src' && /unsafe-inline/.test(w.message))).toBe(true);
  });

  it('flags unsafe-eval', () => {
    const warnings = getCspWarnings({ 'script-src': ["'unsafe-eval'"], 'object-src': ["'none'"] });
    expect(warnings.some(w => /unsafe-eval/.test(w.message))).toBe(true);
  });

  it('flags wildcard sources', () => {
    const warnings = getCspWarnings({ 'img-src': ['*'], 'object-src': ["'none'"] });
    expect(warnings.some(w => w.directive === 'img-src' && /any origin/.test(w.message))).toBe(true);
  });

  it('flags a missing object-src', () => {
    const warnings = getCspWarnings({ 'default-src': ["'self'"] });
    expect(warnings.some(w => /object-src/.test(w.message))).toBe(true);
  });

  it('returns no warnings for a tight policy', () => {
    const warnings = getCspWarnings({ 'default-src': ["'self'"], 'object-src': ["'none'"] });
    expect(warnings).toEqual([]);
  });
});

describe('buildMetaTag / buildHeaderLine', () => {
  it('wraps the policy in a meta tag', () => {
    expect(buildMetaTag("default-src 'self'")).toBe(
      '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">'
    );
  });

  it('formats the policy as an HTTP header line', () => {
    expect(buildHeaderLine("default-src 'self'")).toBe("Content-Security-Policy: default-src 'self'");
  });
});

describe('CSP_DIRECTIVES', () => {
  it('includes the common fetch and document directives', () => {
    expect(CSP_DIRECTIVES).toContain('default-src');
    expect(CSP_DIRECTIVES).toContain('script-src');
    expect(CSP_DIRECTIVES).toContain('object-src');
    expect(CSP_DIRECTIVES).toContain('frame-ancestors');
  });
});

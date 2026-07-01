import { describe, it, expect } from 'vitest';
import { formatXml } from '../../lib/xml';

describe('formatXml', () => {
  it('returns empty output for empty input', () => {
    const result = formatXml('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = formatXml('   \n  ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a simple element', () => {
    const result = formatXml('<root></root>');
    expect(result.error).toBeNull();
    expect(result.output).toContain('<root');
  });

  it('indents child elements', () => {
    const result = formatXml('<root><child>text</child></root>');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^\s{2}<child>/m);
  });

  it('uses 4-space indent when specified', () => {
    const result = formatXml('<root><child>text</child></root>', 4);
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^\s{4}<child>/m);
  });

  it('handles deeply nested elements', () => {
    const result = formatXml('<a><b><c>val</c></b></a>');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^\s{4}<c>/m);
  });

  it('handles self-closing tags', () => {
    const result = formatXml('<root><br/></root>');
    expect(result.error).toBeNull();
    expect(result.output).toContain('br');
  });

  it('preserves element attributes', () => {
    const result = formatXml('<root id="1"><item key="a">val</item></root>');
    expect(result.error).toBeNull();
    expect(result.output).toContain('id="1"');
    expect(result.output).toContain('key="a"');
  });

  it('handles XML with a processing instruction', () => {
    // The DOM strips the XML declaration but preserves other PIs
    const result = formatXml('<?xml version="1.0"?><root/>');
    expect(result.error).toBeNull();
    expect(result.output).toContain('root');
  });

  it('returns error for invalid XML', () => {
    const result = formatXml('<root><unclosed>');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('returns error for malformed XML', () => {
    const result = formatXml('not xml at all <<<');
    expect(result.error).not.toBeNull();
  });

  it('handles XML with comments', () => {
    const result = formatXml('<root><!-- a comment --><child/></root>');
    expect(result.error).toBeNull();
    expect(result.output).toContain('a comment');
  });

  it('handles multiple sibling elements under root', () => {
    const result = formatXml('<root><a>1</a><b>2</b><c>3</c></root>');
    expect(result.error).toBeNull();
    const lines = result.output.split('\n').filter(Boolean);
    const indented = lines.filter(l => l.startsWith('  '));
    expect(indented.length).toBeGreaterThanOrEqual(3);
  });

  it('inline text stays on same line as element', () => {
    const result = formatXml('<root><item>hello</item></root>');
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/<item>hello<\/item>/);
  });
});

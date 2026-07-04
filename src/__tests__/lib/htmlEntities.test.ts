import { describe, it, expect } from 'vitest';
import { encodeHtmlEntities, decodeHtmlEntities } from '../../lib/htmlEntities';

describe('encodeHtmlEntities', () => {
  it('encodes the five reserved XML characters', () => {
    expect(encodeHtmlEntities('<div class="a">A & B\'s</div>')).toBe(
      '&lt;div class=&quot;a&quot;&gt;A &amp; B&#39;s&lt;/div&gt;'
    );
  });

  it('handles empty string', () => {
    expect(encodeHtmlEntities('')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(encodeHtmlEntities('hello world 123')).toBe('hello world 123');
  });

  it('encodes only named entities in named mode', () => {
    expect(encodeHtmlEntities('<b>café</b>', 'named')).toBe('&lt;b&gt;café&lt;/b&gt;');
  });

  it('encodes non-ASCII as numeric entities in all mode', () => {
    expect(encodeHtmlEntities('café', 'all')).toBe('caf&#233;');
  });

  it('encodes ASCII reserved chars the same in all modes', () => {
    expect(encodeHtmlEntities('<a>', 'all')).toBe('&lt;a&gt;');
  });
});

describe('decodeHtmlEntities', () => {
  it('decodes named entities', () => {
    expect(decodeHtmlEntities('&lt;div class=&quot;a&quot;&gt;A &amp; B&#39;s&lt;/div&gt;')).toBe(
      '<div class="a">A & B\'s</div>'
    );
  });

  it('decodes numeric decimal entities', () => {
    expect(decodeHtmlEntities('caf&#233;')).toBe('café');
  });

  it('decodes numeric hex entities', () => {
    expect(decodeHtmlEntities('caf&#xe9;')).toBe('café');
    expect(decodeHtmlEntities('caf&#xE9;')).toBe('café');
  });

  it('handles empty string', () => {
    expect(decodeHtmlEntities('')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(decodeHtmlEntities('hello world 123')).toBe('hello world 123');
  });

  it('decodes common named entities like &nbsp; &copy; &mdash;', () => {
    expect(decodeHtmlEntities('a&nbsp;b&copy;c&mdash;d')).toBe('a b©c—d');
  });

  it('leaves unknown entities unchanged', () => {
    expect(decodeHtmlEntities('&notarealentity;')).toBe('&notarealentity;');
  });

  it('round-trips correctly', () => {
    const original = '<script>alert("XSS & fun")</script>';
    expect(decodeHtmlEntities(encodeHtmlEntities(original))).toBe(original);
  });
});

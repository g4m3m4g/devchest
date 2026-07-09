import { describe, it, expect } from 'vitest';
import { convertHtmlToMarkdown } from '../../lib/htmlToMarkdown';

describe('convertHtmlToMarkdown', () => {
  it('converts headings', () => {
    expect(convertHtmlToMarkdown('<h1>Title</h1>')).toBe('# Title');
    expect(convertHtmlToMarkdown('<h2>Sub</h2>')).toBe('## Sub');
    expect(convertHtmlToMarkdown('<h3>Sub</h3>')).toBe('### Sub');
  });

  it('converts paragraphs with a blank line between them', () => {
    expect(convertHtmlToMarkdown('<p>First</p><p>Second</p>')).toBe('First\n\nSecond');
  });

  it('converts bold text', () => {
    expect(convertHtmlToMarkdown('<strong>bold</strong>')).toBe('**bold**');
    expect(convertHtmlToMarkdown('<b>bold</b>')).toBe('**bold**');
  });

  it('converts italic text', () => {
    expect(convertHtmlToMarkdown('<em>italic</em>')).toBe('_italic_');
    expect(convertHtmlToMarkdown('<i>italic</i>')).toBe('_italic_');
  });

  it('converts links', () => {
    expect(convertHtmlToMarkdown('<a href="https://example.com">text</a>')).toBe('[text](https://example.com)');
  });

  it('converts images', () => {
    expect(convertHtmlToMarkdown('<img src="pic.png" alt="A pic">')).toBe('![A pic](pic.png)');
  });

  it('converts inline code', () => {
    expect(convertHtmlToMarkdown('<code>const x = 1</code>')).toBe('`const x = 1`');
  });

  it('converts a fenced code block', () => {
    expect(convertHtmlToMarkdown('<pre><code>const x = 1;</code></pre>')).toBe('```\nconst x = 1;\n```');
  });

  it('converts unordered lists', () => {
    expect(convertHtmlToMarkdown('<ul><li>one</li><li>two</li></ul>')).toBe('- one\n- two');
  });

  it('converts ordered lists', () => {
    expect(convertHtmlToMarkdown('<ol><li>one</li><li>two</li></ol>')).toBe('1. one\n2. two');
  });

  it('converts blockquotes', () => {
    expect(convertHtmlToMarkdown('<blockquote>quoted text</blockquote>')).toBe('> quoted text');
  });

  it('converts horizontal rules', () => {
    expect(convertHtmlToMarkdown('<p>a</p><hr><p>b</p>')).toBe('a\n\n---\n\nb');
  });

  it('handles nested inline formatting', () => {
    expect(convertHtmlToMarkdown('<p>Some <strong>bold</strong> and <em>italic</em> text</p>')).toBe(
      'Some **bold** and _italic_ text'
    );
  });

  it('returns an empty string for empty input', () => {
    expect(convertHtmlToMarkdown('')).toBe('');
  });
});

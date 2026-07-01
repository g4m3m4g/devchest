import { describe, it, expect } from 'vitest';
import { renderMarkdown, formatMarkdown } from '../../lib/markdownFormatter';

describe('renderMarkdown', () => {
  it('returns empty html for empty input', () => {
    const result = renderMarkdown('');
    expect(result.html).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty html for whitespace-only input', () => {
    const result = renderMarkdown('   ');
    expect(result.html).toBe('');
    expect(result.error).toBeNull();
  });

  it('converts # heading to <h1>', () => {
    const result = renderMarkdown('# Hello');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<h1>');
    expect(result.html).toContain('Hello');
  });

  it('converts ## heading to <h2>', () => {
    const result = renderMarkdown('## Sub');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<h2>');
  });

  it('converts **bold** to <strong>', () => {
    const result = renderMarkdown('**bold**');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<strong>');
    expect(result.html).toContain('bold');
  });

  it('converts _italic_ to <em>', () => {
    const result = renderMarkdown('_italic_');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<em>');
  });

  it('converts `code` to <code>', () => {
    const result = renderMarkdown('`code`');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<code>');
  });

  it('converts fenced code block to <pre><code>', () => {
    const result = renderMarkdown('```js\nconst x = 1;\n```');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<pre>');
    expect(result.html).toContain('<code');
  });

  it('converts [text](url) to <a href>', () => {
    const result = renderMarkdown('[click](https://example.com)');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<a');
    expect(result.html).toContain('href=');
    expect(result.html).toContain('click');
  });

  it('converts unordered list to <ul><li>', () => {
    const result = renderMarkdown('- item one\n- item two');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<ul>');
    expect(result.html).toContain('<li>');
  });

  it('converts ordered list to <ol><li>', () => {
    const result = renderMarkdown('1. first\n2. second');
    expect(result.error).toBeNull();
    expect(result.html).toContain('<ol>');
    expect(result.html).toContain('<li>');
  });

  it('sanitizes script tags to prevent XSS', () => {
    const result = renderMarkdown('<script>alert("xss")</script>');
    expect(result.html).not.toContain('<script>');
  });

  it('sanitizes onerror attributes', () => {
    const result = renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(result.html).not.toContain('onerror');
  });
});

describe('formatMarkdown', () => {
  it('returns empty output for empty input', async () => {
    const result = await formatMarkdown('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', async () => {
    const result = await formatMarkdown('   ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('formats a heading', async () => {
    const result = await formatMarkdown('# Hello');
    expect(result.error).toBeNull();
    expect(result.output).toContain('# Hello');
  });

  it('normalizes list markers', async () => {
    const result = await formatMarkdown('* item one\n* item two');
    expect(result.error).toBeNull();
    expect(result.output).toContain('- item one');
  });

  it('preserves paragraphs', async () => {
    const result = await formatMarkdown('Hello world');
    expect(result.error).toBeNull();
    expect(result.output).toContain('Hello world');
  });

  it('formats bold text', async () => {
    const result = await formatMarkdown('__bold__');
    expect(result.error).toBeNull();
    expect(result.output).toContain('**bold**');
  });
});

import { describe, it, expect } from 'vitest';
import { minifyHtml, minifyCss, calcSavings } from '../../lib/minifiers';

describe('minifyHtml', () => {
  it('removes HTML comments', () => {
    expect(minifyHtml('<!-- comment --><p>hello</p>')).toBe('<p>hello</p>');
  });

  it('removes multi-line HTML comments', () => {
    expect(minifyHtml('<!--\n  multi\n  line\n--><p>ok</p>')).toBe('<p>ok</p>');
  });

  it('collapses whitespace between tags', () => {
    expect(minifyHtml('<div>   <span>   </span>   </div>')).toBe('<div><span></span></div>');
  });

  it('collapses multiple spaces', () => {
    expect(minifyHtml('<p>hello   world</p>')).toBe('<p>hello world</p>');
  });

  it('collapses newlines', () => {
    const input = '<p>\n  hello\n</p>';
    const result = minifyHtml(input);
    expect(result).not.toContain('\n');
  });

  it('trims leading and trailing whitespace', () => {
    expect(minifyHtml('  <p>hi</p>  ')).toBe('<p>hi</p>');
  });

  it('handles empty string', () => {
    expect(minifyHtml('')).toBe('');
  });

  it('handles string with only comments', () => {
    expect(minifyHtml('<!-- only a comment -->')).toBe('');
  });

  it('preserves tag content', () => {
    const result = minifyHtml('<h1>Title</h1><p>Body</p>');
    expect(result).toContain('Title');
    expect(result).toContain('Body');
  });
});

describe('minifyCss', () => {
  it('removes CSS comments', () => {
    expect(minifyCss('/* comment */ .a { color: red; }')).toBe('.a{color:red}');
  });

  it('removes multi-line CSS comments', () => {
    const input = '/*\n * multi-line\n */\n.a { color: red; }';
    const result = minifyCss(input);
    expect(result).not.toContain('multi-line');
    expect(result).toContain('color:red');
  });

  it('removes spaces around colons, semicolons, and braces', () => {
    expect(minifyCss('.a { color : red ; }')).toBe('.a{color:red}');
  });

  it('removes trailing semicolon before closing brace', () => {
    expect(minifyCss('.a { color: red; }')).toBe('.a{color:red}');
  });

  it('collapses newlines', () => {
    const input = '.a {\n  color: red;\n}';
    const result = minifyCss(input);
    expect(result).not.toContain('\n');
  });

  it('handles multiple rules', () => {
    const input = '.a { color: red; } .b { margin: 0; }';
    const result = minifyCss(input);
    expect(result).toBe('.a{color:red}.b{margin:0}');
  });

  it('handles empty string', () => {
    expect(minifyCss('')).toBe('');
  });

  it('handles string with only a comment', () => {
    expect(minifyCss('/* just a comment */')).toBe('');
  });
});

describe('calcSavings', () => {
  it('calculates percentage reduction correctly', () => {
    const result = calcSavings('0000000000', '00000');
    expect(result.original).toBe(10);
    expect(result.compressed).toBe(5);
    expect(result.pct).toBe(50);
  });

  it('returns 0% for identical strings', () => {
    const result = calcSavings('hello', 'hello');
    expect(result.pct).toBe(0);
  });

  it('returns 0% when original is empty', () => {
    const result = calcSavings('', '');
    expect(result.pct).toBe(0);
  });

  it('rounds percentage to nearest integer', () => {
    const result = calcSavings('000', '0');
    expect(result.pct).toBe(67);
  });
});

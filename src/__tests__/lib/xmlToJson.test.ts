import { describe, it, expect } from 'vitest';
import { xmlToJson } from '../../lib/xmlToJson';

describe('xmlToJson', () => {
  it('returns empty output for empty input', () => {
    const result = xmlToJson('');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('returns empty output for whitespace-only input', () => {
    const result = xmlToJson('   \n  ');
    expect(result.output).toBe('');
    expect(result.error).toBeNull();
  });

  it('converts a simple text element', () => {
    const result = xmlToJson('<root>hello</root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: 'hello' });
  });

  it('converts an empty element to an empty string', () => {
    const result = xmlToJson('<root></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: '' });
  });

  it('converts attributes with an @ prefix', () => {
    const result = xmlToJson('<root id="1"/>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { '@id': '1' } });
  });

  it('mixes attributes and text using #text', () => {
    const result = xmlToJson('<root id="1">hello</root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { '@id': '1', '#text': 'hello' } });
  });

  it('converts nested elements', () => {
    const result = xmlToJson('<root><child>text</child></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { child: 'text' } });
  });

  it('converts sibling elements with different tag names', () => {
    const result = xmlToJson('<root><a>1</a><b>2</b></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { a: '1', b: '2' } });
  });

  it('groups repeated sibling elements into an array', () => {
    const result = xmlToJson('<root><item>1</item><item>2</item></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { item: ['1', '2'] } });
  });

  it('handles deeply nested elements', () => {
    const result = xmlToJson('<a><b><c>val</c></b></a>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ a: { b: { c: 'val' } } });
  });

  it('handles self-closing child tags', () => {
    const result = xmlToJson('<root><br/></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { br: '' } });
  });

  it('ignores comments and processing instructions', () => {
    const result = xmlToJson('<?xml version="1.0"?><root><!-- a comment --><child>x</child></root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { child: 'x' } });
  });

  it('ignores whitespace-only text between elements', () => {
    const result = xmlToJson('<root>\n  <a>1</a>\n  <b>2</b>\n</root>');
    expect(result.error).toBeNull();
    expect(JSON.parse(result.output)).toEqual({ root: { a: '1', b: '2' } });
  });

  it('returns an error for invalid XML', () => {
    const result = xmlToJson('<root><unclosed>');
    expect(result.error).not.toBeNull();
    expect(result.output).toBe('');
  });

  it('returns an error for malformed XML', () => {
    const result = xmlToJson('not xml at all <<<');
    expect(result.error).not.toBeNull();
  });

  it('respects the indent parameter', () => {
    const result = xmlToJson('<root><child>x</child></root>', 4);
    expect(result.error).toBeNull();
    expect(result.output).toMatch(/^\s{8}"child"/m);
  });
});

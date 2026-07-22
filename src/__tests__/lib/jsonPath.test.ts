import { describe, it, expect } from 'vitest';
import { evaluateJsonPath } from '../../lib/jsonPath';

const store = {
  store: {
    book: [
      { category: 'fiction', author: 'A', title: 'Book A', price: 10 },
      { category: 'fiction', author: 'B', title: 'Book B', price: 20 },
      { category: 'reference', author: 'C', title: 'Book C', price: 5 },
    ],
    bicycle: { color: 'red', price: 15 },
  },
};

describe('evaluateJsonPath', () => {
  it('returns an error for empty JSON input', () => {
    const result = evaluateJsonPath('', '$.a');
    expect(result.matches).toEqual([]);
    expect(result.error).not.toBeNull();
  });

  it('returns an error for invalid JSON', () => {
    const result = evaluateJsonPath('{bad json}', '$.a');
    expect(result.error).not.toBeNull();
  });

  it('returns an error for an empty path', () => {
    const result = evaluateJsonPath('{"a":1}', '');
    expect(result.error).not.toBeNull();
  });

  it('resolves the root', () => {
    const result = evaluateJsonPath('{"a":1}', '$');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual([{ a: 1 }]);
  });

  it('resolves simple dot access', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$.store.bicycle.color');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['red']);
  });

  it('resolves bracket access with quoted keys', () => {
    const result = evaluateJsonPath(JSON.stringify(store), "$['store']['bicycle']['color']");
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['red']);
  });

  it('resolves numeric array index access', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$.store.book[0].title');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['Book A']);
  });

  it('resolves wildcard over array elements', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$.store.book[*].author');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['A', 'B', 'C']);
  });

  it('resolves wildcard over object values', () => {
    const result = evaluateJsonPath('{"a":1,"b":2}', '$.*');
    expect(result.error).toBeNull();
    expect(result.matches.sort()).toEqual([1, 2]);
  });

  it('resolves array slices', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$.store.book[0:2].title');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['Book A', 'Book B']);
  });

  it('resolves recursive descent', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$..author');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['A', 'B', 'C']);
  });

  it('resolves a filter expression with equality', () => {
    const result = evaluateJsonPath(JSON.stringify(store), "$.store.book[?(@.category=='reference')].title");
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['Book C']);
  });

  it('resolves a filter expression with a numeric comparison', () => {
    const result = evaluateJsonPath(JSON.stringify(store), '$.store.book[?(@.price<15)].title');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual(['Book A', 'Book C']);
  });

  it('returns no matches for a path that does not resolve', () => {
    const result = evaluateJsonPath('{"a":1}', '$.b.c');
    expect(result.error).toBeNull();
    expect(result.matches).toEqual([]);
  });

  it('returns an error for a malformed path', () => {
    const result = evaluateJsonPath('{"a":1}', '$.[');
    expect(result.error).not.toBeNull();
  });
});

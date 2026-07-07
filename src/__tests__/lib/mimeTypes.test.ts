import { describe, it, expect } from 'vitest';
import {
  normalizeExtension,
  lookupByExtension,
  lookupByMimeType,
  searchMimeTypes,
  MIME_TYPES,
} from '../../lib/mimeTypes';

describe('normalizeExtension', () => {
  it('handles a plain extension', () => {
    expect(normalizeExtension('png')).toBe('png');
  });

  it('strips a leading dot', () => {
    expect(normalizeExtension('.png')).toBe('png');
  });

  it('extracts the extension from a filename', () => {
    expect(normalizeExtension('photo.PNG')).toBe('png');
  });

  it('extracts the extension from a multi-dot filename', () => {
    expect(normalizeExtension('archive.tar.gz')).toBe('gz');
  });

  it('lowercases the result', () => {
    expect(normalizeExtension('JPG')).toBe('jpg');
  });
});

describe('lookupByExtension', () => {
  it('finds a MIME type for a plain extension', () => {
    expect(lookupByExtension('png')?.mimeType).toBe('image/png');
  });

  it('finds a MIME type for a filename', () => {
    expect(lookupByExtension('report.pdf')?.mimeType).toBe('application/pdf');
  });

  it('is case-insensitive', () => {
    expect(lookupByExtension('.JPG')?.mimeType).toBe('image/jpeg');
  });

  it('returns null for an unknown extension', () => {
    expect(lookupByExtension('notarealext')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(lookupByExtension('')).toBeNull();
  });
});

describe('lookupByMimeType', () => {
  it('finds extensions for a known MIME type', () => {
    expect(lookupByMimeType('image/jpeg')?.extensions).toEqual(['jpg', 'jpeg']);
  });

  it('is case-insensitive', () => {
    expect(lookupByMimeType('IMAGE/PNG')?.mimeType).toBe('image/png');
  });

  it('returns null for an unknown MIME type', () => {
    expect(lookupByMimeType('application/x-not-real')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(lookupByMimeType('')).toBeNull();
  });
});

describe('searchMimeTypes', () => {
  it('returns every entry for an empty query', () => {
    expect(searchMimeTypes('')).toEqual(MIME_TYPES);
  });

  it('matches by partial MIME type', () => {
    const results = searchMimeTypes('json');
    expect(results.some(e => e.mimeType === 'application/json')).toBe(true);
  });

  it('matches by extension', () => {
    const results = searchMimeTypes('svg');
    expect(results.some(e => e.mimeType === 'image/svg+xml')).toBe(true);
  });

  it('matches by category', () => {
    const results = searchMimeTypes('font');
    expect(results.length).toBeGreaterThanOrEqual(4);
    expect(results.every(e => e.category === 'Font')).toBe(true);
  });

  it('returns an empty array for no matches', () => {
    expect(searchMimeTypes('zzzznotreal')).toEqual([]);
  });
});

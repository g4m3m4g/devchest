import { describe, it, expect } from 'vitest';
import {
  compress,
  decompress,
  bytesToBase64,
  base64ToBytes,
  compressTextToBase64,
  decompressBase64ToText,
  type CompressionFormat,
} from '../../lib/gzipDeflate';

const FORMATS: CompressionFormat[] = ['gzip', 'deflate', 'deflate-raw'];

describe('compress / decompress', () => {
  it('round-trips an empty buffer for every format', async () => {
    for (const format of FORMATS) {
      const compressed = await compress(new Uint8Array(), format);
      const decompressed = await decompress(compressed, format);
      expect(decompressed).toEqual(new Uint8Array());
    }
  });

  it('round-trips ASCII text for every format', async () => {
    const input = new TextEncoder().encode('Hello, World! '.repeat(20));
    for (const format of FORMATS) {
      const compressed = await compress(input, format);
      const decompressed = await decompress(compressed, format);
      expect(Array.from(decompressed)).toEqual(Array.from(input));
    }
  });

  it('round-trips unicode text', async () => {
    const input = new TextEncoder().encode('Héllo, 世界 😀! '.repeat(10));
    const compressed = await compress(input, 'gzip');
    const decompressed = await decompress(compressed, 'gzip');
    expect(Array.from(decompressed)).toEqual(Array.from(input));
  });

  it('produces gzip output starting with the gzip magic bytes', async () => {
    const compressed = await compress(new TextEncoder().encode('test'), 'gzip');
    expect(compressed[0]).toBe(0x1f);
    expect(compressed[1]).toBe(0x8b);
  });

  it('produces deflate output starting with a zlib header byte', async () => {
    const compressed = await compress(new TextEncoder().encode('test'), 'deflate');
    expect(compressed[0]).toBe(0x78);
  });

  it('meaningfully shrinks highly repetitive input', async () => {
    const input = new TextEncoder().encode('a'.repeat(10000));
    const compressed = await compress(input, 'gzip');
    expect(compressed.length).toBeLessThan(input.length / 10);
  });

  it('rejects invalid compressed data', async () => {
    await expect(decompress(new Uint8Array([1, 2, 3, 4]), 'gzip')).rejects.toThrow(/Failed to decompress/);
  });
});

describe('bytesToBase64 / base64ToBytes', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = new Uint8Array([0, 1, 2, 255, 128, 64]);
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it('throws for invalid base64 input', () => {
    expect(() => base64ToBytes('not valid base64!!!')).toThrow(/Invalid Base64/);
  });
});

describe('compressTextToBase64 / decompressBase64ToText', () => {
  it('round-trips text through base64-encoded compression', async () => {
    const original = 'The quick brown fox jumps over the lazy dog. '.repeat(5);
    for (const format of FORMATS) {
      const encoded = await compressTextToBase64(original, format);
      const decoded = await decompressBase64ToText(encoded, format);
      expect(decoded).toBe(original);
    }
  });

  it('produces a printable base64 string', async () => {
    const encoded = await compressTextToBase64('hello', 'gzip');
    expect(encoded).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

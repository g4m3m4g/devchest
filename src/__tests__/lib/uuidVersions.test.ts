import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  generateUuidV1,
  generateUuidV3,
  generateUuidV5,
  generateUuidV7,
  isValidUuid,
  NAMESPACE_PRESETS,
} from '../../lib/uuidVersions';

const V1_V3_V5_V7_SHAPE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const DNS_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isValidUuid', () => {
  it('accepts a well-formed UUID', () => {
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });

  it('accepts uppercase UUIDs', () => {
    expect(isValidUuid('6BA7B810-9DAD-11D1-80B4-00C04FD430C8')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidUuid('not-a-uuid')).toBe(false);
    expect(isValidUuid('6ba7b810-9dad-11d1-80b4')).toBe(false);
    expect(isValidUuid('')).toBe(false);
  });
});

describe('NAMESPACE_PRESETS', () => {
  it('includes the well-known DNS, URL, OID, and X.500 namespaces', () => {
    const labels = NAMESPACE_PRESETS.map(p => p.label);
    expect(labels).toEqual(['DNS', 'URL', 'OID', 'X.500 DN']);
    for (const preset of NAMESPACE_PRESETS) {
      expect(isValidUuid(preset.value)).toBe(true);
    }
  });
});

describe('generateUuidV1', () => {
  it('produces a valid UUID shape with version nibble 1', () => {
    const uuid = generateUuidV1();
    expect(uuid).toMatch(V1_V3_V5_V7_SHAPE);
    expect(uuid[14]).toBe('1');
  });

  it('sets the RFC 4122 variant bits', () => {
    const uuid = generateUuidV1();
    const variantNibble = uuid[19];
    expect(['8', '9', 'a', 'b']).toContain(variantNibble);
  });

  it('produces distinct UUIDs on successive calls', () => {
    const a = generateUuidV1();
    const b = generateUuidV1();
    expect(a).not.toBe(b);
  });
});

describe('generateUuidV3 / generateUuidV5', () => {
  it('matches known RFC 4122 test vectors for DNS namespace + www.example.com', () => {
    expect(generateUuidV3('www.example.com', DNS_NAMESPACE)).toBe('5df41881-3aed-3515-88a7-2f4a814cf09e');
    expect(generateUuidV5('www.example.com', DNS_NAMESPACE)).toBe('2ed6657d-e927-568b-95e1-2665a8aea6a2');
  });

  it('is deterministic for the same name and namespace', () => {
    expect(generateUuidV3('foo', DNS_NAMESPACE)).toBe(generateUuidV3('foo', DNS_NAMESPACE));
    expect(generateUuidV5('foo', DNS_NAMESPACE)).toBe(generateUuidV5('foo', DNS_NAMESPACE));
  });

  it('produces different results for v3 vs v5 of the same input', () => {
    expect(generateUuidV3('foo', DNS_NAMESPACE)).not.toBe(generateUuidV5('foo', DNS_NAMESPACE));
  });

  it('sets version nibbles correctly', () => {
    expect(generateUuidV3('foo', DNS_NAMESPACE)[14]).toBe('3');
    expect(generateUuidV5('foo', DNS_NAMESPACE)[14]).toBe('5');
  });

  it('throws on an invalid namespace', () => {
    expect(() => generateUuidV3('foo', 'not-a-uuid')).toThrow();
    expect(() => generateUuidV5('foo', 'not-a-uuid')).toThrow();
  });
});

describe('generateUuidV7', () => {
  it('produces a valid UUID shape with version nibble 7', () => {
    const uuid = generateUuidV7();
    expect(uuid).toMatch(V1_V3_V5_V7_SHAPE);
    expect(uuid[14]).toBe('7');
  });

  it('sets the RFC 4122 variant bits', () => {
    const uuid = generateUuidV7();
    const variantNibble = uuid[19];
    expect(['8', '9', 'a', 'b']).toContain(variantNibble);
  });

  it('encodes the current millisecond timestamp in the first 48 bits', () => {
    const fixedNow = 1_700_000_000_000;
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow);
    const uuid = generateUuidV7();
    const timeHex = uuid.replace(/-/g, '').slice(0, 12);
    expect(BigInt('0x' + timeHex)).toBe(BigInt(fixedNow));
  });

  it('produces distinct UUIDs on successive calls', () => {
    const a = generateUuidV7();
    const b = generateUuidV7();
    expect(a).not.toBe(b);
  });
});

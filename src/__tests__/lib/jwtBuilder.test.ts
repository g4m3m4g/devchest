import { describe, it, expect } from 'vitest';
import { signJwtHs256, base64UrlEncode } from '../../lib/jwtBuilder';
import { decodeJwt } from '../../lib/jwt';

describe('base64UrlEncode', () => {
  it('encodes without padding and with URL-safe characters', () => {
    expect(base64UrlEncode('{"alg":"HS256","typ":"JWT"}')).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });
});

describe('signJwtHs256', () => {
  it('matches the well-known jwt.io HS256 example', () => {
    const payload = '{"sub":"1234567890","name":"John Doe","iat":1516239022}';
    const secret = 'your-256-bit-secret';
    const expected =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(signJwtHs256(payload, secret)).toBe(expected);
  });

  it('produces a token with three dot-separated parts', () => {
    const token = signJwtHs256('{"foo":"bar"}', 'secret');
    expect(token.split('.')).toHaveLength(3);
  });

  it('always forces the alg header claim to HS256 even if overridden', () => {
    const token = signJwtHs256('{"foo":"bar"}', 'secret', '{"alg":"none","typ":"JWT"}');
    const decoded = decodeJwt(token);
    expect(JSON.parse(decoded.header).alg).toBe('HS256');
  });

  it('merges custom header claims with the defaults', () => {
    const token = signJwtHs256('{"foo":"bar"}', 'secret', '{"kid":"key-1"}');
    const decoded = decodeJwt(token);
    const header = JSON.parse(decoded.header);
    expect(header).toEqual({ alg: 'HS256', typ: 'JWT', kid: 'key-1' });
  });

  it('produces a token whose payload round-trips through the JWT decoder', () => {
    const token = signJwtHs256('{"sub":"abc","role":"admin"}', 'secret');
    const decoded = decodeJwt(token);
    expect(decoded.payloadObj).toEqual({ sub: 'abc', role: 'admin' });
  });

  it('produces a different signature for a different secret', () => {
    const a = signJwtHs256('{"foo":"bar"}', 'secret-a');
    const b = signJwtHs256('{"foo":"bar"}', 'secret-b');
    expect(a).not.toBe(b);
  });

  it('throws for invalid payload JSON', () => {
    expect(() => signJwtHs256('not json', 'secret')).toThrow('Payload must be valid JSON');
  });

  it('throws for invalid header JSON', () => {
    expect(() => signJwtHs256('{}', 'secret', 'not json')).toThrow('Header must be valid JSON');
  });

  it('throws when the header JSON is not an object', () => {
    expect(() => signJwtHs256('{}', 'secret', '[1,2,3]')).toThrow('Header must be a JSON object');
  });
});

import { describe, it, expect } from 'vitest';
import { decodeCertificate } from '../../lib/certificate';

// Self-signed RSA-2048 test certificate generated with:
// openssl req -x509 -newkey rsa:2048 -days 3650 -nodes \
//   -subj "/C=US/ST=California/L=San Francisco/O=DevChest/OU=Engineering/CN=devchest.example.com" \
//   -addext "subjectAltName=DNS:devchest.example.com,DNS:www.devchest.example.com,IP:127.0.0.1"
const RSA_CERT = `-----BEGIN CERTIFICATE-----
MIIEKjCCAxKgAwIBAgIUQjg1sm7reDwZKzBxkPP16j4Ng/8wDQYJKoZIhvcNAQEL
BQAwgYIxCzAJBgNVBAYTAlVTMRMwEQYDVQQIDApDYWxpZm9ybmlhMRYwFAYDVQQH
DA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhEZXZDaGVzdDEUMBIGA1UECwwLRW5n
aW5lZXJpbmcxHTAbBgNVBAMMFGRldmNoZXN0LmV4YW1wbGUuY29tMB4XDTI2MDcx
MTEzMjEyNloXDTM2MDcwODEzMjEyNlowgYIxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
DApDYWxpZm9ybmlhMRYwFAYDVQQHDA1TYW4gRnJhbmNpc2NvMREwDwYDVQQKDAhE
ZXZDaGVzdDEUMBIGA1UECwwLRW5naW5lZXJpbmcxHTAbBgNVBAMMFGRldmNoZXN0
LmV4YW1wbGUuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnx8y
xEe4WaWz/4m8A/QBzWr1npYq3PrGR9fgaeeg9piskqviwkJcuJ3qQK6EtS2542oX
6WopWMw1zm05YmAQliWmPbMHM76Pv+ZofdWnP2/hoi2460PusqNjtU3Ra0Yfwkhl
CQ2h1nEQ4AB5eeUIJ+MJYJgONcp26fdHzrWRVADH4xiVn+eXI8Dr1UadPWfWc9Rl
mqpf5jYHSy0/luCB19dPvpbsQw2Z00zAx0s6vYSDikoFjHX3IczRSY7AnWze2vGy
498/SKLjk5o5pXaQI+HplLR+Iu/61UevtST5Ra5ArlQezOqYOcsef9NxIvAaLxJi
hF3g1c2CSmyA9jYYJQIDAQABo4GVMIGSMB0GA1UdDgQWBBTctegMc4ThtFt+jGAV
yNoj9+dD9jAfBgNVHSMEGDAWgBTctegMc4ThtFt+jGAVyNoj9+dD9jAPBgNVHRMB
Af8EBTADAQH/MD8GA1UdEQQ4MDaCFGRldmNoZXN0LmV4YW1wbGUuY29tghh3d3cu
ZGV2Y2hlc3QuZXhhbXBsZS5jb22HBH8AAAEwDQYJKoZIhvcNAQELBQADggEBAInb
MwcdB4JRSLB4ZYxHkyP4rg3jHHLHfZgqiWqdN3UUUwH9a8lOUcVGXSCRj0PbHK+x
OB3Vl8pPe+EUlRhzCQ+L4AmPhA+VaTQY6QcDKT4Ohsl2KaZZnq80OVV3CFMd46eh
uMw/NpaTsLWPQUWA3Oa1XvOqL0NezeZhr1YDCzCmj3EX9UWmVyyF+eUgPsMj0YtF
NVVFzCYylt8Es4RljKdra/HT7dQrlZol8N6Fb6aqzC2T38johepAaonn2Jt7WzKJ
twGlMPkBNhAdBgLym1zZgmg5fyJxzTJ+Awuic0Cr/z5TVmnlu/MA1LYu6g2aa7b1
ygWZt9RKun4JqKFy78A=
-----END CERTIFICATE-----`;

// Self-signed EC (P-256) test certificate generated with:
// openssl ecparam -name prime256v1 -genkey -noout -out ec.key
// openssl req -x509 -key ec.key -days 365 -subj "/CN=ec.example.com" -sha256
const EC_CERT = `-----BEGIN CERTIFICATE-----
MIIBhzCCAS2gAwIBAgIUVmtQmIWyNljqiSwSV60AXNcyTLcwCgYIKoZIzj0EAwIw
GTEXMBUGA1UEAwwOZWMuZXhhbXBsZS5jb20wHhcNMjYwNzExMTMyNDIwWhcNMjcw
NzExMTMyNDIwWjAZMRcwFQYDVQQDDA5lYy5leGFtcGxlLmNvbTBZMBMGByqGSM49
AgEGCCqGSM49AwEHA0IABAJ/sqlH+CrdbFARiR+ZV3zmlxdcZQlvXxxo6RmT19/L
gE9Oxb7Y0wCb2zsYp2rMd2HzijvM9qGH8YbCmlpyWbKjUzBRMB0GA1UdDgQWBBRj
/lOZrM2Hrb+j5l4K//3ggJfsgTAfBgNVHSMEGDAWgBRj/lOZrM2Hrb+j5l4K//3g
gJfsgTAPBgNVHRMBAf8EBTADAQH/MAoGCCqGSM49BAMCA0gAMEUCIQDKjQa6zrjI
DwjTPEI0TBcyGRgj1uVtLnbuFKCfe3dHmQIgbg0siao70zQ8Epxy2Vs61J4P0qjx
x0BuuixlIcP/cf8=
-----END CERTIFICATE-----`;

describe('decodeCertificate (RSA cert)', () => {
  it('extracts version, serial number, and signature algorithm', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.version).toBe(3);
    expect(cert.serialNumber).toBe('423835B26EEB783C192B307190F3F5EA3E0D83FF');
    expect(cert.signatureAlgorithm).toBe('SHA-256 with RSA');
  });

  it('extracts issuer and subject', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.subjectString).toBe('C=US, ST=California, L=San Francisco, O=DevChest, OU=Engineering, CN=devchest.example.com');
    expect(cert.issuerString).toBe(cert.subjectString);
    expect(cert.subject.find(a => a.shortName === 'CN')?.value).toBe('devchest.example.com');
  });

  it('extracts validity dates', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.notBefore.toISOString()).toBe('2026-07-11T13:21:26.000Z');
    expect(cert.notAfter.toISOString()).toBe('2036-07-08T13:21:26.000Z');
    expect(cert.isNotYetValid).toBe(false);
  });

  it('extracts the RSA public key algorithm and bit length', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.publicKeyAlgorithm).toBe('RSA');
    expect(cert.publicKeyBits).toBe(2048);
  });

  it('extracts subject alternative names', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.subjectAltNames).toContainEqual({ type: 'DNS', value: 'devchest.example.com' });
    expect(cert.subjectAltNames).toContainEqual({ type: 'DNS', value: 'www.devchest.example.com' });
    expect(cert.subjectAltNames).toContainEqual({ type: 'IP', value: '127.0.0.1' });
  });

  it('reports CA basic constraints', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.isCA).toBe(true);
  });

  it('computes SHA-1 and SHA-256 fingerprints matching openssl', async () => {
    const cert = await decodeCertificate(RSA_CERT);
    expect(cert.fingerprintSha1).toBe('5E435C3935D5C94E4F8C9E6827C7D1EB393F3C72');
    expect(cert.fingerprintSha256).toBe('1A0AC620EA9EE2E506A74FEFD3A1F9E2AA63929B8C60305D0D2D27F4D6C5CAF2');
  });
});

describe('decodeCertificate (EC cert)', () => {
  it('extracts EC public key algorithm, curve, and bit length', async () => {
    const cert = await decodeCertificate(EC_CERT);
    expect(cert.publicKeyAlgorithm).toBe('EC (P-256)');
    expect(cert.publicKeyBits).toBe(256);
  });

  it('extracts ECDSA signature algorithm', async () => {
    const cert = await decodeCertificate(EC_CERT);
    expect(cert.signatureAlgorithm).toBe('ECDSA with SHA-256');
  });

  it('extracts a single-CN subject with no SANs', async () => {
    const cert = await decodeCertificate(EC_CERT);
    expect(cert.subjectString).toBe('CN=ec.example.com');
    expect(cert.subjectAltNames).toEqual([]);
  });
});

describe('decodeCertificate error handling', () => {
  it('throws for malformed PEM input', async () => {
    await expect(decodeCertificate('not a certificate')).rejects.toThrow();
  });

  it('throws for an empty string', async () => {
    await expect(decodeCertificate('')).rejects.toThrow();
  });
});

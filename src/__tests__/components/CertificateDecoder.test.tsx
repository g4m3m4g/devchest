import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CertificateDecoder from '../../components/tools/generators/CertificateDecoder';

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

describe('CertificateDecoder', () => {
  it('renders the tool title', () => {
    render(<CertificateDecoder />);
    expect(screen.getByText('Certificate Decoder')).toBeInTheDocument();
  });

  it('shows an empty state before a certificate is pasted', () => {
    render(<CertificateDecoder />);
    expect(screen.getByText(/Paste a PEM certificate/)).toBeInTheDocument();
  });

  it('decodes subject, issuer, and validity fields', async () => {
    render(<CertificateDecoder />);
    fireEvent.change(screen.getByPlaceholderText(/BEGIN CERTIFICATE/), { target: { value: RSA_CERT } });

    await waitFor(() => {
      expect(document.body).toHaveTextContent('devchest.example.com');
    });
    expect(document.body).toHaveTextContent('SHA-256 with RSA');
    expect(document.body).toHaveTextContent('RSA');
    expect(document.body).toHaveTextContent('2048');
  });

  it('lists subject alternative names', async () => {
    render(<CertificateDecoder />);
    fireEvent.change(screen.getByPlaceholderText(/BEGIN CERTIFICATE/), { target: { value: RSA_CERT } });

    await waitFor(() => expect(screen.getByText('www.devchest.example.com')).toBeInTheDocument());
    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
  });

  it('shows fingerprints matching openssl output', async () => {
    render(<CertificateDecoder />);
    fireEvent.change(screen.getByPlaceholderText(/BEGIN CERTIFICATE/), { target: { value: RSA_CERT } });

    await waitFor(() => {
      expect(document.body).toHaveTextContent('1A0AC620EA9EE2E506A74FEFD3A1F9E2AA63929B8C60305D0D2D27F4D6C5CAF2');
    });
  });

  it('shows an error for malformed input', async () => {
    render(<CertificateDecoder />);
    fireEvent.change(screen.getByPlaceholderText(/BEGIN CERTIFICATE/), { target: { value: 'not a certificate' } });

    await waitFor(() => expect(screen.getByText(/unable to decode|invalid/i)).toBeInTheDocument());
  });

  it('clears the certificate', async () => {
    render(<CertificateDecoder />);
    fireEvent.change(screen.getByPlaceholderText(/BEGIN CERTIFICATE/), { target: { value: RSA_CERT } });
    await waitFor(() => expect(document.body).toHaveTextContent('devchest.example.com'));

    fireEvent.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Paste a PEM certificate/)).toBeInTheDocument();
  });
});

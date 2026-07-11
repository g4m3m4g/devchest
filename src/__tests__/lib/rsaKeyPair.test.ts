import { describe, it, expect } from 'vitest';
import { generateRsaKeyPair, pemToArrayBuffer } from '../../lib/rsaKeyPair';

describe('generateRsaKeyPair', () => {
  it('produces PEM-wrapped public and private keys', async () => {
    const { publicKey, privateKey } = await generateRsaKeyPair({ modulusLength: 2048 });
    expect(publicKey).toMatch(/^-----BEGIN PUBLIC KEY-----\n[\s\S]+\n-----END PUBLIC KEY-----$/);
    expect(privateKey).toMatch(/^-----BEGIN PRIVATE KEY-----\n[\s\S]+\n-----END PRIVATE KEY-----$/);
  }, 20000);

  it('produces different key pairs across calls', async () => {
    const a = await generateRsaKeyPair({ modulusLength: 2048 });
    const b = await generateRsaKeyPair({ modulusLength: 2048 });
    expect(a.publicKey).not.toBe(b.publicKey);
  }, 20000);

  it('produces keys usable for RSA-OAEP encrypt/decrypt', async () => {
    const { publicKey, privateKey } = await generateRsaKeyPair({ modulusLength: 2048, algorithm: 'RSA-OAEP', hash: 'SHA-256' });

    const pubKey = await crypto.subtle.importKey(
      'spki', pemToArrayBuffer(publicKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']
    );
    const privKey = await crypto.subtle.importKey(
      'pkcs8', pemToArrayBuffer(privateKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['decrypt']
    );

    const plaintext = new TextEncoder().encode('hello rsa');
    const ciphertext = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, plaintext);
    const decrypted = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, privKey, ciphertext);

    expect(new TextDecoder().decode(decrypted)).toBe('hello rsa');
  }, 20000);

  it('produces keys usable for RSASSA-PKCS1-v1_5 sign/verify', async () => {
    const { publicKey, privateKey } = await generateRsaKeyPair({ modulusLength: 2048, algorithm: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' });

    const pubKey = await crypto.subtle.importKey(
      'spki', pemToArrayBuffer(publicKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['verify']
    );
    const privKey = await crypto.subtle.importKey(
      'pkcs8', pemToArrayBuffer(privateKey), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, true, ['sign']
    );

    const message = new TextEncoder().encode('sign me');
    const signature = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, privKey, message);
    const valid = await crypto.subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, pubKey, signature, message);

    expect(valid).toBe(true);
  }, 20000);

  it('defaults to a 2048-bit RSA-OAEP SHA-256 key pair', async () => {
    const { publicKey } = await generateRsaKeyPair();
    const pubKey = await crypto.subtle.importKey(
      'spki', pemToArrayBuffer(publicKey), { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']
    );
    expect(pubKey.algorithm.name).toBe('RSA-OAEP');
  }, 20000);
});

describe('pemToArrayBuffer', () => {
  it('round-trips through base64 encoding', async () => {
    const { publicKey } = await generateRsaKeyPair({ modulusLength: 2048 });
    const buffer = pemToArrayBuffer(publicKey);
    expect(buffer.byteLength).toBeGreaterThan(0);
  }, 20000);
});

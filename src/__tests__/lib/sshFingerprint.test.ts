import { describe, it, expect } from 'vitest';
import { parseOpenSshPublicKey, getSshFingerprint } from '../../lib/sshFingerprint';

// Real keys generated with:
// ssh-keygen -t rsa -b 2048 -f sshkey_rsa -N "" -C "test@devchest"
// ssh-keygen -t ed25519 -f sshkey_ed -N "" -C "test@devchest"
const RSA_PUB =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC96IE89L9kexvQMQlJ8KdUODJr0qbjdQZVeyYM1bTWVVNOAz6NQkFJFRjGe4UNfEECN3VSe24n73d+SzXtSzKp01jcf1I3bvLpKA+GHc/OjEWjJ6/xm/36q9N2SkKlx+pMHClCAhiiS80PSEZpsA89/BY7N8dYAg9At/IbXHKChnDh/dpgLhayt7to56FU1kpWW+7b56EuRTvaTBL1ZYSIsmdKN7b9/CzvrEFz5Cd+Wy3bzX98TTP/cM1ETXfF7tuue8tVRjnqDHEPdl1G4/ubTBoy1pWHFE5AhrBNUEsFo/JOF5Gx6FriUk9O3hDDUZvNzA/O0BeAuejP+IbhU8wT test@devchest';

const ED25519_PUB =
  'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIHHfbFK8a5R0CIH/UdK9BvyF1V3FToyoLyh448VYEEIQ test@devchest';

describe('parseOpenSshPublicKey', () => {
  it('parses key type, blob, and comment', () => {
    const parsed = parseOpenSshPublicKey(RSA_PUB);
    expect(parsed.keyType).toBe('ssh-rsa');
    expect(parsed.comment).toBe('test@devchest');
    expect(parsed.blob.length).toBeGreaterThan(0);
  });

  it('handles keys with multi-word comments', () => {
    const parsed = parseOpenSshPublicKey(`${RSA_PUB} extra words`);
    expect(parsed.comment).toBe('test@devchest extra words');
  });

  it('handles keys with no comment', () => {
    const [type, blob] = RSA_PUB.split(' ');
    const parsed = parseOpenSshPublicKey(`${type} ${blob}`);
    expect(parsed.comment).toBe('');
  });

  it('throws for malformed input', () => {
    expect(() => parseOpenSshPublicKey('not a valid key')).toThrow();
    expect(() => parseOpenSshPublicKey('')).toThrow();
    expect(() => parseOpenSshPublicKey('ssh-rsa not-base64!!!')).toThrow();
  });

  it('throws when the declared type does not match the encoded blob', () => {
    const [, blob] = ED25519_PUB.split(' ');
    expect(() => parseOpenSshPublicKey(`ssh-rsa ${blob}`)).toThrow();
  });
});

describe('getSshFingerprint (RSA)', () => {
  it('matches ssh-keygen output for MD5 and SHA256', async () => {
    const result = await getSshFingerprint(RSA_PUB);
    expect(result.keyType).toBe('ssh-rsa');
    expect(result.bits).toBe(2048);
    expect(result.comment).toBe('test@devchest');
    expect(result.md5).toBe('e8:ec:66:67:6d:49:23:fc:90:7d:db:0e:4d:7d:bf:fa');
    expect(result.sha256).toBe('SHA256:bTu3idktlIyj6XY6batkICks9E+MeTgNtOUTCcV/dt4');
  });
});

describe('getSshFingerprint (Ed25519)', () => {
  it('matches ssh-keygen output for MD5 and SHA256', async () => {
    const result = await getSshFingerprint(ED25519_PUB);
    expect(result.keyType).toBe('ssh-ed25519');
    expect(result.bits).toBe(256);
    expect(result.md5).toBe('ff:b8:95:ec:46:e7:f4:b6:61:e1:6e:8f:95:60:a5:ef');
    expect(result.sha256).toBe('SHA256:sCfbZDwp5oP1Syvr4Y2wkEyjmgW6ML8IfQeg2Dy1bX0');
  });
});

describe('getSshFingerprint error handling', () => {
  it('throws for malformed input', async () => {
    await expect(getSshFingerprint('garbage')).rejects.toThrow();
  });
});

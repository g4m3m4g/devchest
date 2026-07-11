import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SshFingerprintTool from '../../components/tools/generators/SshFingerprintTool';

const RSA_PUB =
  'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC96IE89L9kexvQMQlJ8KdUODJr0qbjdQZVeyYM1bTWVVNOAz6NQkFJFRjGe4UNfEECN3VSe24n73d+SzXtSzKp01jcf1I3bvLpKA+GHc/OjEWjJ6/xm/36q9N2SkKlx+pMHClCAhiiS80PSEZpsA89/BY7N8dYAg9At/IbXHKChnDh/dpgLhayt7to56FU1kpWW+7b56EuRTvaTBL1ZYSIsmdKN7b9/CzvrEFz5Cd+Wy3bzX98TTP/cM1ETXfF7tuue8tVRjnqDHEPdl1G4/ubTBoy1pWHFE5AhrBNUEsFo/JOF5Gx6FriUk9O3hDDUZvNzA/O0BeAuejP+IbhU8wT test@devchest';

describe('SshFingerprintTool', () => {
  it('renders the tool title', () => {
    render(<SshFingerprintTool />);
    expect(screen.getByText('SSH Key Fingerprint')).toBeInTheDocument();
  });

  it('shows an empty state before a key is pasted', () => {
    render(<SshFingerprintTool />);
    expect(screen.getByText(/Paste an SSH public key/)).toBeInTheDocument();
  });

  it('computes MD5 and SHA256 fingerprints matching ssh-keygen', async () => {
    render(<SshFingerprintTool />);
    fireEvent.change(screen.getByPlaceholderText(/ssh-rsa/), { target: { value: RSA_PUB } });

    await waitFor(() => {
      expect(document.body).toHaveTextContent('SHA256:bTu3idktlIyj6XY6batkICks9E+MeTgNtOUTCcV/dt4');
    });
    expect(document.body).toHaveTextContent('e8:ec:66:67:6d:49:23:fc:90:7d:db:0e:4d:7d:bf:fa');
    expect(document.body).toHaveTextContent('2048');
    expect(document.body).toHaveTextContent('test@devchest');
  });

  it('shows an error for malformed input', async () => {
    render(<SshFingerprintTool />);
    fireEvent.change(screen.getByPlaceholderText(/ssh-rsa/), { target: { value: 'not a valid key' } });

    await waitFor(() => expect(screen.getByText(/invalid|unable/i)).toBeInTheDocument());
  });

  it('clears the key', async () => {
    render(<SshFingerprintTool />);
    fireEvent.change(screen.getByPlaceholderText(/ssh-rsa/), { target: { value: RSA_PUB } });
    await waitFor(() => expect(document.body).toHaveTextContent('2048'));

    fireEvent.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Paste an SSH public key/)).toBeInTheDocument();
  });

  it('copies the SHA256 fingerprint to clipboard', async () => {
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<SshFingerprintTool />);
    fireEvent.change(screen.getByPlaceholderText(/ssh-rsa/), { target: { value: RSA_PUB } });
    await waitFor(() => expect(document.body).toHaveTextContent('2048'));

    fireEvent.click(screen.getByTitle('Copy SHA256 fingerprint'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RsaKeyPairGenerator from '../../components/tools/generators/RsaKeyPairGenerator';
import * as rsaKeyPairLib from '../../lib/rsaKeyPair';

describe('RsaKeyPairGenerator', () => {
  it('renders the tool title', () => {
    render(<RsaKeyPairGenerator />);
    expect(screen.getByText('RSA Key Pair Generator')).toBeInTheDocument();
  });

  it('shows an empty state before generation', () => {
    render(<RsaKeyPairGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates a PEM-encoded public and private key pair', async () => {
    const user = userEvent.setup();
    render(<RsaKeyPairGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));

    await waitFor(() => {
      expect(screen.getByTestId('public-key').textContent).toMatch(/BEGIN PUBLIC KEY/);
      expect(screen.getByTestId('private-key').textContent).toMatch(/BEGIN PRIVATE KEY/);
    }, { timeout: 10000 });
  }, 15000);

  it('shows a generating state while the key pair is being created', async () => {
    const user = userEvent.setup();
    let resolveKeyPair: (value: { publicKey: string; privateKey: string }) => void = () => {};
    const pending = new Promise<{ publicKey: string; privateKey: string }>(resolve => { resolveKeyPair = resolve; });
    const spy = vi.spyOn(rsaKeyPairLib, 'generateRsaKeyPair').mockReturnValue(pending);

    render(<RsaKeyPairGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled();

    resolveKeyPair({ publicKey: '-----BEGIN PUBLIC KEY-----\nAAA\n-----END PUBLIC KEY-----', privateKey: '-----BEGIN PRIVATE KEY-----\nBBB\n-----END PRIVATE KEY-----' });
    await waitFor(() => expect(screen.queryByRole('button', { name: /generating/i })).not.toBeInTheDocument());
    spy.mockRestore();
  }, 15000);

  it('clears the generated key pair', async () => {
    const user = userEvent.setup();
    render(<RsaKeyPairGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(screen.getByTestId('public-key')).toBeInTheDocument(), { timeout: 10000 });

    fireEvent.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  }, 15000);

  it('copies the public key to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<RsaKeyPairGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => expect(screen.getByTestId('public-key')).toBeInTheDocument(), { timeout: 10000 });

    await user.click(screen.getByTitle('Copy public key'));
    expect(writeTextFn).toHaveBeenCalled();
  }, 15000);
});

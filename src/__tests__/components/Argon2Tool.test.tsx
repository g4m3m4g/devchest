import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Argon2Tool from '../../components/tools/generators/Argon2Tool';
import { isValidArgon2Hash, parseArgon2Hash, hashPassword } from '../../lib/argon2';

const FAST_OPTS = { timeCost: 1, memoryCost: 8, parallelism: 1, hashLength: 16 };

describe('Argon2Tool', () => {
  it('renders the tool title', () => {
    render(<Argon2Tool />);
    expect(screen.getByText('Argon2 Hash & Verify')).toBeInTheDocument();
  });

  it('shows an empty state before hashing', () => {
    render(<Argon2Tool />);
    expect(screen.getByText(/Click Hash/)).toBeInTheDocument();
  });

  it('produces a valid argon2id hash when Hash is clicked', async () => {
    const user = userEvent.setup();
    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/^memory/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/^time/i), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    const hash = screen.getByTestId('argon2-hash').textContent ?? '';
    expect(isValidArgon2Hash(hash)).toBe(true);
    expect(parseArgon2Hash(hash)?.memoryCost).toBe(8);
  }, 15000);

  it('verifies a matching password against a hash', async () => {
    const user = userEvent.setup();
    const hash = hashPassword('hunter2', FAST_OPTS);
    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByPlaceholderText(/argon2 hash/i), { target: { value: hash } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/match/i)).toBeInTheDocument();
  }, 15000);

  it('reports no match for an incorrect password', async () => {
    const user = userEvent.setup();
    const hash = hashPassword('hunter2', FAST_OPTS);
    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/argon2 hash/i), { target: { value: hash } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/no match/i)).toBeInTheDocument();
  }, 15000);

  it('shows an error for a malformed hash', async () => {
    const user = userEvent.setup();
    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByPlaceholderText(/argon2 hash/i), { target: { value: 'not-a-hash' } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('clears the hash panel', async () => {
    const user = userEvent.setup();
    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/^memory/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/^time/i), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Hash/)).toBeInTheDocument();
  }, 15000);

  it('copies the hash to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<Argon2Tool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/^memory/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/^time/i), { target: { value: '1' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  }, 15000);
});

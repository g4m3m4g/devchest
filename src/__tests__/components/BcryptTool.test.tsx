import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BcryptTool from '../../components/tools/generators/BcryptTool';
import { isValidBcryptHash, getHashRounds, hashPassword } from '../../lib/bcrypt';

describe('BcryptTool', () => {
  it('renders the tool title', () => {
    render(<BcryptTool />);
    expect(screen.getByText('Bcrypt Hash & Verify')).toBeInTheDocument();
  });

  it('shows an empty state before hashing', () => {
    render(<BcryptTool />);
    expect(screen.getByText(/Click Hash/)).toBeInTheDocument();
  });

  it('produces a valid bcrypt hash when Hash is clicked', async () => {
    const user = userEvent.setup();
    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '4' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    const hash = screen.getByTestId('bcrypt-hash').textContent ?? '';
    expect(isValidBcryptHash(hash)).toBe(true);
    expect(getHashRounds(hash)).toBe(4);
  });

  it('verifies a matching password against a hash', async () => {
    const user = userEvent.setup();
    const hash = hashPassword('hunter2', 4);
    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByPlaceholderText(/bcrypt hash/i), { target: { value: hash } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/match/i)).toBeInTheDocument();
  });

  it('reports no match for an incorrect password', async () => {
    const user = userEvent.setup();
    const hash = hashPassword('hunter2', 4);
    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'wrong' } });
    fireEvent.change(screen.getByPlaceholderText(/bcrypt hash/i), { target: { value: hash } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/no match/i)).toBeInTheDocument();
  });

  it('shows an error for a malformed hash', async () => {
    const user = userEvent.setup();
    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to verify/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByPlaceholderText(/bcrypt hash/i), { target: { value: 'not-a-hash' } });
    await user.click(screen.getByRole('button', { name: /verify/i }));
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('clears the hash panel', async () => {
    const user = userEvent.setup();
    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '4' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Hash/)).toBeInTheDocument();
  });

  it('copies the hash to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<BcryptTool />);
    fireEvent.change(screen.getByPlaceholderText(/password to hash/i), { target: { value: 'hunter2' } });
    fireEvent.change(screen.getByLabelText(/cost/i), { target: { value: '4' } });
    await user.click(screen.getByRole('button', { name: /^hash$/i }));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

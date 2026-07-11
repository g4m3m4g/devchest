import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CsrfTokenGenerator from '../../components/tools/generators/CsrfTokenGenerator';

describe('CsrfTokenGenerator', () => {
  it('renders the tool title', () => {
    render(<CsrfTokenGenerator />);
    expect(screen.getByText('CSRF Token Generator')).toBeInTheDocument();
  });

  it('shows an empty state before generation', () => {
    render(<CsrfTokenGenerator />);
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('generates a base64url token by default', async () => {
    const user = userEvent.setup();
    render(<CsrfTokenGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const token = screen.getByTestId('csrf-token').textContent ?? '';
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('switches to hex encoding', async () => {
    const user = userEvent.setup();
    render(<CsrfTokenGenerator />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'hex' } });
    await user.click(screen.getByRole('button', { name: /generate/i }));
    const token = screen.getByTestId('csrf-token').textContent ?? '';
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('shows the entropy in bits', async () => {
    const user = userEvent.setup();
    render(<CsrfTokenGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(screen.getByText(/256 bits/)).toBeInTheDocument();
  });

  it('shows example usage snippets', async () => {
    const user = userEvent.setup();
    render(<CsrfTokenGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    expect(document.body).toHaveTextContent('<input type="hidden"');
    expect(document.body).toHaveTextContent('X-CSRF-Token:');
  });

  it('clears the token', async () => {
    const user = userEvent.setup();
    render(<CsrfTokenGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate/)).toBeInTheDocument();
  });

  it('copies the token to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<CsrfTokenGenerator />);
    await user.click(screen.getByRole('button', { name: /generate/i }));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

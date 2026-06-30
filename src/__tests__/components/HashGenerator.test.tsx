import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HashGenerator from '../../components/tools/generators/HashGenerator';

describe('HashGenerator', () => {
  it('renders the tool title', () => {
    render(<HashGenerator />);
    expect(screen.getByText('Hash Generator')).toBeInTheDocument();
  });

  it('renders all four algorithm labels', () => {
    render(<HashGenerator />);
    expect(screen.getByText('MD5')).toBeInTheDocument();
    expect(screen.getByText('SHA-1')).toBeInTheDocument();
    expect(screen.getByText('SHA-256')).toBeInTheDocument();
    expect(screen.getByText('SHA-512')).toBeInTheDocument();
  });

  it('generates MD5 hash for input "hello"', async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const textarea = screen.getByPlaceholderText(/Type or paste text to hash/);
    await user.type(textarea, 'hello');
    // MD5 of "hello" = 5d41402abc4b2a76b9719d911017c592
    expect(screen.getByText('5d41402abc4b2a76b9719d911017c592')).toBeInTheDocument();
  });

  it('generates SHA-256 hash for input "hello"', async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const textarea = screen.getByPlaceholderText(/Type or paste text to hash/);
    await user.type(textarea, 'hello');
    // SHA-256 of "hello"
    expect(screen.getByText('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824')).toBeInTheDocument();
  });

  it('uppercase toggle changes hash output to uppercase', async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const textarea = screen.getByPlaceholderText(/Type or paste text to hash/);
    await user.type(textarea, 'hello');
    await user.click(screen.getByRole('checkbox', { name: /uppercase/i }));
    expect(screen.getByText('5D41402ABC4B2A76B9719D911017C592')).toBeInTheDocument();
  });

  it('shows input size information', async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const textarea = screen.getByPlaceholderText(/Type or paste text to hash/);
    await user.type(textarea, 'hello');
    expect(screen.getByText('5 chars', { exact: false })).toBeInTheDocument();
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<HashGenerator />);
    const textarea = screen.getByPlaceholderText(/Type or paste text to hash/) as HTMLTextAreaElement;
    await user.type(textarea, 'test');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes clipboard text on Paste click', async () => {
    const user = userEvent.setup();
    // Set clipboard mock AFTER userEvent.setup() to override any clipboard userEvent installs
    const readTextFn = vi.fn().mockResolvedValue('pasted text from clipboard');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });

    render(<HashGenerator />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    await waitFor(() => {
      const textarea = screen.getByPlaceholderText(/Type or paste text to hash/) as HTMLTextAreaElement;
      expect(textarea.value).toBe('pasted text from clipboard');
    });
  });
});

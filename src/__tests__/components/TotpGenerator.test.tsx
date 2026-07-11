import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TotpGenerator from '../../components/tools/generators/TotpGenerator';
import { generateTotp } from '../../lib/totp';

const SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('TotpGenerator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the tool title', () => {
    render(<TotpGenerator />);
    expect(screen.getByText('TOTP / 2FA Code Generator')).toBeInTheDocument();
  });

  it('shows an empty state before a secret is entered', () => {
    render(<TotpGenerator />);
    expect(screen.getByText(/Enter a secret/)).toBeInTheDocument();
  });

  it('displays the correct 6-digit code for a given secret', () => {
    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: SECRET } });
    const expected = generateTotp(SECRET, { timestamp: Date.now() });
    expect(screen.getByTestId('totp-code').textContent?.replace(/\s/g, '')).toBe(expected);
  });

  it('displays an 8-digit code when digits is set to 8', () => {
    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: SECRET } });
    fireEvent.change(screen.getByLabelText(/digits/i), { target: { value: '8' } });
    const expected = generateTotp(SECRET, { timestamp: Date.now(), digits: 8 });
    expect(screen.getByTestId('totp-code').textContent?.replace(/\s/g, '')).toBe(expected);
  });

  it('shows the remaining seconds until the next code', () => {
    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: SECRET } });
    expect(screen.getByText(/30s/)).toBeInTheDocument();
  });

  it('shows an error for an invalid secret', () => {
    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: '@@@invalid' } });
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('fills in a randomly generated secret', () => {
    render(<TotpGenerator />);
    fireEvent.click(screen.getByRole('button', { name: /generate secret/i }));
    expect((screen.getByPlaceholderText(/base32 secret/i) as HTMLInputElement).value.length).toBeGreaterThan(0);
  });

  it('clears the secret', () => {
    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: SECRET } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Enter a secret/)).toBeInTheDocument();
  });

  it('copies the code to clipboard', () => {
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<TotpGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/base32 secret/i), { target: { value: SECRET } });
    fireEvent.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

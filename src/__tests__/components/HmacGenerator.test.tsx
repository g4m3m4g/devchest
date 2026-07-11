import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HmacGenerator from '../../components/tools/generators/HmacGenerator';

describe('HmacGenerator', () => {
  it('renders the tool title', () => {
    render(<HmacGenerator />);
    expect(screen.getByText('HMAC Generator')).toBeInTheDocument();
  });

  it('shows placeholders when key and message are empty', () => {
    render(<HmacGenerator />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('computes HMAC-SHA256 and HMAC-SHA512 once key and message are provided', () => {
    render(<HmacGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: 'key' } });
    fireEvent.change(screen.getByPlaceholderText(/message/i), {
      target: { value: 'The quick brown fox jumps over the lazy dog' },
    });
    expect(screen.getByText('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8')).toBeInTheDocument();
    expect(
      screen.getByText('b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a')
    ).toBeInTheDocument();
  });

  it('switches to base64 output encoding', () => {
    render(<HmacGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: 'key' } });
    fireEvent.change(screen.getByPlaceholderText(/message/i), {
      target: { value: 'The quick brown fox jumps over the lazy dog' },
    });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'base64' } });
    expect(screen.getByText('97yD9DBThCSxMpjmqm+xQ+9NWaFJRhdZl0edvC0aPNg=')).toBeInTheDocument();
  });

  it('shows a placeholder again when the key is cleared', () => {
    render(<HmacGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: 'key' } });
    fireEvent.change(screen.getByPlaceholderText(/message/i), { target: { value: 'hello' } });
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: '' } });
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('clears key and message', async () => {
    const user = userEvent.setup();
    render(<HmacGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: 'key' } });
    fireEvent.change(screen.getByPlaceholderText(/message/i), { target: { value: 'hello' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByPlaceholderText(/secret key/i)).toHaveValue('');
    expect(screen.getByPlaceholderText(/message/i)).toHaveValue('');
  });

  it('copies the HMAC-SHA256 output to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<HmacGenerator />);
    fireEvent.change(screen.getByPlaceholderText(/secret key/i), { target: { value: 'key' } });
    fireEvent.change(screen.getByPlaceholderText(/message/i), { target: { value: 'hello' } });
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

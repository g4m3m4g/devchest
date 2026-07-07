import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PunycodeCoder from '../../components/tools/encoders/PunycodeCoder';

describe('PunycodeCoder', () => {
  it('renders the tool title', () => {
    render(<PunycodeCoder />);
    expect(screen.getByText('Punycode / IDN Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<PunycodeCoder />);
    expect(screen.getByText('Unicode Domain')).toBeInTheDocument();
    expect(screen.getByText('Punycode Output')).toBeInTheDocument();
  });

  it('encodes a unicode domain to its Punycode form', () => {
    render(<PunycodeCoder />);
    const textarea = screen.getByPlaceholderText('bücher.de');
    fireEvent.change(textarea, { target: { value: 'bücher.de' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('xn--bcher-kva.de');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<PunycodeCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Punycode Domain')).toBeInTheDocument();
    expect(screen.getByText('Decoded Domain')).toBeInTheDocument();
  });

  it('decodes a Punycode domain back to unicode', async () => {
    const user = userEvent.setup();
    render(<PunycodeCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText('xn--bcher-kva.de');
    fireEvent.change(textarea, { target: { value: 'xn--bcher-kva.de' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('bücher.de');
  });

  it('shows an error for an invalid Punycode label when decoding', async () => {
    const user = userEvent.setup();
    render(<PunycodeCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText('xn--bcher-kva.de');
    fireEvent.change(textarea, { target: { value: 'xn--!!!.com' } });
    expect(screen.getByText(/Invalid Punycode/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<PunycodeCoder />);
    const textarea = screen.getByPlaceholderText('bücher.de') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

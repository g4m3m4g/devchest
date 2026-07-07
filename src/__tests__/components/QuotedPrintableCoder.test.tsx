import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuotedPrintableCoder from '../../components/tools/encoders/QuotedPrintableCoder';

describe('QuotedPrintableCoder', () => {
  it('renders the tool title', () => {
    render(<QuotedPrintableCoder />);
    expect(screen.getByText('Quoted-Printable Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<QuotedPrintableCoder />);
    expect(screen.getByText('Raw Text')).toBeInTheDocument();
    expect(screen.getByText('Quoted-Printable Output')).toBeInTheDocument();
  });

  it('encodes text to quoted-printable', () => {
    render(<QuotedPrintableCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'café' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('caf=C3=A9');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<QuotedPrintableCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Quoted-Printable Text')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes quoted-printable text back to unicode', async () => {
    const user = userEvent.setup();
    render(<QuotedPrintableCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText('caf=C3=A9');
    fireEvent.change(textarea, { target: { value: 'caf=C3=A9' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('café');
  });

  it('shows an error for an invalid escape sequence when decoding', async () => {
    const user = userEvent.setup();
    render(<QuotedPrintableCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText('caf=C3=A9');
    fireEvent.change(textarea, { target: { value: 'bad=zz' } });
    expect(screen.getByText(/Invalid quoted-printable/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<QuotedPrintableCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

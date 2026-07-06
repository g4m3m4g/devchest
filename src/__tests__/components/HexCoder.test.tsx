import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HexCoder from '../../components/tools/encoders/HexCoder';

describe('HexCoder', () => {
  it('renders the tool title', () => {
    render(<HexCoder />);
    expect(screen.getByText('Hex Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<HexCoder />);
    expect(screen.getByText('Raw Text')).toBeInTheDocument();
    expect(screen.getByText('Hex Output')).toBeInTheDocument();
  });

  it('encodes text with a space delimiter by default', () => {
    render(<HexCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'Hi' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('48 69');
  });

  it('shows the delimiter and case toggles only when encoding', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    expect(screen.getByText('No delimiter')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.queryByText('No delimiter')).not.toBeInTheDocument();
  });

  it('encodes with no delimiter when selected', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    await user.click(screen.getByRole('button', { name: 'No delimiter' }));
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'Hi' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('4869');
  });

  it('encodes uppercase when selected', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    await user.click(screen.getByRole('button', { name: 'UPPERCASE' }));
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    fireEvent.change(textarea, { target: { value: 'Hi' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('48 69'.toUpperCase());
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Hex String')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes a hex string back to text', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/48 65 6c/);
    fireEvent.change(textarea, { target: { value: '48 69' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('Hi');
  });

  it('shows an error message for invalid hex input', async () => {
    const user = userEvent.setup();
    render(<HexCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/48 65 6c/);
    fireEvent.change(textarea, { target: { value: 'zz' } });
    expect(screen.getByText(/non-hexadecimal/)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<HexCoder />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

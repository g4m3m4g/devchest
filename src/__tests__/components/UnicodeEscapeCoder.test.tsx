import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnicodeEscapeCoder from '../../components/tools/encoders/UnicodeEscapeCoder';

describe('UnicodeEscapeCoder', () => {
  it('renders the tool title', () => {
    render(<UnicodeEscapeCoder />);
    expect(screen.getByText('Unicode Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<UnicodeEscapeCoder />);
    expect(screen.getByText('Raw Text')).toBeInTheDocument();
    expect(screen.getByText('Escaped Output')).toBeInTheDocument();
  });

  it('encodes non-ASCII characters as \\uXXXX by default', () => {
    render(<UnicodeEscapeCoder />);
    const textarea = screen.getByPlaceholderText(/café/);
    fireEvent.change(textarea, { target: { value: 'café' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('caf\\u00e9');
  });

  it('shows the style and scope toggles only when encoding', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    expect(screen.getByText('Non-ASCII only')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.queryByText('Non-ASCII only')).not.toBeInTheDocument();
  });

  it('encodes every character when "All characters" is selected', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: 'All characters' }));
    const textarea = screen.getByPlaceholderText(/café/);
    fireEvent.change(textarea, { target: { value: 'AB' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('\\u0041\\u0042');
  });

  it('switches escape style to CSS', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: 'CSS \\XXXX' }));
    const textarea = screen.getByPlaceholderText(/café/);
    fireEvent.change(textarea, { target: { value: 'café' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('caf\\e9 ');
  });

  it('switches escape style to Python', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: 'Python \\u/\\U' }));
    const textarea = screen.getByPlaceholderText(/café/);
    fireEvent.change(textarea, { target: { value: '😀' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('\\U0001f600');
  });

  it('switches escape style to U+XXXX', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: 'U+XXXX' }));
    const textarea = screen.getByPlaceholderText(/café/);
    fireEvent.change(textarea, { target: { value: 'é' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('U+00E9');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Escape Sequences')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes escape sequences back to text', async () => {
    const user = userEvent.setup();
    render(<UnicodeEscapeCoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/caf/);
    fireEvent.change(textarea, { target: { value: 'caf\\u00e9 \\u{1f600}' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('café 😀');
  });

  it('clears input on Clear click', () => {
    render(<UnicodeEscapeCoder />);
    const textarea = screen.getByPlaceholderText(/café/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

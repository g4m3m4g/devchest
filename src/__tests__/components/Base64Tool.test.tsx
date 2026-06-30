import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Base64Tool from '../../components/tools/encoders/Base64Tool';

describe('Base64Tool', () => {
  it('renders the tool title', () => {
    render(<Base64Tool />);
    expect(screen.getByText('Base64 Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<Base64Tool />);
    expect(screen.getByText('Plain Text')).toBeInTheDocument();
    expect(screen.getByText('Base64 Output')).toBeInTheDocument();
  });

  it('encodes text to Base64', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/);
    await user.type(textarea, 'hello');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('aGVsbG8=');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Base64 String')).toBeInTheDocument();
    expect(screen.getByText('Decoded Text')).toBeInTheDocument();
  });

  it('decodes Base64 to text', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/Paste Base64 string/);
    await user.type(textarea, 'aGVsbG8=');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('hello');
  });

  it('shows error for invalid Base64 in decode mode', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/Paste Base64 string/);
    await user.type(textarea, '!!!invalid!!!');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('[Error');
  });

  it('clears input and image on Clear click', async () => {
    const user = userEvent.setup();
    render(<Base64Tool />);
    const textarea = screen.getByPlaceholderText(/Enter text to encode/) as HTMLTextAreaElement;
    await user.type(textarea, 'test');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('renders image drop zone', () => {
    render(<Base64Tool />);
    expect(screen.getByText(/Drop an image/)).toBeInTheDocument();
  });
});

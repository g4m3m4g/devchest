import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GzipDeflateTool from '../../components/tools/encoders/GzipDeflateTool';
import { compressTextToBase64 } from '../../lib/gzipDeflate';

describe('GzipDeflateTool', () => {
  it('renders the tool title', () => {
    render(<GzipDeflateTool />);
    expect(screen.getByText('Gzip / Deflate Compress & Decompress')).toBeInTheDocument();
  });

  it('starts in compress mode with gzip selected', () => {
    render(<GzipDeflateTool />);
    expect(screen.getByText('Raw Text')).toBeInTheDocument();
    expect(screen.getByText('Base64 Compressed Output')).toBeInTheDocument();
  });

  it('compresses text and shows base64 output', async () => {
    render(<GzipDeflateTool />);
    const textarea = screen.getByPlaceholderText(/Enter text to compress/);
    fireEvent.change(textarea, { target: { value: 'hello world' } });

    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toMatch(/^[A-Za-z0-9+/]+=*$/);
      expect(pre?.textContent).not.toBe('');
    });
  });

  it('switches to decompress mode', async () => {
    const user = userEvent.setup();
    render(<GzipDeflateTool />);
    await user.click(screen.getByRole('button', { name: /decompress/i }));
    expect(screen.getByText('Base64 Compressed Data')).toBeInTheDocument();
    expect(screen.getByText('Decompressed Text')).toBeInTheDocument();
  });

  it('decompresses base64 data back to the original text', async () => {
    const user = userEvent.setup();
    const encoded = await compressTextToBase64('round trip me', 'gzip');

    render(<GzipDeflateTool />);
    await user.click(screen.getByRole('button', { name: /decompress/i }));
    const textarea = screen.getByPlaceholderText(/Paste Base64-encoded/);
    fireEvent.change(textarea, { target: { value: encoded } });

    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).toBe('round trip me');
    });
  });

  it('shows an error for invalid base64 input when decompressing', async () => {
    const user = userEvent.setup();
    render(<GzipDeflateTool />);
    await user.click(screen.getByRole('button', { name: /decompress/i }));
    const textarea = screen.getByPlaceholderText(/Paste Base64-encoded/);
    fireEvent.change(textarea, { target: { value: 'not valid base64!!!' } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid Base64/)).toBeInTheDocument();
    });
  });

  it('switches compression format', async () => {
    const user = userEvent.setup();
    render(<GzipDeflateTool />);
    await user.click(screen.getByRole('button', { name: 'Deflate' }));
    const textarea = screen.getByPlaceholderText(/Enter text to compress/);
    fireEvent.change(textarea, { target: { value: 'hello' } });

    await waitFor(() => {
      const pre = document.querySelector('pre');
      expect(pre?.textContent).not.toBe('');
    });
  });

  it('clears input on Clear click', () => {
    render(<GzipDeflateTool />);
    const textarea = screen.getByPlaceholderText(/Enter text to compress/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'test' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

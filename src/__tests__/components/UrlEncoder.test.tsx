import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UrlEncoder from '../../components/tools/encoders/UrlEncoder';

describe('UrlEncoder', () => {
  it('renders the tool title', () => {
    render(<UrlEncoder />);
    expect(screen.getByText('URL Encoder / Decoder')).toBeInTheDocument();
  });

  it('starts in encode mode', () => {
    render(<UrlEncoder />);
    expect(screen.getByText('Raw URL / Text')).toBeInTheDocument();
    expect(screen.getByText('Encoded Output')).toBeInTheDocument();
  });

  it('encodes special characters', async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);
    const textarea = screen.getByPlaceholderText(/https:\/\/example/);
    await user.type(textarea, 'hello world');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('hello%20world');
  });

  it('encodes ampersand', async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);
    const textarea = screen.getByPlaceholderText(/https:\/\/example/);
    await user.type(textarea, 'a&b');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('%26');
  });

  it('switches to decode mode', async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    expect(screen.getByText('Encoded URL')).toBeInTheDocument();
    expect(screen.getByText('Decoded URL')).toBeInTheDocument();
  });

  it('decodes encoded URL', async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);
    await user.click(screen.getByRole('button', { name: /decode/i }));
    const textarea = screen.getByPlaceholderText(/https%3A/);
    await user.type(textarea, 'hello%20world');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('hello world');
  });

  it('shows common encodings reference table', () => {
    render(<UrlEncoder />);
    expect(screen.getByText('Common Encodings')).toBeInTheDocument();
    expect(screen.getByText('%20')).toBeInTheDocument();
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<UrlEncoder />);
    const textarea = screen.getByPlaceholderText(/https:\/\/example/) as HTMLTextAreaElement;
    await user.type(textarea, 'test');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

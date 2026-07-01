import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HttpHeadersFormatter from '../../components/tools/formatters/HttpHeadersFormatter';

const PLACEHOLDER_SNIPPET = /HTTP\/1\.1 200 OK/;

describe('HttpHeadersFormatter', () => {
  it('renders the tool title', () => {
    render(<HttpHeadersFormatter />);
    expect(screen.getByText('HTTP Headers Formatter')).toBeInTheDocument();
  });

  it('renders Source and Formatted Output panels', () => {
    render(<HttpHeadersFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('renders Formatted and Table tab buttons', () => {
    render(<HttpHeadersFormatter />);
    expect(screen.getByRole('button', { name: /formatted/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /table/i })).toBeInTheDocument();
  });

  it('renders Sort Headers and Canonical Case toggle buttons', () => {
    render(<HttpHeadersFormatter />);
    expect(screen.getByRole('button', { name: /sort headers/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /canonical case/i })).toBeInTheDocument();
  });

  // ── formatted tab ─────────────────────────────────────────────────────────
  it('shows formatted output in the pre element', () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'Content-Type: application/json\nHost: example.com' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('Content-Type: application/json');
    expect(pre?.textContent).toContain('Host: example.com');
  });

  it('shows status line + blank line + headers in formatted view', () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'HTTP/1.1 200 OK\nContent-Type: text/html' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toMatch(/HTTP\/1\.1 200 OK/);
    expect(pre?.textContent).toContain('Content-Type: text/html');
  });

  // ── table tab ─────────────────────────────────────────────────────────────
  it('switches to table view and shows header names and values', async () => {
    const user = userEvent.setup();
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'Content-Type: application/json\nHost: example.com' },
    });
    await user.click(screen.getByRole('button', { name: /table/i }));
    expect(screen.getByText('Content-Type')).toBeInTheDocument();
    expect(screen.getByText('application/json')).toBeInTheDocument();
    expect(screen.getByText('Host')).toBeInTheDocument();
    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('shows status line badge in table view', async () => {
    const user = userEvent.setup();
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'HTTP/1.1 201 Created\nLocation: /users/1' },
    });
    await user.click(screen.getByRole('button', { name: /table/i }));
    expect(document.body.textContent).toContain('HTTP/1.1 201 Created');
  });

  it('shows header count in table tab label', async () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'A: 1\nB: 2\nC: 3' },
    });
    expect(screen.getByRole('button', { name: /table \(3\)/i })).toBeInTheDocument();
  });

  // ── Sort Headers toggle ───────────────────────────────────────────────────
  it('sorts headers when Sort Headers is toggled', async () => {
    const user = userEvent.setup();
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'Z-Header: z\nA-Header: a' },
    });
    await user.click(screen.getByRole('button', { name: /sort headers/i }));
    const pre = document.querySelector('pre');
    const text = pre?.textContent ?? '';
    expect(text.indexOf('A-Header')).toBeLessThan(text.indexOf('Z-Header'));
  });

  // ── Canonical Case toggle ─────────────────────────────────────────────────
  it('normalizes header names when Canonical Case is toggled', async () => {
    const user = userEvent.setup();
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'content-type: text/html\naccept-encoding: gzip' },
    });
    await user.click(screen.getByRole('button', { name: /canonical case/i }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('Content-Type: text/html');
    expect(pre?.textContent).toContain('Accept-Encoding: gzip');
  });

  // ── Valid / Invalid badge ─────────────────────────────────────────────────
  it('shows Valid badge for valid headers', () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'Content-Type: text/html' },
    });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid badge for malformed input', () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'HTTP/1.1 200 OK\nmalformedline' },
    });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('shows error message for invalid input', () => {
    render(<HttpHeadersFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'HTTP/1.1 200 OK\nmalformedline' },
    });
    expect(screen.getByText(/invalid header/i)).toBeInTheDocument();
  });

  // ── Clear / Paste ─────────────────────────────────────────────────────────
  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<HttpHeadersFormatter />);
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Host: example.com' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes from clipboard when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('Content-Type: text/html');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<HttpHeadersFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('Content-Type: text/html');
    });
  });

  // ── empty state ───────────────────────────────────────────────────────────
  it('shows placeholder text when output is empty', () => {
    render(<HttpHeadersFormatter />);
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('Formatted output will appear here');
  });
});

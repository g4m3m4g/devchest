import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NginxConfigFormatter from '../../components/tools/formatters/NginxConfigFormatter';

const PLACEHOLDER_SNIPPET = /worker_processes/;

describe('NginxConfigFormatter', () => {
  it('renders the tool title', () => {
    render(<NginxConfigFormatter />);
    expect(screen.getByText('Nginx Config Formatter')).toBeInTheDocument();
  });

  it('renders Source and Formatted Output panels', () => {
    render(<NginxConfigFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('renders indent size toggle buttons', () => {
    render(<NginxConfigFormatter />);
    expect(screen.getByRole('button', { name: '2 spaces' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '4 spaces' })).toBeInTheDocument();
  });

  it('formats a directive immediately on input', () => {
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'worker_processes   1;' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('worker_processes 1;');
  });

  it('formats a block with indented content', () => {
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'server { listen 80; }' },
    });
    const pre = document.querySelector('pre');
    const text = pre?.textContent ?? '';
    expect(text).toContain('server {');
    expect(text).toContain('    listen 80;');
    expect(text).toContain('}');
  });

  it('switches to 2-space indent', async () => {
    const user = userEvent.setup();
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'server { listen 80; }' },
    });
    await user.click(screen.getByRole('button', { name: '2 spaces' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('  listen 80;');
  });

  it('shows Valid badge for valid input', () => {
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'worker_processes 1;' },
    });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid badge for unmatched brace', () => {
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'server {' },
    });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('shows error message when input is invalid', () => {
    render(<NginxConfigFormatter />);
    fireEvent.change(screen.getByPlaceholderText(PLACEHOLDER_SNIPPET), {
      target: { value: 'server {' },
    });
    const pre = document.querySelector('pre');
    expect(pre).not.toBeInTheDocument();
    expect(screen.getByText(/unclosed block/i)).toBeInTheDocument();
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<NginxConfigFormatter />);
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'worker_processes 1;' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes from clipboard when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('worker_processes 1;');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<NginxConfigFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(PLACEHOLDER_SNIPPET) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('worker_processes 1;');
    });
  });
});

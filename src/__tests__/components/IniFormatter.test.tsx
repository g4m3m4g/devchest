import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IniFormatter from '../../components/tools/formatters/IniFormatter';

describe('IniFormatter', () => {
  it('renders the tool title', () => {
    render(<IniFormatter />);
    expect(screen.getByText('INI Formatter')).toBeInTheDocument();
  });

  it('renders Source and Formatted Output panels', () => {
    render(<IniFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('renders separator toggle buttons', () => {
    render(<IniFormatter />);
    expect(screen.getByRole('button', { name: '=' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ':' })).toBeInTheDocument();
  });

  it('renders sort toggles', () => {
    render(<IniFormatter />);
    expect(screen.getByRole('button', { name: /sort sections/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sort keys/i })).toBeInTheDocument();
  });

  it('formats a key-value pair immediately', () => {
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: 'host=localhost' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('host = localhost');
  });

  it('shows Valid badge for valid input', () => {
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: '[section]\nkey = value' },
    });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows Invalid badge for unclosed section bracket', () => {
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: '[unclosed' },
    });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('switches to : separator', async () => {
    const user = userEvent.setup();
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: 'port = 5432' },
    });
    await user.click(screen.getByRole('button', { name: ':' }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('port: 5432');
  });

  it('sorts sections when Sort Sections is clicked', async () => {
    const user = userEvent.setup();
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: '[zebra]\na = 1\n[alpha]\nb = 2' },
    });
    await user.click(screen.getByRole('button', { name: /sort sections/i }));
    const pre = document.querySelector('pre');
    const text = pre?.textContent ?? '';
    expect(text.indexOf('[alpha]')).toBeLessThan(text.indexOf('[zebra]'));
  });

  it('sorts keys when Sort Keys is clicked', async () => {
    const user = userEvent.setup();
    render(<IniFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/\[server\]/), {
      target: { value: '[db]\nport = 5432\nhost = localhost' },
    });
    await user.click(screen.getByRole('button', { name: /sort keys/i }));
    const pre = document.querySelector('pre');
    const text = pre?.textContent ?? '';
    expect(text.indexOf('host')).toBeLessThan(text.indexOf('port'));
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<IniFormatter />);
    const textarea = screen.getByPlaceholderText(/\[server\]/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'key = value' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes from clipboard when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('[section]\nkey = value');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<IniFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/\[server\]/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('[section]\nkey = value');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HtaccessGenerator from '../../components/tools/generators/HtaccessGenerator';

describe('HtaccessGenerator', () => {
  it('renders the tool title', () => {
    render(<HtaccessGenerator />);
    expect(screen.getByText('.htaccess Generator')).toBeInTheDocument();
  });

  it('shows an empty state before any option is enabled', () => {
    render(<HtaccessGenerator />);
    expect(screen.getByText(/Enable an option/)).toBeInTheDocument();
  });

  it('enables force-HTTPS redirect', async () => {
    const user = userEvent.setup();
    render(<HtaccessGenerator />);
    await user.click(screen.getByLabelText(/force https/i));
    expect(screen.getByTestId('htaccess-output')).toHaveTextContent('RewriteCond %{HTTPS} off');
  });

  it('sets www canonicalization', async () => {
    render(<HtaccessGenerator />);
    fireEvent.change(screen.getByLabelText(/www/i), { target: { value: 'www' } });
    expect(screen.getByTestId('htaccess-output')).toHaveTextContent('RewriteCond %{HTTP_HOST} !^www');
  });

  it('adds a custom redirect rule', async () => {
    const user = userEvent.setup();
    render(<HtaccessGenerator />);
    await user.click(screen.getByRole('button', { name: /add redirect/i }));
    fireEvent.change(screen.getByPlaceholderText('/old-path'), { target: { value: '/old' } });
    fireEvent.change(screen.getByPlaceholderText('/new-path'), { target: { value: '/new' } });
    expect(screen.getByTestId('htaccess-output')).toHaveTextContent('Redirect 301 /old /new');
  });

  it('enables directory listing and gzip toggles', async () => {
    const user = userEvent.setup();
    render(<HtaccessGenerator />);
    await user.click(screen.getByLabelText(/disable directory listing/i));
    await user.click(screen.getByLabelText(/enable gzip/i));
    const output = screen.getByTestId('htaccess-output').textContent ?? '';
    expect(output).toContain('Options -Indexes');
    expect(output).toContain('mod_deflate');
  });

  it('clears all options', async () => {
    const user = userEvent.setup();
    render(<HtaccessGenerator />);
    await user.click(screen.getByLabelText(/force https/i));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Enable an option/)).toBeInTheDocument();
  });

  it('copies the generated .htaccess to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<HtaccessGenerator />);
    await user.click(screen.getByLabelText(/force https/i));
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

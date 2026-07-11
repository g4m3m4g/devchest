import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CspBuilder from '../../components/tools/generators/CspBuilder';

describe('CspBuilder', () => {
  it('renders the tool title', () => {
    render(<CspBuilder />);
    expect(screen.getByText('Content Security Policy Builder')).toBeInTheDocument();
  });

  it('shows an empty policy string before any directive is filled in', () => {
    render(<CspBuilder />);
    expect(screen.getByText(/Add sources to a directive/)).toBeInTheDocument();
  });

  it('builds a policy string as directives are filled in', () => {
    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('default-src'), { target: { value: "'self'" } });
    fireEvent.change(screen.getByLabelText('script-src'), { target: { value: "'self' https://cdn.example.com" } });
    expect(screen.getByTestId('csp-output')).toHaveTextContent(
      "default-src 'self'; script-src 'self' https://cdn.example.com"
    );
  });

  it('appends upgrade-insecure-requests when the checkbox is checked', async () => {
    const user = userEvent.setup();
    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('default-src'), { target: { value: "'self'" } });
    await user.click(screen.getByLabelText(/upgrade insecure requests/i));
    expect(screen.getByTestId('csp-output')).toHaveTextContent("default-src 'self'; upgrade-insecure-requests");
  });

  it('switches between header and meta tag output format', async () => {
    const user = userEvent.setup();
    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('default-src'), { target: { value: "'self'" } });
    expect(screen.getByTestId('csp-output')).toHaveTextContent('Content-Security-Policy:');

    await user.click(screen.getByRole('button', { name: /meta tag/i }));
    expect(screen.getByTestId('csp-output')).toHaveTextContent('<meta http-equiv="Content-Security-Policy"');
  });

  it('shows a warning for unsafe-inline', () => {
    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('script-src'), { target: { value: "'unsafe-inline'" } });
    expect(document.body).toHaveTextContent('weakens XSS protection');
  });

  it('clears all directives', async () => {
    const user = userEvent.setup();
    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('default-src'), { target: { value: "'self'" } });
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByLabelText('default-src')).toHaveValue('');
    expect(screen.getByText(/Add sources to a directive/)).toBeInTheDocument();
  });

  it('copies the generated policy to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<CspBuilder />);
    fireEvent.change(screen.getByLabelText('default-src'), { target: { value: "'self'" } });
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

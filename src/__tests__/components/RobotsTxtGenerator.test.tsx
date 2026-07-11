import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RobotsTxtGenerator from '../../components/tools/generators/RobotsTxtGenerator';

describe('RobotsTxtGenerator', () => {
  it('renders the tool title', () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByText('robots.txt Generator')).toBeInTheDocument();
  });

  it('generates a default allow-all rule for the wildcard user-agent', () => {
    render(<RobotsTxtGenerator />);
    expect(screen.getByTestId('robots-output')).toHaveTextContent('User-agent: *');
  });

  it('adds disallow paths to the output', () => {
    render(<RobotsTxtGenerator />);
    fireEvent.change(screen.getByLabelText(/disallow/i), { target: { value: '/admin/\n/private/' } });
    const output = screen.getByTestId('robots-output').textContent ?? '';
    expect(output).toContain('Disallow: /admin/');
    expect(output).toContain('Disallow: /private/');
  });

  it('adds a second rule block', async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);
    await user.click(screen.getByRole('button', { name: /add user-agent/i }));
    expect(screen.getAllByLabelText(/user-agent/i)).toHaveLength(2);
  });

  it('removes a rule block', async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);
    await user.click(screen.getByRole('button', { name: /add user-agent/i }));
    await user.click(screen.getAllByTitle('Remove rule')[0]);
    expect(screen.getAllByLabelText(/user-agent/i)).toHaveLength(1);
  });

  it('includes sitemap lines in the output', () => {
    render(<RobotsTxtGenerator />);
    fireEvent.change(screen.getByLabelText(/sitemaps/i), { target: { value: 'https://example.com/sitemap.xml' } });
    expect(screen.getByTestId('robots-output')).toHaveTextContent('Sitemap: https://example.com/sitemap.xml');
  });

  it('clears all rules and sitemaps', async () => {
    const user = userEvent.setup();
    render(<RobotsTxtGenerator />);
    fireEvent.change(screen.getByLabelText(/disallow/i), { target: { value: '/admin/' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByTestId('robots-output')).toHaveTextContent('User-agent: *');
    expect(screen.getByTestId('robots-output')).not.toHaveTextContent('/admin/');
  });

  it('copies the generated robots.txt to clipboard', async () => {
    const user = userEvent.setup();
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<RobotsTxtGenerator />);
    await user.click(screen.getByTitle('Copy output'));
    expect(writeTextFn).toHaveBeenCalled();
  });
});

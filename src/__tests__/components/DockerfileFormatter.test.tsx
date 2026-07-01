import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DockerfileFormatter from '../../components/tools/formatters/DockerfileFormatter';

describe('DockerfileFormatter', () => {
  it('renders the tool title', () => {
    render(<DockerfileFormatter />);
    expect(screen.getByText('Dockerfile Formatter')).toBeInTheDocument();
  });

  it('renders Source panel', () => {
    render(<DockerfileFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
  });

  it('renders Formatted and Issues tab buttons', () => {
    render(<DockerfileFormatter />);
    expect(screen.getByRole('button', { name: /formatted/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /issues/i })).toBeInTheDocument();
  });

  it('defaults to Formatted tab showing output', () => {
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'from ubuntu:20.04' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('FROM ubuntu:20.04');
  });

  it('uppercases FROM instruction in formatted output', () => {
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'from node:18' },
    });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('FROM node:18');
    expect(pre?.textContent).not.toContain('from node:18');
  });

  it('shows issues count in Issues tab button', () => {
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'FROM ubuntu\nMAINTAINER dev@example.com' },
    });
    expect(screen.getByRole('button', { name: /issues \(\d+\)/i })).toBeInTheDocument();
  });

  it('switches to Issues tab and shows issue list', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'FROM ubuntu:latest' },
    });
    await user.click(screen.getByRole('button', { name: /issues/i }));
    expect(screen.getByText(/DL3006/)).toBeInTheDocument();
  });

  it('shows DL4000 for MAINTAINER in issues', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'FROM ubuntu:20.04\nMAINTAINER dev@example.com' },
    });
    await user.click(screen.getByRole('button', { name: /issues/i }));
    expect(screen.getByText(/DL4000/)).toBeInTheDocument();
  });

  it('shows error severity badge for DL4000', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'FROM ubuntu:20.04\nMAINTAINER dev@example.com' },
    });
    await user.click(screen.getByRole('button', { name: /issues/i }));
    expect(screen.getByText('error')).toBeInTheDocument();
  });

  it('shows empty state message when there are no issues', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    const goodDockerfile = [
      'FROM node:18-alpine',
      'WORKDIR /app',
      'COPY . .',
      'USER node',
      'CMD ["node", "server.js"]',
    ].join('\n');
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: goodDockerfile },
    });
    await user.click(screen.getByRole('button', { name: /issues/i }));
    expect(screen.getByText(/no issues/i)).toBeInTheDocument();
  });

  it('switches back to Formatted tab', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/FROM/), {
      target: { value: 'FROM ubuntu:20.04' },
    });
    await user.click(screen.getByRole('button', { name: /issues/i }));
    await user.click(screen.getByRole('button', { name: /formatted/i }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('FROM ubuntu:20.04');
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<DockerfileFormatter />);
    const textarea = screen.getByPlaceholderText(/FROM/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'FROM ubuntu:20.04' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes from clipboard when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('FROM node:18\nCMD ["node", "app.js"]');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<DockerfileFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/FROM/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('FROM node:18\nCMD ["node", "app.js"]');
    });
  });
});

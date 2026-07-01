import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GraphqlFormatter from '../../components/tools/formatters/GraphqlFormatter';

describe('GraphqlFormatter', () => {
  it('renders the tool title', () => {
    render(<GraphqlFormatter />);
    expect(screen.getByText('GraphQL Formatter')).toBeInTheDocument();
  });

  it('renders source and output panels', () => {
    render(<GraphqlFormatter />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Formatted Output')).toBeInTheDocument();
  });

  it('shows print width toggle buttons', () => {
    render(<GraphqlFormatter />);
    expect(screen.getByRole('button', { name: '80' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '120' })).toBeInTheDocument();
  });

  it('formats a valid type definition', async () => {
    render(<GraphqlFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/type Query/), {
      target: { value: 'type User{id:ID! name:String}' },
    });
    await waitFor(
      () => {
        const pre = document.querySelector('pre');
        expect(pre?.textContent).toContain('type User {');
      },
      { timeout: 5000 },
    );
  });

  it('shows Valid badge after successful format', async () => {
    render(<GraphqlFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/type Query/), {
      target: { value: 'type Query { hello: String }' },
    });
    await waitFor(() => expect(screen.getByText('Valid')).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('shows Invalid badge for bad syntax', async () => {
    render(<GraphqlFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/type Query/), {
      target: { value: 'type {{{' },
    });
    await waitFor(() => expect(screen.getByText('Invalid')).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('formats a query operation', async () => {
    render(<GraphqlFormatter />);
    fireEvent.change(screen.getByPlaceholderText(/type Query/), {
      target: { value: 'query GetUser{user{id name}}' },
    });
    await waitFor(
      () => {
        const pre = document.querySelector('pre');
        expect(pre?.textContent).toContain('query GetUser {');
      },
      { timeout: 5000 },
    );
  });

  it('switches to 120 print width', async () => {
    const user = userEvent.setup();
    render(<GraphqlFormatter />);
    await user.click(screen.getByRole('button', { name: '120' }));
    fireEvent.change(screen.getByPlaceholderText(/type Query/), {
      target: { value: 'type Query { hello: String }' },
    });
    await waitFor(() => expect(screen.getByText('Valid')).toBeInTheDocument(), {
      timeout: 5000,
    });
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<GraphqlFormatter />);
    const textarea = screen.getByPlaceholderText(/type Query/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'type Query { hello: String }' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('type Query { hello: String }');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<GraphqlFormatter />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/type Query/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('type Query { hello: String }');
    });
  });
});

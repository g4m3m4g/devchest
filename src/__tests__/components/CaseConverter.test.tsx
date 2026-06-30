import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CaseConverter from '../../components/tools/text/CaseConverter';

describe('CaseConverter', () => {
  it('renders the tool title', () => {
    render(<CaseConverter />);
    expect(screen.getByText('Case Converter')).toBeInTheDocument();
  });

  it('renders all 8 case format labels', () => {
    render(<CaseConverter />);
    expect(screen.getByText('camelCase')).toBeInTheDocument();
    expect(screen.getByText('PascalCase')).toBeInTheDocument();
    expect(screen.getByText('snake_case')).toBeInTheDocument();
    expect(screen.getByText('SCREAMING_SNAKE')).toBeInTheDocument();
    expect(screen.getByText('kebab-case')).toBeInTheDocument();
    expect(screen.getByText('Title Case')).toBeInTheDocument();
    expect(screen.getByText('UPPERCASE')).toBeInTheDocument();
    expect(screen.getByText('lowercase')).toBeInTheDocument();
  });

  it('shows camelCase result', () => {
    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    expect(screen.getByText('helloWorld')).toBeInTheDocument();
  });

  it('shows PascalCase result', () => {
    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    expect(screen.getByText('HelloWorld')).toBeInTheDocument();
  });

  it('shows snake_case result', () => {
    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    expect(screen.getByText('hello_world')).toBeInTheDocument();
  });

  it('shows kebab-case result', () => {
    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    expect(screen.getByText('hello-world')).toBeInTheDocument();
  });

  it('shows SCREAMING_SNAKE result', () => {
    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    expect(screen.getByText('HELLO_WORLD')).toBeInTheDocument();
  });

  it('copies result to clipboard on card click', async () => {
    const user = userEvent.setup();
    // Set up local clipboard mock AFTER userEvent.setup() to override any clipboard userEvent installs
    const writeTextFn = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextFn, readText: vi.fn() },
      configurable: true,
      writable: true,
    });

    render(<CaseConverter />);
    fireEvent.change(screen.getByPlaceholderText(/Type or paste/), { target: { value: 'hello world' } });
    const camelCard = screen.getByText('helloWorld').closest('button')!;
    await user.click(camelCard);
    expect(writeTextFn).toHaveBeenCalledWith('helloWorld');
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<CaseConverter />);
    const textarea = screen.getByPlaceholderText(/Type or paste/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'hello world' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

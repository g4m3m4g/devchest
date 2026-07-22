import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonToTypeScriptTool from '../../components/tools/data/JsonToTypeScriptTool';

describe('JsonToTypeScriptTool', () => {
  it('renders the tool title', () => {
    render(<JsonToTypeScriptTool />);
    expect(screen.getByText('JSON to TypeScript Interface Generator')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<JsonToTypeScriptTool />);
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
    expect(screen.getByText('TypeScript Interfaces')).toBeInTheDocument();
  });

  it('generates an interface for valid JSON', () => {
    render(<JsonToTypeScriptTool />);
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{"name":"Alice","age":30}' } });
    expect(document.body).toHaveTextContent('interface Root {');
    expect(document.body).toHaveTextContent('name: string;');
  });

  it('shows an error badge and message for invalid JSON', () => {
    render(<JsonToTypeScriptTool />);
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{bad json}' } });
    expect(screen.getByText('Invalid JSON')).toBeInTheDocument();
  });

  it('allows customizing the root interface name', () => {
    render(<JsonToTypeScriptTool />);
    const nameInput = screen.getByLabelText(/root name/i);
    fireEvent.change(nameInput, { target: { value: 'Person' } });
    const textarea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(textarea, { target: { value: '{"name":"Alice"}' } });
    expect(document.body).toHaveTextContent('interface Person {');
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonToTypeScriptTool />);
    const textarea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('{"pasted":true}');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<JsonToTypeScriptTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('{"pasted":true}');
    });
  });
});

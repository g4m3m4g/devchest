import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonToCsvTool from '../../components/tools/data/JsonToCsvTool';

describe('JsonToCsvTool', () => {
  it('renders the tool title', () => {
    render(<JsonToCsvTool />);
    expect(screen.getByText('JSON to CSV Converter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<JsonToCsvTool />);
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
    expect(screen.getByText('CSV Output')).toBeInTheDocument();
  });

  it('converts a JSON array of objects to CSV', () => {
    render(<JsonToCsvTool />);
    const textarea = screen.getByPlaceholderText(/\[/);
    fireEvent.change(textarea, { target: { value: '[{"name":"Alice","age":30}]' } });
    expect(document.body).toHaveTextContent('name,age');
    expect(document.body).toHaveTextContent('Alice,30');
  });

  it('shows an error badge when the input is not an array', () => {
    render(<JsonToCsvTool />);
    const textarea = screen.getByPlaceholderText(/\[/);
    fireEvent.change(textarea, { target: { value: '{"a":1}' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(document.body).toHaveTextContent('array');
  });

  it('shows an error badge for invalid JSON', () => {
    render(<JsonToCsvTool />);
    const textarea = screen.getByPlaceholderText(/\[/);
    fireEvent.change(textarea, { target: { value: '[bad json]' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonToCsvTool />);
    const textarea = screen.getByPlaceholderText(/\[/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '[{"a":1}]' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('[{"pasted":true}]');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<JsonToCsvTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/\[/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('[{"pasted":true}]');
    });
  });
});

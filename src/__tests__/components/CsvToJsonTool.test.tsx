import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CsvToJsonTool from '../../components/tools/data/CsvToJsonTool';

describe('CsvToJsonTool', () => {
  it('renders the tool title', () => {
    render(<CsvToJsonTool />);
    expect(screen.getByText('CSV to JSON Converter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<CsvToJsonTool />);
    expect(screen.getByText('Input CSV')).toBeInTheDocument();
    expect(screen.getByText('JSON Output')).toBeInTheDocument();
  });

  it('converts CSV to a JSON array', () => {
    render(<CsvToJsonTool />);
    const textarea = screen.getByPlaceholderText(/name,age/);
    fireEvent.change(textarea, { target: { value: 'name,age\nAlice,30' } });
    expect(document.body).toHaveTextContent('"name": "Alice"');
    expect(document.body).toHaveTextContent('"age": 30');
  });

  it('shows an error badge for malformed CSV', () => {
    render(<CsvToJsonTool />);
    const textarea = screen.getByPlaceholderText(/name,age/);
    fireEvent.change(textarea, { target: { value: '"unterminated,value\nrow2,data' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('switches delimiter', async () => {
    const user = userEvent.setup();
    render(<CsvToJsonTool />);
    await user.click(screen.getByText(';'));
    const textarea = screen.getByPlaceholderText(/name,age/);
    fireEvent.change(textarea, { target: { value: 'name;age\nAlice;30' } });
    expect(document.body).toHaveTextContent('"name": "Alice"');
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<CsvToJsonTool />);
    const textarea = screen.getByPlaceholderText(/name,age/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'a,b\n1,2' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('a,b\n1,2');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<CsvToJsonTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByPlaceholderText(/name,age/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('a,b\n1,2');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CsvViewer from '../../components/tools/formatters/CsvViewer';

const SAMPLE_CSV = 'name,age,city\nAlice,30,NYC\nBob,25,LA';

describe('CsvViewer', () => {
  it('renders the tool title', () => {
    render(<CsvViewer />);
    expect(screen.getByText('CSV Formatter & Viewer')).toBeInTheDocument();
  });

  it('renders source and output panels', () => {
    render(<CsvViewer />);
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
  });

  it('shows delimiter selector buttons', () => {
    render(<CsvViewer />);
    expect(screen.getByRole('button', { name: ',' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: ';' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tab' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '|' })).toBeInTheDocument();
  });

  it('renders a table after CSV input', () => {
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: SAMPLE_CSV } });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders column headers as th elements', () => {
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: SAMPLE_CSV } });
    expect(screen.getByRole('columnheader', { name: 'name' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'age' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'city' })).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: SAMPLE_CSV } });
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows row and column count', () => {
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: SAMPLE_CSV } });
    // Count spans are separate elements; check body text content
    expect(document.body).toHaveTextContent('2 rows');
    expect(document.body).toHaveTextContent('3 cols');
  });

  it('switches to CSV output mode and shows formatted text', async () => {
    const user = userEvent.setup();
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: SAMPLE_CSV } });
    await user.click(screen.getByRole('button', { name: /csv/i }));
    expect(document.querySelector('pre')).toBeInTheDocument();
    expect(document.querySelector('pre')?.textContent).toContain('name,age,city');
  });

  it('reformats with semicolon delimiter', async () => {
    const user = userEvent.setup();
    render(<CsvViewer />);
    // Set input delimiter to ; first, then enter semicolon-delimited CSV
    await user.click(screen.getByRole('button', { name: ';' }));
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'name;age;city\nAlice;30;NYC\nBob;25;LA' },
    });
    await user.click(screen.getByRole('button', { name: /csv/i }));
    expect(document.querySelector('pre')?.textContent).toContain('name;age;city');
  });

  it('auto-detects semicolon delimiter from input', async () => {
    const user = userEvent.setup();
    render(<CsvViewer />);
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'name;age\nAlice;30' },
    });
    await user.click(screen.getByRole('button', { name: /auto/i }));
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('clears input when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<CsvViewer />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: SAMPLE_CSV } });
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });

  it('pastes text when Paste is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('a,b\n1,2');
    Object.defineProperty(navigator, 'clipboard', {
      value: { readText: readTextFn, writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
      writable: true,
    });
    render(<CsvViewer />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    await waitFor(() => {
      expect(textarea.value).toBe('a,b\n1,2');
    });
  });
});

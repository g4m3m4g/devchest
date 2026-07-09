import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ColumnExtractorTool from '../../components/tools/text/ColumnExtractorTool';

describe('ColumnExtractorTool', () => {
  it('renders the tool title', () => {
    render(<ColumnExtractorTool />);
    expect(screen.getByText('Column Extractor')).toBeInTheDocument();
  });

  it('extracts the selected column by default delimiter', () => {
    render(<ColumnExtractorTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste delimited text/), { target: { value: 'a,b,c\nd,e,f' } });
    fireEvent.change(screen.getByPlaceholderText('Columns (e.g. 1,3-4)'), { target: { value: '2' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('b\ne');
  });

  it('supports a custom input delimiter', () => {
    render(<ColumnExtractorTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste delimited text/), { target: { value: 'a\tb\tc' } });
    fireEvent.change(screen.getByPlaceholderText('Delimiter'), { target: { value: '\t' } });
    fireEvent.change(screen.getByPlaceholderText('Columns (e.g. 1,3-4)'), { target: { value: '2' } });
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toBe('b');
  });

  it('shows an error for an invalid column spec', () => {
    render(<ColumnExtractorTool />);
    fireEvent.change(screen.getByPlaceholderText(/Paste delimited text/), { target: { value: 'a,b,c' } });
    fireEvent.change(screen.getByPlaceholderText('Columns (e.g. 1,3-4)'), { target: { value: 'x' } });
    expect(document.body).toHaveTextContent(/Invalid column selection/i);
  });

  it('clears input on Clear click', () => {
    render(<ColumnExtractorTool />);
    const textarea = screen.getByPlaceholderText(/Paste delimited text/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'a,b' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

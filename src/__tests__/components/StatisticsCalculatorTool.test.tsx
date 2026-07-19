import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatisticsCalculatorTool from '../../components/tools/numbers/StatisticsCalculatorTool';

describe('StatisticsCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<StatisticsCalculatorTool />);
    expect(screen.getByText('Statistics Calculator')).toBeInTheDocument();
  });

  it('computes stats for comma-separated values', () => {
    render(<StatisticsCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Values'), { target: { value: '2, 4, 4, 4, 5, 5, 7, 9' } });
    expect(screen.getByLabelText('Mean')).toHaveValue('5');
    expect(screen.getByLabelText('Median')).toHaveValue('4.5');
    expect(screen.getByLabelText('Mode')).toHaveValue('4');
    expect(screen.getByLabelText('Std Dev')).toHaveValue('2');
    expect(screen.getByLabelText('Count')).toHaveValue('8');
  });

  it('parses newline-separated values too', () => {
    render(<StatisticsCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Values'), { target: { value: '1\n2\n3' } });
    expect(screen.getByLabelText('Mean')).toHaveValue('2');
    expect(screen.getByLabelText('Median')).toHaveValue('2');
  });

  it('shows multiple modes joined for multimodal data', () => {
    render(<StatisticsCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Values'), { target: { value: '1, 1, 2, 2, 3' } });
    expect(screen.getByLabelText('Mode')).toHaveValue('1, 2');
  });

  it('shows an error for empty input', () => {
    render(<StatisticsCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Values'), { target: { value: '   ' } });
    expect(screen.getByText(/at least one value/i)).toBeInTheDocument();
  });

  it('shows an error for non-numeric input', () => {
    render(<StatisticsCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Values'), { target: { value: '1, abc, 3' } });
    expect(screen.getByText(/not a valid number/i)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<StatisticsCalculatorTool />);
    const input = screen.getByLabelText('Values') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '1, 2, 3' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

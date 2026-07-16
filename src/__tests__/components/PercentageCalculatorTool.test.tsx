import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PercentageCalculatorTool from '../../components/tools/numbers/PercentageCalculatorTool';

describe('PercentageCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<PercentageCalculatorTool />);
    expect(screen.getByText('Percentage Calculator')).toBeInTheDocument();
  });

  it('computes X% of Y in the default mode', () => {
    render(<PercentageCalculatorTool />);
    fireEvent.change(screen.getByLabelText('First value'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Second value'), { target: { value: '200' } });
    expect(screen.getByLabelText('Result')).toHaveValue('50');
  });

  it('computes what percent X is of Y in that mode', () => {
    render(<PercentageCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'what-percent' } });
    fireEvent.change(screen.getByLabelText('First value'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Second value'), { target: { value: '200' } });
    expect(screen.getByLabelText('Result')).toHaveValue('25');
  });

  it('computes percent change in that mode', () => {
    render(<PercentageCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Mode'), { target: { value: 'percent-change' } });
    fireEvent.change(screen.getByLabelText('First value'), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText('Second value'), { target: { value: '150' } });
    expect(screen.getByLabelText('Result')).toHaveValue('50');
  });

  it('clears inputs on Clear click', () => {
    render(<PercentageCalculatorTool />);
    const first = screen.getByLabelText('First value') as HTMLInputElement;
    const second = screen.getByLabelText('Second value') as HTMLInputElement;
    fireEvent.change(first, { target: { value: '25' } });
    fireEvent.change(second, { target: { value: '200' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(first.value).toBe('');
    expect(second.value).toBe('');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RomanNumeralConverterTool from '../../components/tools/numbers/RomanNumeralConverterTool';

describe('RomanNumeralConverterTool', () => {
  it('renders the tool title', () => {
    render(<RomanNumeralConverterTool />);
    expect(screen.getByText('Roman Numeral Converter')).toBeInTheDocument();
  });

  it('converts a number to Roman numerals by default', () => {
    render(<RomanNumeralConverterTool />);
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '1994' } });
    expect(screen.getByLabelText('Roman numeral')).toHaveValue('MCMXCIV');
  });

  it('converts Roman numerals to a number in the reverse direction', () => {
    render(<RomanNumeralConverterTool />);
    fireEvent.click(screen.getByLabelText('Swap direction'));
    fireEvent.change(screen.getByLabelText('Roman numeral'), { target: { value: 'MCMXCIV' } });
    expect(screen.getByLabelText('Number')).toHaveValue('1994');
  });

  it('shows an error for an out-of-range number', () => {
    render(<RomanNumeralConverterTool />);
    fireEvent.change(screen.getByLabelText('Number'), { target: { value: '4000' } });
    expect(screen.getByText(/between 1 and 3999/i)).toBeInTheDocument();
  });

  it('shows an error for an invalid Roman numeral', () => {
    render(<RomanNumeralConverterTool />);
    fireEvent.click(screen.getByLabelText('Swap direction'));
    fireEvent.change(screen.getByLabelText('Roman numeral'), { target: { value: 'IIII' } });
    expect(screen.getByText(/not a valid roman numeral/i)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<RomanNumeralConverterTool />);
    const input = screen.getByLabelText('Number') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

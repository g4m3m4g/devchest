import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import NumberBaseConverter from '../../components/tools/encoders/NumberBaseConverter';

describe('NumberBaseConverter', () => {
  it('renders the tool title', () => {
    render(<NumberBaseConverter />);
    expect(screen.getByText('Number Base Converter')).toBeInTheDocument();
  });

  it('renders all four base fields', () => {
    render(<NumberBaseConverter />);
    expect(screen.getByText('Binary')).toBeInTheDocument();
    expect(screen.getByText('Octal')).toBeInTheDocument();
    expect(screen.getByText('Decimal')).toBeInTheDocument();
    expect(screen.getByText('Hex')).toBeInTheDocument();
  });

  it('converts a decimal value into the other three bases', () => {
    render(<NumberBaseConverter />);
    const decimalInput = screen.getByPlaceholderText('255');
    fireEvent.change(decimalInput, { target: { value: '255' } });
    expect(screen.getByPlaceholderText('11111111')).toHaveValue('11111111');
    expect(screen.getByPlaceholderText('377')).toHaveValue('377');
    expect(screen.getByPlaceholderText('ff')).toHaveValue('ff');
  });

  it('converts a hex value into the other three bases', () => {
    render(<NumberBaseConverter />);
    const hexInput = screen.getByPlaceholderText('ff');
    fireEvent.change(hexInput, { target: { value: 'FF' } });
    expect(screen.getByPlaceholderText('11111111')).toHaveValue('11111111');
    expect(screen.getByPlaceholderText('377')).toHaveValue('377');
    expect(screen.getByPlaceholderText('255')).toHaveValue('255');
  });

  it('converts a binary value into the other three bases', () => {
    render(<NumberBaseConverter />);
    const binaryInput = screen.getByPlaceholderText('11111111');
    fireEvent.change(binaryInput, { target: { value: '11111111' } });
    expect(screen.getByPlaceholderText('377')).toHaveValue('377');
    expect(screen.getByPlaceholderText('255')).toHaveValue('255');
    expect(screen.getByPlaceholderText('ff')).toHaveValue('ff');
  });

  it('shows an error message for an invalid digit in the active field', () => {
    render(<NumberBaseConverter />);
    const binaryInput = screen.getByPlaceholderText('11111111');
    fireEvent.change(binaryInput, { target: { value: '1012' } });
    expect(screen.getByText(/not a valid base-2 number/)).toBeInTheDocument();
  });

  it('clears all fields on Clear click', () => {
    render(<NumberBaseConverter />);
    const decimalInput = screen.getByPlaceholderText('255');
    fireEvent.change(decimalInput, { target: { value: '255' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(screen.getByPlaceholderText('255')).toHaveValue('');
    expect(screen.getByPlaceholderText('ff')).toHaveValue('');
  });

  it('clears all fields when the input is emptied', () => {
    render(<NumberBaseConverter />);
    const decimalInput = screen.getByPlaceholderText('255');
    fireEvent.change(decimalInput, { target: { value: '255' } });
    fireEvent.change(decimalInput, { target: { value: '' } });
    expect(screen.getByPlaceholderText('ff')).toHaveValue('');
  });
});

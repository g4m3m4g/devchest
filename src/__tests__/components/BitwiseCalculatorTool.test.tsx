import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BitwiseCalculatorTool from '../../components/tools/numbers/BitwiseCalculatorTool';

describe('BitwiseCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<BitwiseCalculatorTool />);
    expect(screen.getByText('Bitwise Calculator')).toBeInTheDocument();
  });

  it('computes AND by default', () => {
    render(<BitwiseCalculatorTool />);
    fireEvent.change(screen.getByLabelText('First operand'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Second operand'), { target: { value: '10' } });
    expect(screen.getByLabelText('Result')).toHaveValue('8');
  });

  it('computes XOR when selected', () => {
    render(<BitwiseCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'XOR' } });
    fireEvent.change(screen.getByLabelText('First operand'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Second operand'), { target: { value: '10' } });
    expect(screen.getByLabelText('Result')).toHaveValue('6');
  });

  it('disables the second operand for NOT', () => {
    render(<BitwiseCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'NOT' } });
    expect(screen.getByLabelText('Second operand')).toBeDisabled();
  });

  it('shows the binary representation of the result', () => {
    render(<BitwiseCalculatorTool />);
    fireEvent.change(screen.getByLabelText('First operand'), { target: { value: '12' } });
    fireEvent.change(screen.getByLabelText('Second operand'), { target: { value: '10' } });
    expect(screen.getByLabelText('Result binary')).toHaveTextContent('1000');
  });

  it('clears operands on Clear click', () => {
    render(<BitwiseCalculatorTool />);
    const first = screen.getByLabelText('First operand') as HTMLInputElement;
    fireEvent.change(first, { target: { value: '12' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(first.value).toBe('');
  });
});

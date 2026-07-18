import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BigNumberCalculatorTool from '../../components/tools/numbers/BigNumberCalculatorTool';

describe('BigNumberCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<BigNumberCalculatorTool />);
    expect(screen.getByText('Big Number Calculator')).toBeInTheDocument();
  });

  it('multiplies two arbitrarily large integers exactly', () => {
    render(<BigNumberCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'MULTIPLY' } });
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '123456789012345678901234567890' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '2' } });
    expect(screen.getByLabelText('Result')).toHaveValue('246913578024691357802469135780');
  });

  it('adds by default', () => {
    render(<BigNumberCalculatorTool />);
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '999999999999999999' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '1' } });
    expect(screen.getByLabelText('Result')).toHaveValue('1000000000000000000');
  });

  it('shows an error when dividing by zero', () => {
    render(<BigNumberCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'DIVIDE' } });
    fireEvent.change(screen.getByLabelText('First number'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('Second number'), { target: { value: '0' } });
    expect(screen.getByText(/divide by zero/i)).toBeInTheDocument();
  });

  it('clears operands on Clear click', () => {
    render(<BigNumberCalculatorTool />);
    const first = screen.getByLabelText('First number') as HTMLInputElement;
    fireEvent.change(first, { target: { value: '42' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(first.value).toBe('');
  });
});

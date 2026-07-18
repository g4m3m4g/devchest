import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import IeeeFloatVisualizerTool from '../../components/tools/numbers/IeeeFloatVisualizerTool';

describe('IeeeFloatVisualizerTool', () => {
  it('renders the tool title', () => {
    render(<IeeeFloatVisualizerTool />);
    expect(screen.getByText('IEEE 754 Float Visualizer')).toBeInTheDocument();
  });

  it('breaks down 1 into sign, exponent, and mantissa bits by default', () => {
    render(<IeeeFloatVisualizerTool />);
    expect(screen.getByLabelText('Sign bit')).toHaveTextContent('0');
    expect(screen.getByLabelText('Exponent bits')).toHaveTextContent('01111111');
    expect(screen.getByLabelText('Mantissa bits')).toHaveTextContent('00000000000000000000000');
    expect(screen.getByLabelText('Hex')).toHaveTextContent('3f800000');
  });

  it('switches to double precision', () => {
    render(<IeeeFloatVisualizerTool />);
    fireEvent.change(screen.getByLabelText('Precision'), { target: { value: 'double' } });
    expect(screen.getByLabelText('Exponent bits')).toHaveTextContent('01111111111');
    expect(screen.getByLabelText('Hex')).toHaveTextContent('3ff0000000000000');
  });

  it('shows rounding when a single-precision value cannot be represented exactly', () => {
    render(<IeeeFloatVisualizerTool />);
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '0.1' } });
    const reconstructed = screen.getByLabelText('Reconstructed value').textContent;
    expect(reconstructed).not.toBe('0.1');
  });

  it('clears the value on Clear click', () => {
    render(<IeeeFloatVisualizerTool />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

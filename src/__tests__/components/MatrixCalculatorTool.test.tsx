import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MatrixCalculatorTool from '../../components/tools/numbers/MatrixCalculatorTool';

describe('MatrixCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<MatrixCalculatorTool />);
    expect(screen.getByText('Matrix Calculator')).toBeInTheDocument();
  });

  it('adds two matrices by default', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2\n3,4' } });
    fireEvent.change(screen.getByLabelText('Matrix B'), { target: { value: '5,6\n7,8' } });
    expect(screen.getByLabelText('Result')).toHaveValue('6, 8\n10, 12');
  });

  it('multiplies two matrices', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'MULTIPLY' } });
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2\n3,4' } });
    fireEvent.change(screen.getByLabelText('Matrix B'), { target: { value: '5,6\n7,8' } });
    expect(screen.getByLabelText('Result')).toHaveValue('19, 22\n43, 50');
  });

  it('transposes matrix A and hides matrix B input', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'TRANSPOSE' } });
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2,3\n4,5,6' } });
    expect(screen.queryByLabelText('Matrix B')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Result')).toHaveValue('1, 4\n2, 5\n3, 6');
  });

  it('computes the determinant of matrix A', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'DETERMINANT' } });
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2\n3,4' } });
    expect(screen.getByLabelText('Result')).toHaveValue('-2');
  });

  it('shows an error for mismatched dimensions on add', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2\n3,4' } });
    fireEvent.change(screen.getByLabelText('Matrix B'), { target: { value: '1,2,3' } });
    expect(screen.getByText(/same dimensions/i)).toBeInTheDocument();
  });

  it('shows an error for a singular matrix on inverse', () => {
    render(<MatrixCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Operation'), { target: { value: 'INVERSE' } });
    fireEvent.change(screen.getByLabelText('Matrix A'), { target: { value: '1,2\n2,4' } });
    expect(screen.getByText(/singular/i)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<MatrixCalculatorTool />);
    const input = screen.getByLabelText('Matrix A') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: '1,2\n3,4' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

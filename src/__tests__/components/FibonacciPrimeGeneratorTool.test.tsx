import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FibonacciPrimeGeneratorTool from '../../components/tools/numbers/FibonacciPrimeGeneratorTool';

describe('FibonacciPrimeGeneratorTool', () => {
  it('renders the tool title', () => {
    render(<FibonacciPrimeGeneratorTool />);
    expect(screen.getByText('Fibonacci / Prime Sequence Generator')).toBeInTheDocument();
  });

  it('generates a Fibonacci sequence by default', () => {
    render(<FibonacciPrimeGeneratorTool />);
    fireEvent.change(screen.getByLabelText('Count'), { target: { value: '5' } });
    expect(screen.getByText('0, 1, 1, 2, 3')).toBeInTheDocument();
  });

  it('shows an error for an invalid Fibonacci count', () => {
    render(<FibonacciPrimeGeneratorTool />);
    fireEvent.change(screen.getByLabelText('Count'), { target: { value: '0' } });
    expect(screen.getByText(/at least 1/i)).toBeInTheDocument();
  });

  it('switches to Prime mode and lists primes up to the limit', () => {
    render(<FibonacciPrimeGeneratorTool />);
    fireEvent.click(screen.getByLabelText('Prime'));
    fireEvent.change(screen.getByLabelText('Limit'), { target: { value: '10' } });
    expect(screen.getByText('2, 3, 5, 7')).toBeInTheDocument();
  });

  it('shows an error for an invalid prime limit', () => {
    render(<FibonacciPrimeGeneratorTool />);
    fireEvent.click(screen.getByLabelText('Prime'));
    fireEvent.change(screen.getByLabelText('Limit'), { target: { value: '1' } });
    expect(screen.getByText(/at least 2/i)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<FibonacciPrimeGeneratorTool />);
    const input = screen.getByLabelText('Count') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '7' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ColorMathTool from '../../components/tools/numbers/ColorMathTool';

describe('ColorMathTool', () => {
  it('renders the tool title', () => {
    render(<ColorMathTool />);
    expect(screen.getByText('Color Math')).toBeInTheDocument();
  });

  it('mixes two colors at the default 50% ratio', () => {
    render(<ColorMathTool />);
    fireEvent.change(screen.getByLabelText('Color A'), { target: { value: '#ff0000' } });
    fireEvent.change(screen.getByLabelText('Color B'), { target: { value: '#0000ff' } });
    expect(screen.getByLabelText('Mixed color')).toHaveValue('#800080');
  });

  it('computes the contrast ratio for black on white', () => {
    render(<ColorMathTool />);
    fireEvent.change(screen.getByLabelText('Color A'), { target: { value: '#000000' } });
    fireEvent.change(screen.getByLabelText('Color B'), { target: { value: '#ffffff' } });
    expect(screen.getByLabelText('Contrast ratio')).toHaveValue('21.00:1');
  });

  it('shows WCAG AA and AAA pass for black on white normal text', () => {
    render(<ColorMathTool />);
    fireEvent.change(screen.getByLabelText('Color A'), { target: { value: '#000000' } });
    fireEvent.change(screen.getByLabelText('Color B'), { target: { value: '#ffffff' } });
    expect(screen.getByText('AA Pass')).toBeInTheDocument();
    expect(screen.getByText('AAA Pass')).toBeInTheDocument();
  });

  it('shows WCAG failures for low-contrast colors', () => {
    render(<ColorMathTool />);
    fireEvent.change(screen.getByLabelText('Color A'), { target: { value: '#888888' } });
    fireEvent.change(screen.getByLabelText('Color B'), { target: { value: '#999999' } });
    expect(screen.getByText('AA Fail')).toBeInTheDocument();
    expect(screen.getByText('AAA Fail')).toBeInTheDocument();
  });

  it('shows an error for an invalid hex color', () => {
    render(<ColorMathTool />);
    fireEvent.change(screen.getByLabelText('Color A'), { target: { value: '#zzzzzz' } });
    expect(screen.getByText(/invalid hex color/i)).toBeInTheDocument();
  });

  it('clears input on Clear click', () => {
    render(<ColorMathTool />);
    const input = screen.getByLabelText('Color A') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#123456' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

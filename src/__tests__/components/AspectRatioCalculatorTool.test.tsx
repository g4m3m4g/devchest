import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AspectRatioCalculatorTool from '../../components/tools/numbers/AspectRatioCalculatorTool';

describe('AspectRatioCalculatorTool', () => {
  it('renders the tool title', () => {
    render(<AspectRatioCalculatorTool />);
    expect(screen.getByText('Aspect Ratio Calculator')).toBeInTheDocument();
  });

  it('simplifies 1920x1080 to 16:9', () => {
    render(<AspectRatioCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Width'), { target: { value: '1920' } });
    fireEvent.change(screen.getByLabelText('Height'), { target: { value: '1080' } });
    expect(screen.getByLabelText('Simplified ratio')).toHaveValue('16:9');
  });

  it('resolves height from a target ratio and known width', () => {
    render(<AspectRatioCalculatorTool />);
    fireEvent.change(screen.getByLabelText('Ratio width'), { target: { value: '16' } });
    fireEvent.change(screen.getByLabelText('Ratio height'), { target: { value: '9' } });
    fireEvent.change(screen.getByLabelText('Target width'), { target: { value: '1920' } });
    expect(screen.getByLabelText('Resolved height')).toHaveValue('1080');
  });

  it('clears all inputs on Clear click', () => {
    render(<AspectRatioCalculatorTool />);
    const width = screen.getByLabelText('Width') as HTMLInputElement;
    fireEvent.change(width, { target: { value: '1920' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(width.value).toBe('');
  });
});

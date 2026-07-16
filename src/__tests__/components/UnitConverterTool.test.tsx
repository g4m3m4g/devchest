import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitConverterTool from '../../components/tools/numbers/UnitConverterTool';

describe('UnitConverterTool', () => {
  it('renders the tool title', () => {
    render(<UnitConverterTool />);
    expect(screen.getByText('Unit Converter')).toBeInTheDocument();
  });

  it('converts 1 meter to 100 centimeters', () => {
    render(<UnitConverterTool />);
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'm' } });
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'cm' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '1' } });
    expect(screen.getByLabelText('Result')).toHaveValue('100');
  });

  it('switches category and converts using the new category units', () => {
    render(<UnitConverterTool />);
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: 'temperature' } });
    fireEvent.change(screen.getByLabelText('From unit'), { target: { value: 'c' } });
    fireEvent.change(screen.getByLabelText('To unit'), { target: { value: 'f' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '0' } });
    expect(screen.getByLabelText('Result')).toHaveValue('32');
  });

  it('swaps from/to units on swap click', () => {
    render(<UnitConverterTool />);
    const fromSelect = screen.getByLabelText('From unit') as HTMLSelectElement;
    const toSelect = screen.getByLabelText('To unit') as HTMLSelectElement;
    fireEvent.change(fromSelect, { target: { value: 'm' } });
    fireEvent.change(toSelect, { target: { value: 'km' } });
    fireEvent.click(screen.getByTitle('Swap units'));
    expect(fromSelect.value).toBe('km');
    expect(toSelect.value).toBe('m');
  });

  it('clears the value on Clear click', () => {
    render(<UnitConverterTool />);
    const input = screen.getByLabelText('Value') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CronBuilderTool from '../../components/tools/data/CronBuilderTool';

describe('CronBuilderTool', () => {
  it('renders the tool title', () => {
    render(<CronBuilderTool />);
    expect(screen.getByText('cron Expression Parser & Builder')).toBeInTheDocument();
  });

  it('renders the Expression and Result panels', () => {
    render(<CronBuilderTool />);
    expect(screen.getByText('Expression')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
  });

  it('shows "Every minute" and a Valid badge for the default expression', () => {
    render(<CronBuilderTool />);
    expect(screen.getByText('Every minute')).toBeInTheDocument();
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('updates the description when the expression is typed directly', () => {
    render(<CronBuilderTool />);
    const exprInput = screen.getByPlaceholderText(/9-17/);
    fireEvent.change(exprInput, { target: { value: '30 9 * * *' } });
    expect(screen.getByText('At 09:30')).toBeInTheDocument();
  });

  it('shows an Invalid badge and errors for a malformed expression', () => {
    render(<CronBuilderTool />);
    const exprInput = screen.getByPlaceholderText(/9-17/);
    fireEvent.change(exprInput, { target: { value: '99 * * * *' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(document.body).toHaveTextContent('Minute');
  });

  it('lists upcoming run times for a valid expression', () => {
    render(<CronBuilderTool />);
    const exprInput = screen.getByPlaceholderText(/9-17/);
    fireEvent.change(exprInput, { target: { value: '0 0 * * *' } });
    expect(screen.getByText('Next runs')).toBeInTheDocument();
  });

  it('switching the Minute field mode to Range updates the expression', () => {
    render(<CronBuilderTool />);
    const minuteMode = screen.getByLabelText('Minute mode');
    fireEvent.change(minuteMode, { target: { value: 'range' } });
    const exprInput = screen.getByPlaceholderText(/9-17/) as HTMLInputElement;
    expect(exprInput.value.startsWith('0-59 ')).toBe(true);
  });

  it('adjusting the Hour range start/end updates the expression', () => {
    render(<CronBuilderTool />);
    const hourMode = screen.getByLabelText('Hour mode');
    fireEvent.change(hourMode, { target: { value: 'range' } });
    const hourStart = screen.getByLabelText('Hour start');
    const hourEnd = screen.getByLabelText('Hour end');
    fireEvent.change(hourStart, { target: { value: '9' } });
    fireEvent.change(hourEnd, { target: { value: '17' } });
    const exprInput = screen.getByPlaceholderText(/9-17/) as HTMLInputElement;
    expect(exprInput.value).toBe('* 9-17 * * *');
  });

  it('switching the Day of Week field to Step updates the expression', () => {
    render(<CronBuilderTool />);
    const dowMode = screen.getByLabelText('Day of Week mode');
    fireEvent.change(dowMode, { target: { value: 'step' } });
    const exprInput = screen.getByPlaceholderText(/9-17/) as HTMLInputElement;
    expect(exprInput.value.endsWith(' */1')).toBe(true);
  });

  it('clears the expression back to the default when Clear is clicked', async () => {
    const user = userEvent.setup();
    render(<CronBuilderTool />);
    const exprInput = screen.getByPlaceholderText(/9-17/) as HTMLInputElement;
    fireEvent.change(exprInput, { target: { value: '30 9 * * *' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(exprInput.value).toBe('* * * * *');
  });

  it('pastes text into the expression field when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('0 9 * * 1-5');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<CronBuilderTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const exprInput = screen.getByPlaceholderText(/9-17/) as HTMLInputElement;
    await waitFor(() => {
      expect(exprInput.value).toBe('0 9 * * 1-5');
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimestampConverter from '../../components/tools/generators/TimestampConverter';

describe('TimestampConverter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the tool title', () => {
    render(<TimestampConverter />);
    expect(screen.getByText('Timestamp Converter')).toBeInTheDocument();
  });

  it('shows the current time ticker', () => {
    render(<TimestampConverter />);
    expect(screen.getByText('Current Time')).toBeInTheDocument();
    // Should show the unix timestamp for 2024-01-15T12:00:00Z
    expect(screen.getByText('1705320000')).toBeInTheDocument();
  });

  it('converts Unix timestamp to ISO date', () => {
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/e.g. 1700000000/);
    fireEvent.change(input, { target: { value: '1700000000' } });
    expect(document.body).toHaveTextContent('2023');
  });

  it('shows all conversion fields for a Unix timestamp', () => {
    render(<TimestampConverter />);
    const input = screen.getByPlaceholderText(/e.g. 1700000000/);
    fireEvent.change(input, { target: { value: '1700000000' } });
    // 'ISO 8601' appears in both conversion results and static Common Date Formats section
    expect(screen.getAllByText('ISO 8601').length).toBeGreaterThanOrEqual(2);
    // These labels only appear in conversion results
    expect(screen.getByText('Local')).toBeInTheDocument();
    expect(screen.getByText('UTC')).toBeInTheDocument();
    expect(screen.getByText('Relative')).toBeInTheDocument();
    expect(screen.getByText('Milliseconds')).toBeInTheDocument();
  });

  it('converts ISO date string to Unix timestamp', () => {
    render(<TimestampConverter />);
    const dateInput = screen.getByPlaceholderText(/e.g. 2024-01-15/);
    fireEvent.change(dateInput, { target: { value: '2024-01-15T12:00:00Z' } });
    expect(document.body).toHaveTextContent('1705320000');
  });

  it('shows "Use Now" button', () => {
    render(<TimestampConverter />);
    expect(screen.getByRole('button', { name: /use now/i })).toBeInTheDocument();
  });

  it('fills inputs with current time when "Use Now" clicked', () => {
    render(<TimestampConverter />);
    // Use fireEvent.click to avoid userEvent timer interaction with setInterval
    fireEvent.click(screen.getByRole('button', { name: /use now/i }));
    const unixInput = screen.getByPlaceholderText(/e.g. 1700000000/) as HTMLInputElement;
    expect(unixInput.value).toBe('1705320000');
  });

  it('shows common date format examples', () => {
    render(<TimestampConverter />);
    expect(screen.getAllByText('ISO 8601').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('RFC 2822')).toBeInTheDocument();
  });

  it('clears both inputs on Clear click', () => {
    render(<TimestampConverter />);
    const unixInput = screen.getByPlaceholderText(/e.g. 1700000000/) as HTMLInputElement;
    fireEvent.change(unixInput, { target: { value: '1700000000' } });
    // Use fireEvent.click to avoid userEvent timer interaction with setInterval
    fireEvent.click(screen.getByTitle('Clear all'));
    expect(unixInput.value).toBe('');
  });
});

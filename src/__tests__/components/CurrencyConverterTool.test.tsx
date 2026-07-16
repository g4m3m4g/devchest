import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CurrencyConverterTool from '../../components/tools/numbers/CurrencyConverterTool';

describe('CurrencyConverterTool', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the tool title', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ rates: {} }) }));
    render(<CurrencyConverterTool />);
    expect(screen.getByText('Currency Converter')).toBeInTheDocument();
  });

  it('shows a loading state while fetching rates', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
    render(<CurrencyConverterTool />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('converts an amount once rates load', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ rates: { EUR: 0.9, USD: 1 } }),
    }));
    render(<CurrencyConverterTool />);

    await waitFor(() => expect(screen.queryByText(/loading/i)).not.toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText('To currency'), { target: { value: 'EUR' } });

    expect(screen.getByLabelText('Result')).toHaveValue('9');
  });

  it('shows an error state and a retry button when the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    render(<CurrencyConverterTool />);

    await waitFor(() => expect(screen.getByText(/network down/i)).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});

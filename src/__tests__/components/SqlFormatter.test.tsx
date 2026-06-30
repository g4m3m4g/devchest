import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SqlFormatter from '../../components/tools/formatters/SqlFormatter';

describe('SqlFormatter', () => {
  it('renders the tool title', () => {
    render(<SqlFormatter />);
    expect(screen.getByText('SQL Formatter')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<SqlFormatter />);
    expect(screen.getByText('Raw SQL')).toBeInTheDocument();
    expect(screen.getByText('Formatted SQL')).toBeInTheDocument();
  });

  it('formats a simple SELECT statement', async () => {
    const user = userEvent.setup();
    render(<SqlFormatter />);
    const textarea = screen.getByPlaceholderText(/SELECT/);
    await user.type(textarea, 'select id,name from users where active=1');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('SELECT');
    expect(pre?.textContent).toContain('FROM');
    expect(pre?.textContent).toContain('WHERE');
  });

  it('uppercases SQL keywords', async () => {
    const user = userEvent.setup();
    render(<SqlFormatter />);
    const textarea = screen.getByPlaceholderText(/SELECT/);
    await user.type(textarea, 'select * from users');
    const pre = document.querySelector('pre');
    expect(pre?.textContent).toContain('SELECT');
    expect(pre?.textContent).toContain('FROM');
  });

  it('shows dialect selector', () => {
    render(<SqlFormatter />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('changes dialect via selector', async () => {
    const user = userEvent.setup();
    render(<SqlFormatter />);
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'mysql');
    expect((select as HTMLSelectElement).value).toBe('mysql');
  });

  it('clears input on Clear click', async () => {
    const user = userEvent.setup();
    render(<SqlFormatter />);
    const textarea = screen.getByPlaceholderText(/SELECT/) as HTMLTextAreaElement;
    await user.type(textarea, 'select 1');
    await user.click(screen.getByTitle('Clear all'));
    expect(textarea.value).toBe('');
  });
});

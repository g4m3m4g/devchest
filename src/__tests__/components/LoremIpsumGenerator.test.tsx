import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoremIpsumGenerator from '../../components/tools/text/LoremIpsumGenerator';

describe('LoremIpsumGenerator', () => {
  it('renders the tool title', () => {
    render(<LoremIpsumGenerator />);
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
  });

  it('shows a placeholder before generating', () => {
    render(<LoremIpsumGenerator />);
    expect(screen.getByText(/Click Generate to produce placeholder text/)).toBeInTheDocument();
  });

  it('generates paragraphs starting with the classic opening by default', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGenerator />);
    await user.click(screen.getByRole('button', { name: /Generate/ }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent?.startsWith('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')).toBe(true);
  });

  it('generates the requested number of paragraphs', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGenerator />);
    const countInput = screen.getByDisplayValue('3');
    fireEvent.change(countInput, { target: { value: '5' } });
    await user.click(screen.getByRole('button', { name: /Generate/ }));
    const pre = document.querySelector('pre');
    const paragraphs = pre?.textContent?.split('\n\n') ?? [];
    expect(paragraphs).toHaveLength(5);
  });

  it('switches to Words mode and generates the requested count', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGenerator />);
    await user.click(screen.getByRole('button', { name: 'Words' }));
    const countInput = screen.getByDisplayValue('3');
    fireEvent.change(countInput, { target: { value: '10' } });
    await user.click(screen.getByRole('button', { name: /Generate/ }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent?.split(' ')).toHaveLength(10);
  });

  it('omits the classic opening when the checkbox is unchecked', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGenerator />);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Generate/ }));
    const pre = document.querySelector('pre');
    expect(pre?.textContent).not.toBe('');
  });

  it('clears the output on Clear click', async () => {
    const user = userEvent.setup();
    render(<LoremIpsumGenerator />);
    await user.click(screen.getByRole('button', { name: /Generate/ }));
    await user.click(screen.getByTitle('Clear all'));
    expect(screen.getByText(/Click Generate to produce placeholder text/)).toBeInTheDocument();
  });
});

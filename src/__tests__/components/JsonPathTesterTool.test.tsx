import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonPathTesterTool from '../../components/tools/data/JsonPathTesterTool';

describe('JsonPathTesterTool', () => {
  it('renders the tool title', () => {
    render(<JsonPathTesterTool />);
    expect(screen.getByText('JSON Path Tester')).toBeInTheDocument();
  });

  it('renders input and output panels', () => {
    render(<JsonPathTesterTool />);
    expect(screen.getByText('Input JSON')).toBeInTheDocument();
    expect(screen.getByText('Matches')).toBeInTheDocument();
  });

  it('evaluates a JSONPath query against the input JSON', () => {
    render(<JsonPathTesterTool />);
    const jsonArea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(jsonArea, { target: { value: '{"store":{"book":[{"title":"Book A"}]}}' } });
    const pathInput = screen.getByPlaceholderText('$.store.book[0].title');
    fireEvent.change(pathInput, { target: { value: '$.store.book[0].title' } });
    expect(document.body).toHaveTextContent('Book A');
  });

  it('shows a match count badge', () => {
    render(<JsonPathTesterTool />);
    const jsonArea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(jsonArea, { target: { value: '{"a":[1,2,3]}' } });
    const pathInput = screen.getByPlaceholderText('$.store.book[0].title');
    fireEvent.change(pathInput, { target: { value: '$.a[*]' } });
    expect(document.body).toHaveTextContent('3 matches');
  });

  it('shows an error badge for invalid JSON', () => {
    render(<JsonPathTesterTool />);
    const jsonArea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(jsonArea, { target: { value: '{bad json}' } });
    const pathInput = screen.getByPlaceholderText('$.store.book[0].title');
    fireEvent.change(pathInput, { target: { value: '$.a' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows an error badge for a malformed path', () => {
    render(<JsonPathTesterTool />);
    const jsonArea = screen.getByPlaceholderText(/\{/);
    fireEvent.change(jsonArea, { target: { value: '{"a":1}' } });
    const pathInput = screen.getByPlaceholderText('$.store.book[0].title');
    fireEvent.change(pathInput, { target: { value: '$.[' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('clears input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonPathTesterTool />);
    const jsonArea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    fireEvent.change(jsonArea, { target: { value: '{"a":1}' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(jsonArea.value).toBe('');
  });

  it('pastes text when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('{"pasted":true}');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<JsonPathTesterTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const jsonArea = screen.getByPlaceholderText(/\{/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(jsonArea.value).toBe('{"pasted":true}');
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OpenApiValidatorTool from '../../components/tools/data/OpenApiValidatorTool';

const validDoc = JSON.stringify({
  openapi: '3.0.0',
  info: { title: 'Sample API', version: '1.0.0' },
  paths: {
    '/pets': { get: { responses: { '200': { description: 'OK' } } } },
  },
});

describe('OpenApiValidatorTool', () => {
  it('renders the tool title', () => {
    render(<OpenApiValidatorTool />);
    expect(screen.getByText('OpenAPI / Swagger Validator')).toBeInTheDocument();
  });

  it('renders document and results panels', () => {
    render(<OpenApiValidatorTool />);
    expect(screen.getByText('OpenAPI / Swagger Document')).toBeInTheDocument();
    expect(screen.getByText('Validation Result')).toBeInTheDocument();
  });

  it('shows a Valid badge and detected version for a well-formed document', () => {
    render(<OpenApiValidatorTool />);
    const input = screen.getByPlaceholderText(/openapi/);
    fireEvent.change(input, { target: { value: validDoc } });
    expect(document.body).toHaveTextContent('Valid (3.0.0)');
  });

  it('shows violation messages for a document missing required fields', () => {
    render(<OpenApiValidatorTool />);
    const input = screen.getByPlaceholderText(/openapi/);
    fireEvent.change(input, { target: { value: '{"openapi":"3.0.0"}' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(document.body).toHaveTextContent("Missing required object 'info'");
  });

  it('shows a parse error for invalid input', () => {
    render(<OpenApiValidatorTool />);
    const input = screen.getByPlaceholderText(/openapi/);
    fireEvent.change(input, { target: { value: '{not valid' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('clears the input when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<OpenApiValidatorTool />);
    const input = screen.getByPlaceholderText(/openapi/) as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: validDoc } });
    await user.click(screen.getByTitle('Clear all'));
    expect(input.value).toBe('');
  });

  it('pastes text into the document field when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue(validDoc);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<OpenApiValidatorTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const input = screen.getByPlaceholderText(/openapi/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(input.value).toBe(validDoc);
    });
  });
});

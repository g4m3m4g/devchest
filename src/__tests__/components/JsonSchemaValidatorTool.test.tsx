import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonSchemaValidatorTool from '../../components/tools/data/JsonSchemaValidatorTool';

describe('JsonSchemaValidatorTool', () => {
  it('renders the tool title', () => {
    render(<JsonSchemaValidatorTool />);
    expect(screen.getByText('JSON Schema Validator')).toBeInTheDocument();
  });

  it('renders instance, schema, and results panels', () => {
    render(<JsonSchemaValidatorTool />);
    expect(screen.getByText('Instance JSON')).toBeInTheDocument();
    expect(screen.getByText('JSON Schema')).toBeInTheDocument();
    expect(screen.getByText('Validation Result')).toBeInTheDocument();
  });

  it('shows a Valid badge when the instance matches the schema', () => {
    render(<JsonSchemaValidatorTool />);
    const instanceArea = screen.getByPlaceholderText(/"name"/);
    const schemaArea = screen.getByPlaceholderText(/"type": "object"/);
    fireEvent.change(schemaArea, { target: { value: '{"type":"object","required":["name"]}' } });
    fireEvent.change(instanceArea, { target: { value: '{"name":"Alice"}' } });
    expect(screen.getByText('Valid')).toBeInTheDocument();
  });

  it('shows violation messages when the instance does not match the schema', () => {
    render(<JsonSchemaValidatorTool />);
    const instanceArea = screen.getByPlaceholderText(/"name"/);
    const schemaArea = screen.getByPlaceholderText(/"type": "object"/);
    fireEvent.change(schemaArea, { target: { value: '{"type":"object","required":["name"]}' } });
    fireEvent.change(instanceArea, { target: { value: '{}' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
    expect(document.body).toHaveTextContent("Missing required property 'name'");
  });

  it('shows a parse error for invalid instance JSON', () => {
    render(<JsonSchemaValidatorTool />);
    const instanceArea = screen.getByPlaceholderText(/"name"/);
    const schemaArea = screen.getByPlaceholderText(/"type": "object"/);
    fireEvent.change(schemaArea, { target: { value: '{"type":"object"}' } });
    fireEvent.change(instanceArea, { target: { value: '{bad json}' } });
    expect(screen.getByText('Invalid')).toBeInTheDocument();
  });

  it('clears both inputs when Clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<JsonSchemaValidatorTool />);
    const instanceArea = screen.getByPlaceholderText(/"name"/) as HTMLTextAreaElement;
    fireEvent.change(instanceArea, { target: { value: '{"a":1}' } });
    await user.click(screen.getByTitle('Clear all'));
    expect(instanceArea.value).toBe('');
  });

  it('pastes text into the instance field when Paste button is clicked', async () => {
    const user = userEvent.setup();
    const readTextFn = vi.fn().mockResolvedValue('{"pasted":true}');
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined), readText: readTextFn },
      configurable: true,
      writable: true,
    });
    render(<JsonSchemaValidatorTool />);
    await user.click(screen.getByTitle('Paste from clipboard'));
    const instanceArea = screen.getByPlaceholderText(/"name"/) as HTMLTextAreaElement;
    await waitFor(() => {
      expect(instanceArea.value).toBe('{"pasted":true}');
    });
  });
});

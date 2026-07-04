import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../../App';

describe('App routing', () => {
  it('renders the tool catalog at the root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Welcome to DevChest' })).toBeInTheDocument();
  });

  it('renders the matching tool at /tools/:toolId', async () => {
    render(
      <MemoryRouter initialEntries={['/tools/uuid-generator/']}>
        <App />
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: 'UUID Generator' }, { timeout: 5000 })).toBeInTheDocument();
  });

  it('shows a not-found view for an unknown path', () => {
    render(
      <MemoryRouter initialEntries={['/nope']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Tool not found' })).toBeInTheDocument();
  });

  it('redirects to the catalog for an unknown toolId', () => {
    render(
      <MemoryRouter initialEntries={['/tools/does-not-exist/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Welcome to DevChest' })).toBeInTheDocument();
  });
});

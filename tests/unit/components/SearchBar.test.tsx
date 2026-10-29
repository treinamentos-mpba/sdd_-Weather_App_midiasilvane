import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../../src/components/SearchBar';

describe('SearchBar', () => {
  it('does not submit an empty query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar query="" onQueryChange={vi.fn()} onSearch={onSearch} />);

    expect(screen.getByRole('searchbox', { name: 'Buscar cidade' })).toBeInTheDocument();
    expect(
      screen.getByText('O nome da cidade pesquisada será enviado à Open-Meteo.'),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');
  });

  it('does not submit a query containing only spaces', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar query="   " onQueryChange={vi.fn()} onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Digite o nome de uma cidade.');
  });

  it('submits the entered query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar query="São Paulo" onQueryChange={vi.fn()} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it('preserves accents, hyphens, and apostrophes in the submitted query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    const query = "São Tomé-d'Ávila";

    render(<SearchBar query={query} onQueryChange={vi.fn()} onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith(query);
  });
});

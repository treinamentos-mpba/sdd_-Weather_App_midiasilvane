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
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('submits the entered query', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar query="São Paulo" onQueryChange={vi.fn()} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });
});

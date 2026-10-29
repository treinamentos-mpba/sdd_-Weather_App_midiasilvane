import { useState } from 'react';

export interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
}

export default function SearchBar({ query, onQueryChange, onSearch }: SearchBarProps) {
  const [validationMessage, setValidationMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setValidationMessage('Digite o nome de uma cidade.');
      return;
    }

    setValidationMessage('');
    onSearch(query);
  }

  function handleQueryChange(value: string) {
    if (value.trim()) setValidationMessage('');
    onQueryChange(value);
  }

  return (
    <form
      role="search"
      aria-label="Buscar cidades"
      onSubmit={handleSubmit}
      className="flex w-full flex-wrap gap-2"
    >
      <label className="sr-only" htmlFor="city-search">
        Buscar cidade
      </label>
      <input
        id="city-search"
        type="search"
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        aria-invalid={validationMessage ? true : undefined}
        aria-describedby={`city-search-privacy${validationMessage ? ' city-search-error' : ''}`}
        placeholder="Buscar cidade"
        className="min-h-11 min-w-0 flex-1 rounded-md border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-white/65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-400"
      />
      <button
        type="submit"
        className="min-h-11 rounded-md bg-accent-600 px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
      >
        Buscar
      </button>
      {validationMessage && (
        <p id="city-search-error" role="alert" className="basis-full text-sm text-white">
          {validationMessage}
        </p>
      )}
      <p id="city-search-privacy" className="basis-full text-xs text-white/70">
        O nome da cidade pesquisada será enviado à Open-Meteo.
      </p>
    </form>
  );
}

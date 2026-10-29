import { useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit, WeatherData } from './types/weather';

function getErrorMessage(kind?: string): string {
  if (kind === 'timeout') return 'A consulta demorou demais. Tente novamente.';
  if (kind === 'network') return 'Não foi possível conectar ao serviço de clima.';
  return 'O serviço não conseguiu carregar os dados do clima.';
}

export default function App() {
  const [unit, setUnit] = useState<Unit>('celsius');
  const [searchText, setSearchText] = useState('');
  const { status, data, error, query, search, retry } = useWeather();

  function renderWeather(data: WeatherData) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-white/55">Condições locais</p>
            <h1 className="mt-1 text-3xl font-semibold text-white">{data.city.name}</h1>
          </div>
          <p className="text-xs text-white/70">Dados demonstrativos</p>
        </div>
        {data.isPartial && (
          <p role="status" className="text-sm text-white/65">
            Parte dos dados está indisponível.
          </p>
        )}
        <CurrentWeather city={data.city} current={data.current} unit={unit} />
        <ForecastList forecastDays={data.forecastDays} unit={unit} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <header className="border-b border-white/10 bg-night-900/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center">
          <a href="/" className="flex shrink-0 items-center gap-2 self-start md:self-auto">
            <span aria-hidden="true" className="text-2xl text-sun">
              ☀
            </span>
            <span className="text-lg font-bold tracking-wide">clima</span>
          </a>
          <div className="flex min-w-0 flex-col gap-3 md:ml-auto md:w-full md:max-w-2xl md:flex-row md:items-center">
            <SearchBar
              query={searchText}
              onQueryChange={setSearchText}
              onSearch={(name) => {
                void search(name);
              }}
            />
            <div className="self-end md:self-auto">
              <UnitToggle unit={unit} onChange={setUnit} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {status === 'idle' && (
          <section className="flex min-h-[48vh] flex-col justify-center border-b border-white/10 py-12">
            <span aria-hidden="true" className="text-5xl">
              ☁️
            </span>
            <p className="mt-6 text-sm font-medium text-accent-400">CLIMA LOCAL</p>
            <h1 className="mt-2 max-w-2xl text-4xl font-semibold sm:text-5xl">
              Uma leitura clara do tempo.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/60">
              Busque São Paulo para abrir a previsão de demonstração.
            </p>
          </section>
        )}

        {status === 'loading' && (
          <div className="mx-auto mt-10 max-w-2xl">
            <LoadingState message={`Buscando o clima de ${query}...`} />
          </div>
        )}

        {status === 'empty' && (
          <div className="mx-auto mt-10 max-w-2xl">
            <EmptyState
              title="Nenhuma cidade encontrada"
              tip={`Não encontramos resultados para “${query}”. Confira a grafia e tente novamente.`}
            />
          </div>
        )}

        {status === 'error' && (
          <div className="mx-auto mt-10 max-w-2xl">
            <ErrorState
              message={getErrorMessage(error?.kind)}
              onRetry={() => {
                void retry();
              }}
            />
          </div>
        )}

        {status === 'success' && data && renderWeather(data)}
      </main>
    </div>
  );
}

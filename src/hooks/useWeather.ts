import { useEffect, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

type LastOperation = { kind: 'search'; name: string } | { kind: 'weather'; city: City };

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: WeatherServiceError | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

function toWeatherServiceError(error: unknown): WeatherServiceError {
  if (error instanceof WeatherServiceError) return error;
  return new WeatherServiceError(undefined, undefined, 'network');
}

function getRetryDeadline(retryAfter: string): number {
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds)) return Date.now() + Math.max(0, seconds) * 1000;

  const date = Date.parse(retryAfter);
  return Number.isNaN(date) ? 0 : date;
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<WeatherServiceError | null>(null);
  const [query, setQuery] = useState('');

  const requestIdRef = useRef(0);
  const lastOperationRef = useRef<LastOperation | null>(null);
  const retryAfterRef = useRef(0);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
    },
    [],
  );

  function applyError(caughtError: unknown, requestId: number) {
    if (requestId !== requestIdRef.current) return;

    const serviceError = toWeatherServiceError(caughtError);
    retryAfterRef.current =
      serviceError.statusCode === 429 && serviceError.retryAfter
        ? getRetryDeadline(serviceError.retryAfter)
        : 0;
    setError(serviceError);
    setStatus('error');
  }

  async function loadWeather(city: City, requestId: number): Promise<void> {
    try {
      const weather = await getWeather(city);
      if (requestId !== requestIdRef.current) return;

      setData(weather);
      setError(null);
      retryAfterRef.current = 0;
      setStatus('success');
    } catch (caughtError) {
      applyError(caughtError, requestId);
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    const requestId = ++requestIdRef.current;

    setQuery(normalizedName);
    setError(null);
    setData(null);
    retryAfterRef.current = 0;

    if (!normalizedName) {
      lastOperationRef.current = null;
      setCities([]);
      setStatus('idle');
      return;
    }

    lastOperationRef.current = { kind: 'search', name: normalizedName };
    setCities([]);
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);
      if (requestId !== requestIdRef.current) return;

      setCities(results);
      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      const firstCity = results[0];
      lastOperationRef.current = { kind: 'weather', city: firstCity };
      await loadWeather(firstCity, requestId);
    } catch (caughtError) {
      applyError(caughtError, requestId);
    }
  }

  async function selectCity(city: City): Promise<void> {
    const requestId = ++requestIdRef.current;
    lastOperationRef.current = { kind: 'weather', city };
    retryAfterRef.current = 0;
    setData(null);
    setError(null);
    setStatus('loading');
    await loadWeather(city, requestId);
  }

  async function retry(): Promise<void> {
    if (Date.now() < retryAfterRef.current) return;

    const lastOperation = lastOperationRef.current;
    if (!lastOperation) return;

    if (lastOperation.kind === 'search') {
      await search(lastOperation.name);
      return;
    }

    await selectCity(lastOperation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}

export default useWeather;

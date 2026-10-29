import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => {
  class MockWeatherServiceError extends Error {
    readonly kind: string;
    readonly statusCode?: number;
    readonly retryAfter?: string;

    constructor(statusCode?: number, retryAfter?: string, kind = 'http') {
      super(
        kind === 'network'
          ? 'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.'
          : kind === 'timeout'
            ? 'A consulta excedeu o tempo limite. Verifique sua conexão e tente novamente.'
            : 'Mock service error',
      );
      this.name = 'WeatherServiceError';
      this.statusCode = statusCode;
      this.retryAfter = retryAfter;
      this.kind = kind;
    }
  }

  return {
    getWeather: vi.fn(),
    searchCities: vi.fn(),
    WeatherServiceError: MockWeatherServiceError,
  };
});

const cityA: City = {
  name: 'Cidade A',
  latitude: -23.55,
  longitude: -46.63,
};

const cityB: City = {
  name: 'Cidade B',
  latitude: -22.9,
  longitude: -43.2,
};

function createWeatherData(city: City): WeatherData {
  return {
    city,
    timezone: 'America/Sao_Paulo',
    current: { temperatureC: 20, weatherCode: 1, observedAt: '2026-10-29T12:00' },
    forecastDays: [],
    fetchedAt: '2026-10-29T15:00:00.000Z',
    isPartial: false,
  };
}

beforeEach(() => {
  vi.mocked(searchCities).mockReset();
  vi.mocked(getWeather).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWeather API error handling', () => {
  it('shows a friendly offline error and retries the failed weather request', async () => {
    vi.mocked(searchCities).mockResolvedValue([cityA]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError(undefined, undefined, 'network'))
      .mockResolvedValueOnce(createWeatherData(cityA));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade A');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data).toBeNull();
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(cityA);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error?.message).toContain('Verifique sua conexão');
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.name).toBe('Cidade A');
  });

  it('does not retry HTTP 429 before Retry-After and retries after the deadline', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-29T12:00:00Z'));
    vi.mocked(searchCities).mockResolvedValue([cityA]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError(429, '2'))
      .mockResolvedValueOnce(createWeatherData(cityA));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Cidade A');
    });
    expect(result.current.status).toBe('success');
    expect(getWeather).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(cityA);
    });
    expect(result.current.status).toBe('error');
    expect(getWeather).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.retry();
    });
    expect(getWeather).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
      await result.current.retry();
    });

    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.name).toBe('Cidade A');
  });

  it('ignores a stale weather response after a newer city succeeds', async () => {
    let resolveWeatherA: (weather: WeatherData) => void = () => undefined;
    vi.mocked(searchCities).mockImplementation(async (name) => [name === 'A' ? cityA : cityB]);
    vi.mocked(getWeather).mockImplementation((city) => {
      if (city.name === cityA.name) {
        return new Promise((resolve) => {
          resolveWeatherA = resolve;
        });
      }

      return Promise.resolve(createWeatherData(cityB));
    });

    const { result } = renderHook(() => useWeather());
    let requestA: Promise<void> = Promise.resolve();

    await act(async () => {
      await result.current.search('A');
    });

    expect(getWeather).not.toHaveBeenCalled();
    act(() => {
      requestA = result.current.selectCity(cityA);
    });
    await waitFor(() => expect(getWeather).toHaveBeenCalledWith(cityA));

    await act(async () => {
      await result.current.search('B');
    });
    expect(getWeather).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.selectCity(cityB);
    });
    expect(result.current.data?.city.name).toBe('Cidade B');

    await act(async () => {
      resolveWeatherA(createWeatherData(cityA));
      await requestA;
    });

    expect(result.current.status).toBe('success');
    expect(result.current.data?.city.name).toBe('Cidade B');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

function createResponse(body: unknown, status = 200, retryAfter: string | null = null): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => (name.toLowerCase() === 'retry-after' ? retryAfter : null),
    },
    json: async () => body,
  } as unknown as Response;
}

const city: City = {
  id: 3448439,
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  region: 'São Paulo',
  country: 'Brasil',
  countryCode: 'BR',
  timezone: 'America/Sao_Paulo',
};

const forecastDates = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'];

const currentPayload = {
  time: '2026-10-29T12:00',
  temperature_2m: 22.1,
  weather_code: 2,
};

const dailyPayload = {
  time: forecastDates,
  weather_code: [2, 3, 61, 2, 1],
  temperature_2m_min: [17, 18, 16, 17, 18],
  temperature_2m_max: [25, 24, 21, 26, 27],
  precipitation_probability_max: [20, null, 75, 15, 5],
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('searchCities', () => {
  it('returns an empty list without calling fetch for blank input', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('   ')).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps geocoding results to City values', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        results: [
          {
            id: 3448439,
            name: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
            admin1: 'São Paulo',
            country: 'Brasil',
            country_code: 'BR',
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities('São Paulo')).resolves.toEqual([city]);
  });

  it('preserves accents and punctuation in the encoded geocoding name', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createResponse({ results: [] }));
    vi.stubGlobal('fetch', fetchMock);

    await searchCities("  São Tomé-d'Ávila  ");

    const requestedUrl = new URL(fetchMock.mock.calls[0][0] as string);
    expect(requestedUrl.searchParams.get('name')).toBe("São Tomé-d'Ávila");
    expect(requestedUrl.searchParams.get('language')).toBe('pt');
    expect(requestedUrl.searchParams.get('format')).toBe('json');
  });

  it('returns an empty list when results is absent', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse({})));
    await expect(searchCities('São Paulo')).resolves.toEqual([]);
  });

  it('throws WeatherServiceError for a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse({}, 503)));
    const request = searchCities('São Paulo');

    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({
      kind: 'http',
      statusCode: 503,
    });
  });

  it('classifies invalid geocoding JSON as an invalid response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => null },
        json: async () => {
          throw new SyntaxError('invalid JSON');
        },
      }),
    );

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'invalid-response',
    });
  });

  it('maps network failures to WeatherServiceError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'network',
      message: 'Falha de rede.',
    });
  });

  it('maps AbortError to timeout and clears the timeout timer', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn().mockImplementation(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const request = searchCities('São Paulo');
    const rejection = expect(request).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'timeout',
      message: 'A requisição demorou demais.',
    });

    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('preserves Retry-After for HTTP 429', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse({}, 429, '60')));

    await expect(searchCities('São Paulo')).rejects.toMatchObject({
      kind: 'http',
      statusCode: 429,
      retryAfter: '60',
    });
  });
});

describe('getWeather', () => {
  it('maps current and five daily records and maps null precipitation to zero', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      createResponse({
        timezone: 'America/Sao_Paulo',
        current: currentPayload,
        daily: dailyPayload,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await getWeather(city);

    expect(result.city).toEqual(city);
    expect(result.current).toEqual({
      temperatureC: 22.1,
      weatherCode: 2,
      observedAt: '2026-10-29T12:00',
    });
    expect(result.forecastDays).toHaveLength(5);
    expect(result.forecastDays[0]).toMatchObject({
      date: '2026-10-29',
      weatherCode: 2,
      minTemperatureC: 17,
      maxTemperatureC: 25,
      precipitationProbabilityPercent: 20,
    });
    expect(result.forecastDays[1].precipitationProbabilityPercent).toBe(0);
    expect(result.isPartial).toBe(false);
  });

  it('maps incomplete current fields and parallel daily arrays as partial data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createResponse({
          timezone: 'America/Sao_Paulo',
          current: { ...currentPayload, temperature_2m: null },
          daily: { ...dailyPayload, temperature_2m_min: [17, 18, 16, 17] },
        }),
      ),
    );

    const result = await getWeather(city);

    expect(result.isPartial).toBe(true);
    expect(result.current.temperatureC).toBeNull();
    expect(result.forecastDays).toHaveLength(5);
    expect(result.forecastDays[4].minTemperatureC).toBeNull();
    expect(result.forecastDays[0].maxTemperatureC).toBe(25);
  });

  it('throws WeatherServiceError for an HTTP forecast failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse({}, 503)));

    await expect(getWeather(city)).rejects.toMatchObject({
      name: 'WeatherServiceError',
      kind: 'http',
      statusCode: 503,
    });
  });

  it.each([
    ['current', { timezone: 'America/Sao_Paulo', daily: dailyPayload }],
    ['daily', { timezone: 'America/Sao_Paulo', current: currentPayload }],
  ])('throws WeatherServiceError when %s is absent', async (_missingSection, payload) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(createResponse(payload)));

    const request = getWeather(city);
    await expect(request).rejects.toBeInstanceOf(WeatherServiceError);
    await expect(request).rejects.toMatchObject({ kind: 'invalid-response' });
  });
});

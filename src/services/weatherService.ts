import type {
  City,
  CurrentWeather,
  ForecastDay,
  WeatherData,
  WeatherErrorKind,
} from '../types/weather';

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

export class WeatherServiceError extends Error {
  readonly kind: WeatherErrorKind;
  readonly statusCode?: number;
  readonly retryAfter?: string;

  constructor(
    statusCode?: number,
    retryAfter?: string,
    kind: WeatherErrorKind = 'http',
    message?: string,
  ) {
    super(
      message ??
        (kind === 'http'
          ? `Open-Meteo returned HTTP ${statusCode ?? 'unknown'}`
          : kind === 'timeout'
            ? 'A requisição demorou demais.'
            : kind === 'network'
              ? 'Falha de rede.'
              : 'Open-Meteo returned an incomplete or invalid forecast response'),
    );
    this.name = 'WeatherServiceError';
    this.kind = kind;
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
  }
}

interface GeocodingResult {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  country_code?: string;
  timezone?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toGeocodingResult(value: unknown): GeocodingResult | null {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude)
  ) {
    return null;
  }

  return {
    name: value.name,
    latitude: value.latitude,
    longitude: value.longitude,
    ...(typeof value.id === 'number' ? { id: value.id } : {}),
    ...(typeof value.admin1 === 'string' ? { admin1: value.admin1 } : {}),
    ...(typeof value.country === 'string' ? { country: value.country } : {}),
    ...(typeof value.country_code === 'string' ? { country_code: value.country_code } : {}),
    ...(typeof value.timezone === 'string' ? { timezone: value.timezone } : {}),
  };
}

function toCity(result: GeocodingResult): City {
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    ...(result.id !== undefined ? { id: result.id } : {}),
    ...(result.admin1 !== undefined ? { region: result.admin1 } : {}),
    ...(result.country !== undefined ? { country: result.country } : {}),
    ...(result.country_code !== undefined ? { countryCode: result.country_code } : {}),
    ...(result.timezone !== undefined ? { timezone: result.timezone } : {}),
  };
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'AbortError'
    ) {
      throw new WeatherServiceError(undefined, undefined, 'timeout');
    }

    throw new WeatherServiceError(undefined, undefined, 'network');
  } finally {
    clearTimeout(timeoutId);
  }
}

function readOptionalNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function throwForHttpError(response: Response): void {
  if (!response.ok) {
    const retryAfter = response.headers.get('Retry-After') ?? undefined;
    throw new WeatherServiceError(response.status, retryAfter);
  }
}

function parseForecastPayload(payload: unknown, city: City): WeatherData {
  if (!isRecord(payload) || !isRecord(payload.current) || !isRecord(payload.daily)) {
    throw new WeatherServiceError(undefined, undefined, 'invalid-response');
  }

  const { current, daily } = payload;
  const dates = daily.time;
  const timezone = typeof payload.timezone === 'string' ? payload.timezone : city.timezone;

  if (
    !Array.isArray(dates) ||
    dates.length < 5 ||
    dates.slice(0, 5).some((date) => typeof date !== 'string') ||
    !timezone
  ) {
    throw new WeatherServiceError(undefined, undefined, 'invalid-response');
  }

  let isPartial = false;
  const currentWeather: CurrentWeather = {
    temperatureC: readOptionalNumber(current.temperature_2m),
    weatherCode: readOptionalNumber(current.weather_code),
    observedAt: typeof current.time === 'string' ? current.time : null,
  };

  if (
    currentWeather.temperatureC === null ||
    currentWeather.weatherCode === null ||
    currentWeather.observedAt === null
  ) {
    isPartial = true;
  }

  function readDailyNumber(values: unknown, index: number): number | null {
    if (!Array.isArray(values) || values.length !== 5) isPartial = true;

    const result = Array.isArray(values) ? readOptionalNumber(values[index]) : null;
    if (result === null) isPartial = true;
    return result;
  }

  const forecastDays: ForecastDay[] = dates.slice(0, 5).map((date, index) => {
    const weatherCode = readDailyNumber(daily.weather_code, index);
    const minTemperatureC = readDailyNumber(daily.temperature_2m_min, index);
    const maxTemperatureC = readDailyNumber(daily.temperature_2m_max, index);
    const precipitationValue = Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max[index]
      : undefined;
    const precipitationProbabilityPercent =
      precipitationValue === null ? 0 : readOptionalNumber(precipitationValue);

    return {
      date: date as string,
      weatherCode,
      minTemperatureC,
      maxTemperatureC,
      ...(precipitationProbabilityPercent !== null ? { precipitationProbabilityPercent } : {}),
    };
  });

  return {
    city,
    timezone,
    current: currentWeather,
    forecastDays,
    fetchedAt: new Date().toISOString(),
    isPartial,
  };
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();
  if (!normalizedName) return [];

  const response = await fetchWithTimeout(
    `${GEOCODING_API_URL}?name=${encodeURIComponent(normalizedName)}&language=pt&format=json`,
  );
  throwForHttpError(response);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(undefined, undefined, 'invalid-response');
  }

  if (!isRecord(payload) || !Array.isArray(payload.results)) return [];

  return payload.results
    .map(toGeocodingResult)
    .filter((result): result is GeocodingResult => result !== null)
    .map(toCity);
}

export async function getWeather(city: City): Promise<WeatherData> {
  const url = new URL(FORECAST_API_URL);
  url.search = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'celsius',
    timezone: 'auto',
    forecast_days: '5',
  }).toString();

  const response = await fetchWithTimeout(url);
  throwForHttpError(response);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new WeatherServiceError(undefined, undefined, 'invalid-response');
  }

  return parseForecastPayload(payload, city);
}

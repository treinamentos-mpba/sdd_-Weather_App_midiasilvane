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
          ? statusCode === 429
            ? 'O serviço de clima está recebendo muitas consultas. Aguarde antes de tentar novamente.'
            : statusCode !== undefined && statusCode >= 500
              ? 'O serviço de clima está temporariamente indisponível. Tente novamente.'
              : 'Não foi possível consultar o serviço de clima. Tente novamente mais tarde.'
          : kind === 'timeout'
            ? 'A consulta excedeu o tempo limite. Verifique sua conexão e tente novamente.'
            : kind === 'network'
              ? 'Não foi possível conectar ao serviço de clima. Verifique sua conexão e tente novamente.'
              : 'O serviço retornou dados inválidos. Tente novamente mais tarde.'),
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
    value.name.trim().length === 0 ||
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
  const timeoutId = setTimeout(() => controller.abort(), 8_000);

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
  const dates = Array.isArray(daily.time) ? daily.time : [];
  const responseTimezone =
    typeof payload.timezone === 'string' && payload.timezone.trim().length > 0
      ? payload.timezone
      : undefined;
  const cityTimezone = city.timezone?.trim() || undefined;
  const timezone = responseTimezone ?? cityTimezone ?? 'UTC';
  let isPartial =
    dates.length !== 5 ||
    (responseTimezone === undefined && cityTimezone === undefined) ||
    dates.slice(0, 5).some((date) => typeof date !== 'string' || date.trim().length === 0);
  const currentWeather: CurrentWeather = {
    temperatureC: readOptionalNumber(current.temperature_2m),
    weatherCode: readOptionalNumber(current.weather_code),
    observedAt:
      typeof current.time === 'string' && current.time.trim().length > 0 ? current.time : null,
    humidityPercent: readOptionalNumber(current.relative_humidity_2m),
    windSpeedKmh: readOptionalNumber(current.wind_speed_10m),
    precipitationMm: readOptionalNumber(current.precipitation),
    pressureHpa: readOptionalNumber(current.surface_pressure),
  };

  if (
    currentWeather.temperatureC === null ||
    currentWeather.weatherCode === null ||
    currentWeather.observedAt === null ||
    currentWeather.humidityPercent === null ||
    currentWeather.windSpeedKmh === null ||
    currentWeather.precipitationMm === null ||
    currentWeather.pressureHpa === null
  ) {
    isPartial = true;
  }

  function readDailyNumber(values: unknown, index: number): number | null {
    if (!Array.isArray(values) || values.length !== 5) isPartial = true;

    const result = Array.isArray(values) ? readOptionalNumber(values[index]) : null;
    if (result === null) isPartial = true;
    return result;
  }

  const forecastDays: ForecastDay[] = dates.slice(0, 5).flatMap((date, index) => {
    if (typeof date !== 'string' || date.trim().length === 0) {
      isPartial = true;
      return [];
    }

    const weatherCode = readDailyNumber(daily.weather_code, index);
    const minTemperatureC = readDailyNumber(daily.temperature_2m_min, index);
    const maxTemperatureC = readDailyNumber(daily.temperature_2m_max, index);
    const precipitationValue = Array.isArray(daily.precipitation_probability_max)
      ? daily.precipitation_probability_max[index]
      : undefined;
    const precipitationProbabilityPercent = readOptionalNumber(precipitationValue);
    if (precipitationProbabilityPercent === null) isPartial = true;

    return [
      {
        date,
        weatherCode,
        minTemperatureC,
        maxTemperatureC,
        precipitationProbabilityPercent,
      },
    ];
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
    current:
      'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
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

export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC: number | null;
  weatherCode: number | null;
  observedAt: string | null;
  humidityPercent?: number | null;
  windSpeedKmh?: number | null;
  precipitationMm?: number | null;
  pressureHpa?: number | null;
}

export interface ForecastDay {
  date: string;
  weatherCode: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  precipitationProbabilityPercent?: number | null;
}

export interface WeatherData {
  city: City;
  timezone: string;
  current: CurrentWeather;
  forecastDays: ForecastDay[];
  fetchedAt: string;
  isPartial: boolean;
}

export type WeatherErrorKind = 'network' | 'timeout' | 'http' | 'invalid-response';

export interface WeatherError {
  kind: WeatherErrorKind;
  statusCode?: number;
  retryAfter?: string;
}

export type RequestState<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; data: T }
  | { status: 'partial'; data: T; missingFields: string[] }
  | { status: 'empty' }
  | { status: 'error'; error: WeatherError };

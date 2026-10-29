import type { WeatherData } from '../types/weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3448439,
    name: 'São Paulo',
    latitude: -23.55,
    longitude: -46.63,
    region: 'São Paulo',
    country: 'Brasil',
    countryCode: 'BR',
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    temperatureC: 22.1,
    weatherCode: 2,
    observedAt: '2026-10-29T12:00',
    humidityPercent: 62,
    windSpeedKmh: 12.4,
    precipitationMm: 0.2,
    pressureHpa: 1013.2,
  },
  forecastDays: [
    {
      date: '2026-10-29',
      weatherCode: 2,
      minTemperatureC: 17,
      maxTemperatureC: 25,
      precipitationProbabilityPercent: 20,
    },
    {
      date: '2026-10-30',
      weatherCode: 3,
      minTemperatureC: 18,
      maxTemperatureC: 24,
      precipitationProbabilityPercent: 10,
    },
    {
      date: '2026-10-31',
      weatherCode: 61,
      minTemperatureC: 16,
      maxTemperatureC: 21,
      precipitationProbabilityPercent: 75,
    },
    {
      date: '2026-11-01',
      weatherCode: 2,
      minTemperatureC: 17,
      maxTemperatureC: 26,
      precipitationProbabilityPercent: 15,
    },
    {
      date: '2026-11-02',
      weatherCode: 1,
      minTemperatureC: 18,
      maxTemperatureC: 27,
      precipitationProbabilityPercent: 5,
    },
  ],
  fetchedAt: '2026-10-29T15:00:00.000Z',
  isPartial: false,
};

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import type { City, CurrentWeather as CurrentWeatherData } from '../../../src/types/weather';

const city: City = {
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

describe('CurrentWeather fallback rendering', () => {
  it('does not render NaN or undefined for missing and non-finite API values', () => {
    const current: CurrentWeatherData = {
      temperatureC: Number.NaN,
      weatherCode: null,
      observedAt: null,
      humidityPercent: Number.NaN,
      windSpeedKmh: null,
      precipitationMm: undefined,
      pressureHpa: Number.POSITIVE_INFINITY,
    };

    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getAllByText('Indisponível')).toHaveLength(5);
    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/NaN|undefined|Infinity/);
  });
});

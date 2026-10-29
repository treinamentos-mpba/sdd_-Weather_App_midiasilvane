import { describe, expect, it } from 'vitest';
import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('convertTemperature', () => {
  it.each([
    [0, 'fahrenheit', 32],
    [100, 'fahrenheit', 212],
    [-40, 'fahrenheit', -40],
    [21.5, 'celsius', 21.5],
  ] as const)('converts %s °C to %s as %s', (temperatureC, unit, expected) => {
    expect(convertTemperature(temperatureC, unit)).toBe(expected);
  });

  it('preserves null temperatures', () => {
    expect(convertTemperature(null, 'celsius')).toBeNull();
    expect(convertTemperature(null, 'fahrenheit')).toBeNull();
  });

  it.each([
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('rejects non-finite temperature %s', (temperature) => {
    expect(convertTemperature(temperature, 'fahrenheit')).toBeNull();
  });
});

describe('formatTemperature', () => {
  it('rounds to one decimal place and uses pt-BR formatting', () => {
    expect(formatTemperature(20.26, 'celsius')).toBe('20,3°C');
  });

  it('formats the converted value and Fahrenheit symbol', () => {
    expect(formatTemperature(20.24, 'fahrenheit')).toBe('68,4°F');
  });

  it('returns an unavailable label for null temperatures', () => {
    expect(formatTemperature(null, 'celsius')).toBe('Indisponível');
  });

  it('never formats non-finite values as NaN or Infinity', () => {
    expect(formatTemperature(Number.NaN, 'celsius')).toBe('Indisponível');
    expect(formatTemperature(Number.POSITIVE_INFINITY, 'fahrenheit')).toBe('Indisponível');
  });
});

describe('unitLabel', () => {
  it('returns the correct symbol for each unit', () => {
    expect(unitLabel('celsius')).toBe('°C');
    expect(unitLabel('fahrenheit')).toBe('°F');
  });
});

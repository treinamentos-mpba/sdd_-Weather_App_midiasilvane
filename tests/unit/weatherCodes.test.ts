import { describe, expect, it } from 'vitest';
import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('maps a known weather code', () => {
    expect(getWeatherCondition(0)).toEqual({
      description: 'Céu limpo',
      icon: '☀️',
    });
  });

  it('returns the fallback for an unknown weather code', () => {
    expect(getWeatherCondition(999)).toEqual({
      description: 'Condição indisponível',
      icon: '🌡️',
    });
  });
});

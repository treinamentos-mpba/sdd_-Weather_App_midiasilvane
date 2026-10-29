import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ForecastCard from '../../../src/components/ForecastCard';

describe('ForecastCard fallback rendering', () => {
  it('shows safe fallbacks for missing and non-finite forecast fields', () => {
    render(
      <ForecastCard
        unit="celsius"
        day={{
          date: '2026-10-29',
          weatherCode: 999,
          minTemperatureC: null,
          maxTemperatureC: Number.NaN,
          precipitationProbabilityPercent: Number.POSITIVE_INFINITY,
        }}
      />,
    );

    expect(screen.getByText('Condição indisponível')).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(3);
    expect(document.body.textContent).not.toMatch(/NaN|undefined|Infinity/);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import { mockWeatherData } from '../../../src/mocks/weatherData';
import type { Unit } from '../../../src/types/weather';

function UnitToggleWeatherExample() {
  const [unit, setUnit] = useState<Unit>('celsius');

  return (
    <>
      <UnitToggle unit={unit} onChange={setUnit} />
      <CurrentWeather
        city={mockWeatherData.city}
        current={{ ...mockWeatherData.current, temperatureC: 0 }}
        unit={unit}
      />
    </>
  );
}

describe('UnitToggle with CurrentWeather', () => {
  it('converts zero Celsius to 32 Fahrenheit when °F is selected', async () => {
    const user = userEvent.setup();
    render(<UnitToggleWeatherExample />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByText('0°C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°C' }));
    expect(screen.getByText('0°C')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(screen.getByText('32°F')).toBeInTheDocument();
  });
});

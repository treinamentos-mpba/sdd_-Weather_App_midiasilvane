import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

export interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

function formatMetric(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return 'Indisponível';

  const formatted = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formatted} ${unit}`;
}

function getObservedTime(observedAt: string | null): string | null {
  if (observedAt === null) return null;
  return observedAt.match(/T(\d{2}:\d{2})/)?.[1] ?? null;
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const locality = [city.region, city.country].filter(Boolean).join(', ');
  const observedTime = getObservedTime(current.observedAt);
  const temperature =
    current.temperatureC === null ? '—' : formatTemperature(current.temperatureC, unit);
  const metrics = [
    { label: 'Umidade', value: current.humidityPercent, unit: '%' },
    { label: 'Vento', value: current.windSpeedKmh, unit: 'km/h' },
    { label: 'Precipitação', value: current.precipitationMm, unit: 'mm' },
    { label: 'Pressão', value: current.pressureHpa, unit: 'hPa' },
  ];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="overflow-hidden rounded-xl border border-white/10 bg-night-900/80 p-5 text-white shadow-xl sm:p-7"
    >
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/60">Clima atual</p>
          <h2 id="current-weather-title" className="mt-1 break-words text-2xl font-semibold">
            {city.name}
          </h2>
          {locality && <p className="mt-1 text-sm text-white/60">{locality}</p>}
          <p className="mt-4 text-lg text-white/85">{condition.description}</p>
          {observedTime && (
            <p className="mt-1 text-sm text-white/55">Observado às {observedTime}</p>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3 sm:gap-4 sm:justify-end">
          <span aria-hidden="true" className="text-5xl leading-none sm:text-6xl">
            {condition.icon}
          </span>
          <p className="min-w-0 break-words text-5xl font-semibold tracking-normal tabular-nums sm:text-6xl lg:text-7xl">
            {current.temperatureC === null ? (
              <>
                <span aria-hidden="true">—</span>
                <span className="sr-only">Temperatura indisponível</span>
              </>
            ) : (
              temperature
            )}
          </p>
        </div>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-x-4 border-t border-white/10 pt-5 sm:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="py-2">
            <dt className="text-sm text-white/55">{metric.label}</dt>
            <dd className="mt-1 text-lg font-medium tabular-nums">
              {formatMetric(metric.value, metric.unit)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

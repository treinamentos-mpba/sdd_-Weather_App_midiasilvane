import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

export interface ForecastCardProps {
  day: ForecastDay;
  unit: Unit;
}

function formatRainProbability(probability: number | null | undefined): string {
  if (typeof probability !== 'number' || !Number.isFinite(probability)) {
    return 'Indisponível';
  }

  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(probability)}%`;
}

export default function ForecastCard({ day, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);

  return (
    <article className="flex min-h-52 min-w-0 flex-col rounded-lg border border-white/10 bg-white/5 p-3 text-white backdrop-blur-md sm:p-4">
      <h3 className="break-words text-sm font-semibold capitalize text-white/85">
        {formatDayLabel(day.date)}
      </h3>
      <div className="mt-4 flex items-center gap-3">
        <span aria-hidden="true" className="shrink-0 text-3xl leading-none">
          {condition.icon}
        </span>
        <p className="min-w-0 break-words text-xs text-white/75 sm:text-sm">
          {condition.description}
        </p>
      </div>

      <dl className="mt-auto grid min-w-0 grid-cols-2 gap-x-2 gap-y-3 pt-5 sm:gap-x-3">
        <div>
          <dt className="text-xs text-white/55">Máx.</dt>
          <dd className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums">
            {formatTemperature(day.maxTemperatureC, unit)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-white/55">Mín.</dt>
          <dd className="mt-1 whitespace-nowrap text-sm font-medium tabular-nums text-white/75">
            {formatTemperature(day.minTemperatureC, unit)}
          </dd>
        </div>
        <div className="col-span-2 border-t border-white/10 pt-2">
          <dt className="text-xs text-white/55">Probabilidade de chuva</dt>
          <dd className="mt-1 text-sm font-medium tabular-nums">
            {formatRainProbability(day.precipitationProbabilityPercent)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

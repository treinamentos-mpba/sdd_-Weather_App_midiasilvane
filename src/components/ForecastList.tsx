import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

export interface ForecastListProps {
  forecastDays: ForecastDay[];
  unit: Unit;
}

export default function ForecastList({ forecastDays, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-list-title" className="text-white">
      <h2 id="forecast-list-title" className="text-xl font-semibold">
        Previsão de 5 dias
      </h2>
      {forecastDays.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">Nenhuma previsão disponível.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {forecastDays.map((day) => (
            <ForecastCard key={day.date} day={day} unit={unit} />
          ))}
        </div>
      )}
    </section>
  );
}

import type { City } from '../types/weather';

export interface CityResultsProps {
  cities: City[];
  selectedCity: City | null;
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, selectedCity, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-title" className="space-y-3 text-white">
      <h2 id="city-results-title" className="text-lg font-semibold">
        Selecione uma cidade
      </h2>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {cities.map((city) => {
          const locationDetails = [city.region, city.country].filter(Boolean).join(', ');
          const isSelected = selectedCity === city;

          return (
            <li key={`${city.id ?? city.name}-${city.latitude}-${city.longitude}`}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(city)}
                className="flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-accent-400"
              >
                <span className="min-w-0">
                  <span className="block break-words font-medium">{city.name}</span>
                  {locationDetails && (
                    <span className="mt-0.5 block break-words text-sm text-white/70">
                      {locationDetails}
                    </span>
                  )}
                </span>
                <span aria-hidden="true" className="shrink-0 text-white/65">
                  →
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { type KeyboardEvent, useRef } from 'react';
import type { Unit } from '../types/weather';

export interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  const celsiusButtonRef = useRef<HTMLButtonElement>(null);
  const fahrenheitButtonRef = useRef<HTMLButtonElement>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    let nextUnit: Unit | undefined;

    if (event.key === 'ArrowLeft') {
      nextUnit = 'celsius';
    } else if (event.key === 'ArrowRight') {
      nextUnit = 'fahrenheit';
    } else if (event.key === 'Home') {
      nextUnit = 'celsius';
    } else if (event.key === 'End') {
      nextUnit = 'fahrenheit';
    }

    if (!nextUnit) return;

    event.preventDefault();
    if (nextUnit !== unit) onChange(nextUnit);

    const targetRef = nextUnit === 'celsius' ? celsiusButtonRef : fahrenheitButtonRef;
    targetRef.current?.focus();
  }

  return (
    <div
      role="group"
      aria-label="Unidade de temperatura"
      className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1"
    >
      <button
        ref={celsiusButtonRef}
        type="button"
        aria-pressed={unit === 'celsius'}
        tabIndex={unit === 'celsius' ? 0 : -1}
        onClick={() => onChange('celsius')}
        onKeyDown={handleKeyDown}
        className={`min-w-11 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
          unit === 'celsius'
            ? 'bg-accent-600 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        °C
      </button>
      <button
        ref={fahrenheitButtonRef}
        type="button"
        aria-pressed={unit === 'fahrenheit'}
        tabIndex={unit === 'fahrenheit' ? 0 : -1}
        onClick={() => onChange('fahrenheit')}
        onKeyDown={handleKeyDown}
        className={`min-w-11 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 ${
          unit === 'fahrenheit'
            ? 'bg-accent-600 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        °F
      </button>
    </div>
  );
}

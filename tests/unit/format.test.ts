import { describe, expect, it } from 'vitest';
import { formatDayLabel, getDayLabel, getShortDate } from '../../src/lib/format';

describe('getDayLabel', () => {
  it('labels index zero as today', () => {
    expect(getDayLabel(0, '2026-10-29')).toBe('Hoje');
  });

  it('labels index one as tomorrow', () => {
    expect(getDayLabel(1, '2026-10-30')).toBe('Amanhã');
  });

  it('uses the weekday for later indexes', () => {
    expect(getDayLabel(2, '2026-10-31')).toBe('sábado');
    expect(getDayLabel(4, '2026-11-02')).toBe('segunda-feira');
  });
});

describe('getShortDate', () => {
  it('formats the date with a short Brazilian Portuguese month', () => {
    expect(getShortDate('2026-10-29')).toBe('29 de out.');
  });

  it('returns a fallback for an invalid date', () => {
    expect(getShortDate('invalid')).toBe('Data indisponível');
  });
});

describe('formatDayLabel', () => {
  it('keeps the existing weekday and short-date label', () => {
    expect(formatDayLabel('2026-10-29')).toBe('Qui., 29 de out.');
  });
});

function parseDate(date: string): Date | null {
  const dateAtNoonUtc = new Date(`${date}T12:00:00Z`);
  return Number.isNaN(dateAtNoonUtc.getTime()) ? null : dateAtNoonUtc;
}

export function getDayLabel(index: number, date: string): string {
  if (index === 0) return 'Hoje';
  if (index === 1) return 'Amanhã';

  const dateAtNoonUtc = parseDate(date);
  if (!dateAtNoonUtc) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dateAtNoonUtc);
}

export function getShortDate(date: string): string {
  const dateAtNoonUtc = parseDate(date);
  if (!dateAtNoonUtc) return 'Data indisponível';

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dateAtNoonUtc);
}

export function formatDayLabel(date: string): string {
  const dateAtNoonUtc = parseDate(date);
  if (!dateAtNoonUtc) return 'Data indisponível';

  const label = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(dateAtNoonUtc);

  const capitalizedLabel = label.charAt(0).toLocaleUpperCase('pt-BR') + label.slice(1);
  return `${capitalizedLabel}, ${getShortDate(date)}`;
}

export function getWeekDates(referenceDate: Date = new Date()): Date[] {
  const date = new Date(referenceDate);
  const day = date.getDay();
  // Monday = 0 offset
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

export function getWeekRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  return `${first.toLocaleDateString("fr-FR", opts)} – ${last.toLocaleDateString("fr-FR", { ...opts, year: "numeric" })}`;
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

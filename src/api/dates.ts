// The app works with epoch-ms numbers everywhere (Calendar, badges, formatting).
// The backend speaks ISO 8601. These helpers keep that conversion at the API
// boundary so nothing else in the app has to know about it.

export function dateToApi(epochMs: number | null): string | null {
  if (epochMs === null) return null;
  const d = new Date(epochMs);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromApi(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function dateTimeFromApi(isoDateTime: string): number {
  return new Date(isoDateTime).getTime();
}

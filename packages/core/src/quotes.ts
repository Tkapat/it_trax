/**
 * @trax/core — Rotating motivational quotes (habit/consistency themed).
 *
 * quoteOfTheDay(dateISO) picks one deterministically from the calendar
 * date, so the StickyNoteCard changes daily without any storage.
 */

export const QUOTES: ReadonlyArray<{ text: string; author: string }> = [
  { text: 'Small steps every day beat big leaps once in a while.', author: 'Trax' },
  { text: 'Show up. Check it off. Repeat.', author: 'Trax' },
  { text: 'Consistency compounds faster than intensity.', author: 'Trax' },
  { text: 'Track today. Build tomorrow.', author: 'Trax' },
  { text: 'Done is a habit, not a mood.', author: 'Trax' },
  { text: 'One page, one rep, one task at a time.', author: 'Trax' },
  { text: 'Streaks are built on boring days too.', author: 'Trax' },
];

/** Deterministic daily pick: day-of-year modulo quote count. */
export function quoteOfTheDay(dateISO: string): { text: string; author: string } {
  const d = new Date(dateISO.length === 10 ? `${dateISO}T12:00:00` : dateISO);
  const start = new Date(d.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86400000);
  return QUOTES[((dayOfYear % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

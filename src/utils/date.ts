/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getTodayIso(): string {
  // Returns ISO string YYYY-MM-DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateShort(iso: string): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatDateFull(iso: string): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function getDaysDifference(targetIso: string, baseIso: string = getTodayIso()): number {
  if (!targetIso) return 0;
  const t = new Date(targetIso + 'T00:00:00').getTime();
  const b = new Date(baseIso + 'T00:00:00').getTime();
  return Math.round((t - b) / (1000 * 60 * 60 * 24));
}

export function getRelativeTimeString(targetIso: string, baseIso: string = getTodayIso()): {
  text: string;
  isPast: boolean;
  isToday: boolean;
  days: number;
} {
  const diff = getDaysDifference(targetIso, baseIso);
  if (diff === 0) {
    return { text: 'Due today', isPast: false, isToday: true, days: 0 };
  } else if (diff > 0) {
    if (diff === 1) return { text: 'Tomorrow', isPast: false, isToday: false, days: 1 };
    return { text: `In ${diff} days`, isPast: false, isToday: false, days: diff };
  } else {
    const absDiff = Math.abs(diff);
    if (absDiff === 1) return { text: '1 day overdue', isPast: true, isToday: false, days: diff };
    return { text: `${absDiff} days overdue`, isPast: true, isToday: false, days: diff };
  }
}

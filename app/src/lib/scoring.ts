import type {
  Academy,
  Constraints,
  Day,
  SelectedSlot,
  Subject,
} from "./types";
import { DAYS } from "./types";

export function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Filters academies by hard constraints (subjects, shuttle requirement). */
export function filterAcademies(
  academies: Academy[],
  constraints: Constraints,
): Academy[] {
  return academies.filter((a) => {
    if (constraints.shuttleRequired && !a.shuttleAvailable) return false;
    if (constraints.subjects.length > 0) {
      const matches = a.subjects.some((s) => constraints.subjects.includes(s));
      if (!matches) return false;
    }
    return true;
  });
}

/**
 * Returns a computed fit score factoring constraints. We start from the
 * authored fitScore baseline and adjust:
 *  - −15 if academy has no available slot ending before latestArrivalTime
 *  - +3 if academy has shuttle when not required
 *  - −5 per km over 1km distance
 * Clamped to [40, 99].
 */
export function computeFitScore(
  academy: Academy,
  constraints: Constraints,
): number {
  let score = academy.fitScore;
  const latest = parseMinutes(constraints.latestArrivalTime);

  const hasFeasibleSlot = academy.slots.some(
    (s) => s.available && parseMinutes(s.endTime) <= latest,
  );
  if (!hasFeasibleSlot) score -= 15;

  if (!constraints.shuttleRequired && academy.shuttleAvailable) score += 3;

  if (academy.distanceKm > 1) {
    score -= Math.round((academy.distanceKm - 1) * 5);
  }

  return Math.max(40, Math.min(99, score));
}

export function sortedByFit(
  academies: Academy[],
  constraints: Constraints,
): Array<Academy & { computedFit: number }> {
  return academies
    .map((a) => ({ ...a, computedFit: computeFitScore(a, constraints) }))
    .sort((a, b) => b.computedFit - a.computedFit);
}

/** Group academy.slots by unique start/end pair, with array of days. */
export interface GroupedSlot {
  startTime: string;
  endTime: string;
  days: Day[];
  available: boolean; // true if all member-days are available
}

export function groupSlotsByTime(academy: Academy): GroupedSlot[] {
  const map = new Map<string, GroupedSlot>();
  for (const slot of academy.slots) {
    const key = `${slot.startTime}-${slot.endTime}`;
    const existing = map.get(key);
    if (existing) {
      existing.days.push(slot.day);
      existing.available = existing.available && slot.available;
    } else {
      map.set(key, {
        startTime: slot.startTime,
        endTime: slot.endTime,
        days: [slot.day],
        available: slot.available,
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime),
  );
}

/**
 * Detect pickup-gap warnings across the week. A gap is the time between
 * school dismissal and the earliest selected slot on each day. We use
 * a static 15:30 school dismissal time for grade-3 elementary.
 *
 * Returns a warning per day where gap > 30 minutes.
 */
export interface GapWarning {
  day: Day;
  dismissalTime: string;
  firstSlotStart: string;
  gapMinutes: number;
}

export const DEFAULT_DISMISSAL = "15:30";

export function detectGaps(
  selectionsByDay: Map<Day, SelectedSlot[]>,
  dismissalTime: string = DEFAULT_DISMISSAL,
): GapWarning[] {
  const warnings: GapWarning[] = [];
  const dismissal = parseMinutes(dismissalTime);
  for (const day of DAYS) {
    const slots = selectionsByDay.get(day) ?? [];
    if (slots.length === 0) continue;
    const earliest = slots
      .map((s) => parseMinutes(s.startTime))
      .reduce((a, b) => Math.min(a, b), Infinity);
    if (earliest === Infinity) continue;
    const gap = earliest - dismissal;
    if (gap > 30) {
      warnings.push({
        day,
        dismissalTime,
        firstSlotStart: formatMinutes(earliest),
        gapMinutes: gap,
      });
    }
  }
  return warnings;
}

/** Index selections by day across all academies. */
export function indexSelectionsByDay(
  selections: Array<{ academyId: string; slots: SelectedSlot[] }>,
): Map<Day, Array<SelectedSlot & { academyId: string }>> {
  const map = new Map<Day, Array<SelectedSlot & { academyId: string }>>();
  for (const sel of selections) {
    for (const slot of sel.slots) {
      const arr = map.get(slot.day) ?? [];
      arr.push({ ...slot, academyId: sel.academyId });
      map.set(slot.day, arr);
    }
  }
  for (const [day, arr] of map) {
    arr.sort((a, b) => parseMinutes(a.startTime) - parseMinutes(b.startTime));
    map.set(day, arr);
  }
  return map;
}

/** Latest endTime across all selected slots, used for "max arrival". */
export function latestArrival(
  selections: Array<{ slots: SelectedSlot[] }>,
): string | null {
  let max = -1;
  for (const sel of selections) {
    for (const slot of sel.slots) {
      const end = parseMinutes(slot.endTime);
      if (end > max) max = end;
    }
  }
  return max === -1 ? null : formatMinutes(max);
}

/**
 * Estimate monthly cost given selected slots. We treat each academy's
 * selected slots as a single enrollment at the academy's monthly rate
 * (parents pay per-academy, not per-session).
 */
export function estimateMonthlyCost(
  selections: Array<{ academyId: string; slots: SelectedSlot[] }>,
  academiesById: Map<string, Academy>,
): number {
  let total = 0;
  for (const sel of selections) {
    if (sel.slots.length === 0) continue;
    const academy = academiesById.get(sel.academyId);
    if (academy) total += academy.monthlyCostKRW;
  }
  return total;
}

export function formatKRW(n: number): string {
  return `₩${n.toLocaleString("ko-KR")}`;
}

export function subjectForAcademy(academy: Academy): Subject | undefined {
  return academy.subjects[0];
}

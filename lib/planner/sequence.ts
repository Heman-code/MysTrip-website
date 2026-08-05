import { travelTimeMinutes, type LatLng } from "./geo";

export interface DayHours {
  open: string;
  close: string;
}

export interface EventWindow {
  startTime: string;
  endTime: string;
  isMustSee: boolean;
}

export interface SequenceStop {
  poiId: string;
  lat: number;
  lng: number;
  openingHours: DayHours[]; // resolved for the plan date's weekday; [] = closed that day
  avgVisitDurationMinutes: number;
  events: EventWindow[];
}

export interface SequencedStop {
  poiId: string;
  arrival: string; // "HH:MM"
  departure: string;
}

export interface SequenceResult {
  order: SequencedStop[];
  // POIs that could not be fit into today's plan under any ordering —
  // surfaced to the caller instead of being silently dropped.
  infeasible: string[];
}

export interface StartPoint extends LatLng {
  time: string; // "HH:MM"
}

const MUST_SEE_BONUS_MINUTES = 15;

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(mins: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, Math.round(mins)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface SimResult {
  feasible: boolean;
  arrivals: number[];
  departures: number[];
  score: number;
}

function simulate(perm: SequenceStop[], start: StartPoint): SimResult {
  let currentLat = start.lat;
  let currentLng = start.lng;
  let currentTime = parseTime(start.time);
  let totalTravel = 0;
  let totalWait = 0;
  let mustSeeHits = 0;
  const arrivals: number[] = [];
  const departures: number[] = [];

  for (const stop of perm) {
    if (stop.openingHours.length === 0) {
      return { feasible: false, arrivals, departures, score: Infinity };
    }

    const travel = travelTimeMinutes({ lat: currentLat, lng: currentLng }, { lat: stop.lat, lng: stop.lng });
    const rawArrival = currentTime + travel;
    totalTravel += travel;

    const windows = stop.openingHours
      .map((h) => ({ open: parseTime(h.open), close: parseTime(h.close) }))
      .sort((a, b) => a.open - b.open);
    const window = windows.find((w) => w.close > rawArrival);
    if (!window) {
      return { feasible: false, arrivals, departures, score: Infinity };
    }

    let arrival = Math.max(rawArrival, window.open);
    if (arrival >= window.close) {
      return { feasible: false, arrivals, departures, score: Infinity };
    }

    // A must-see event isn't just checked against wherever normal opening-hours
    // waiting happened to land us — we actively wait for it, the way a traveler
    // would time their visit around a fixed show rather than arrive and miss it.
    const mustSeeEvents = stop.events.filter((e) => e.isMustSee);
    if (mustSeeEvents.length > 0) {
      const eventWindows = mustSeeEvents
        .map((e) => ({ start: parseTime(e.startTime), end: parseTime(e.endTime) }))
        .sort((a, b) => a.start - b.start);
      const eventWindow = eventWindows.find((w) => w.end > arrival);
      if (!eventWindow) {
        return { feasible: false, arrivals, departures, score: Infinity }; // every must-see window has already passed
      }
      arrival = Math.max(arrival, eventWindow.start);
      if (arrival >= eventWindow.end || arrival >= window.close) {
        return { feasible: false, arrivals, departures, score: Infinity };
      }
      mustSeeHits += 1;
    }
    totalWait += arrival - rawArrival;

    const departure = arrival + stop.avgVisitDurationMinutes;
    if (departure > window.close) {
      return { feasible: false, arrivals, departures, score: Infinity };
    }

    arrivals.push(arrival);
    departures.push(departure);
    currentTime = departure;
    currentLat = stop.lat;
    currentLng = stop.lng;
  }

  return { feasible: true, arrivals, departures, score: totalTravel + totalWait - mustSeeHits * MUST_SEE_BONUS_MINUTES };
}

function permutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) {
      result.push([arr[i], ...p]);
    }
  }
  return result;
}

function bestFeasiblePermutation(stops: SequenceStop[], start: StartPoint): { perm: SequenceStop[]; sim: SimResult } | null {
  let best: { perm: SequenceStop[]; sim: SimResult } | null = null;
  for (const perm of permutations(stops)) {
    const sim = simulate(perm, start);
    if (sim.feasible && (!best || sim.score < best.sim.score)) {
      best = { perm, sim };
    }
  }
  return best;
}

function leastSlackStop(stops: SequenceStop[]): SequenceStop {
  const slack = (s: SequenceStop) => {
    const span = Math.max(...s.openingHours.map((h) => parseTime(h.close) - parseTime(h.open)));
    return span - s.avgVisitDurationMinutes;
  };
  return stops.reduce((worst, s) => (slack(s) < slack(worst) ? s : worst));
}

// Exact brute-force permutation search: at the shortlist's capped size (≤8,
// so ≤40,320 permutations) this is fast and provably optimal, and — unlike a
// greedy nearest-neighbor pass — it won't strand a plan on a stop that's
// about to close or miss a fixed-time event window entirely.
export function computeSequence(allStops: SequenceStop[], start: StartPoint): SequenceResult {
  let remaining = allStops.filter((s) => s.openingHours.length > 0);
  const infeasible: string[] = allStops.filter((s) => s.openingHours.length === 0).map((s) => s.poiId);

  while (remaining.length > 0) {
    const best = bestFeasiblePermutation(remaining, start);
    if (best) {
      return {
        order: best.perm.map((stop, i) => ({
          poiId: stop.poiId,
          arrival: formatTime(best.sim.arrivals[i]),
          departure: formatTime(best.sim.departures[i]),
        })),
        infeasible,
      };
    }

    // No ordering fits every stop — find one whose removal unblocks the rest.
    let culprit = remaining.find((candidate) => {
      const withoutCandidate = remaining.filter((s) => s.poiId !== candidate.poiId);
      return withoutCandidate.length === 0 || bestFeasiblePermutation(withoutCandidate, start) !== null;
    });
    if (!culprit) culprit = leastSlackStop(remaining);

    infeasible.push(culprit.poiId);
    remaining = remaining.filter((s) => s.poiId !== culprit!.poiId);
  }

  return { order: [], infeasible };
}

export interface EarlierStartSuggestion {
  suggestedTime: string; // "HH:MM"
  resolvedPoiIds: string[]; // infeasible at the chosen time, feasible at suggestedTime
  tightPoiIds: string[]; // must-see events caught with a comfortable margin at suggestedTime, but barely at the chosen time
}

const CANDIDATE_OFFSETS_MINUTES = [30, 60, 90, 120];
const EARLIEST_FLOOR_MINUTES = 6 * 60; // 06:00 — don't suggest an unreasonably early start
const TIGHT_MUST_SEE_BUFFER_MINUTES = 10;

// Stops whose scheduled arrival lands within TIGHT_MUST_SEE_BUFFER_MINUTES of
// a must-see event's *end* — the traveler would catch only the tail end.
function findTightMustSeeStops(stops: SequenceStop[], result: SequenceResult): string[] {
  const tight: string[] = [];
  for (const entry of result.order) {
    const stop = stops.find((s) => s.poiId === entry.poiId);
    const mustSeeEvents = stop?.events.filter((e) => e.isMustSee) ?? [];
    if (mustSeeEvents.length === 0) continue;

    const arrival = parseTime(entry.arrival);
    const hitWindow = mustSeeEvents
      .map((e) => ({ start: parseTime(e.startTime), end: parseTime(e.endTime) }))
      .find((w) => arrival >= w.start && arrival < w.end);
    if (hitWindow && hitWindow.end - arrival <= TIGHT_MUST_SEE_BUFFER_MINUTES) {
      tight.push(entry.poiId);
    }
  }
  return tight;
}

// Only two objectively-computable triggers count as "worth an earlier start":
// a stop that doesn't fit at the chosen time but would with one, and a
// must-see event caught with an uncomfortably thin margin. Nothing subjective
// (crowds, lighting, "best time of day") — there's no data for that.
export function suggestEarlierStart(
  stops: SequenceStop[],
  start: StartPoint,
  baseResult: SequenceResult
): EarlierStartSuggestion | null {
  const baseTime = parseTime(start.time);
  const baseTight = findTightMustSeeStops(stops, baseResult);

  if (baseResult.infeasible.length === 0 && baseTight.length === 0) return null;

  for (const offset of CANDIDATE_OFFSETS_MINUTES) {
    const candidateMinutes = Math.max(EARLIEST_FLOOR_MINUTES, baseTime - offset);
    if (candidateMinutes >= baseTime) continue; // already at the floor, no earlier option left to try

    const candidateResult = computeSequence(stops, { ...start, time: formatTime(candidateMinutes) });

    const resolvedPoiIds = baseResult.infeasible.filter((id) => !candidateResult.infeasible.includes(id));
    const candidateTight = findTightMustSeeStops(stops, candidateResult);
    const tightPoiIds = baseTight.filter((id) => !candidateTight.includes(id));

    if (resolvedPoiIds.length > 0 || tightPoiIds.length > 0) {
      return { suggestedTime: formatTime(candidateMinutes), resolvedPoiIds, tightPoiIds };
    }
  }

  return null;
}

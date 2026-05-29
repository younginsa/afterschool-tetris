export type Day = "mon" | "tue" | "wed" | "thu" | "fri";

export type Subject =
  | "english"
  | "math"
  | "taekwondo"
  | "art"
  | "piano"
  | "coding";

export type School = "광교초등학교" | "신풍초등학교" | "영통초등학교";

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export interface Slot {
  day: Day;
  startTime: string; // "HH:mm"
  endTime: string;
  available: boolean; // false === 만석
}

export interface Academy {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  subjects: Subject[];
  shuttleAvailable: boolean;
  slots: Slot[];
  monthlyCostKRW: number;
  fitScore: number; // 60–99
  emoji?: string;
  mapPos?: { x: number; y: number }; // 0–390 / 0–220 in mockup coords
}

export interface Constraints {
  school: School;
  grade: Grade;
  subjects: Subject[];
  shuttleRequired: boolean;
  latestArrivalTime: string; // "HH:mm"
}

export interface SelectedSlot {
  day: Day;
  startTime: string;
  endTime: string;
}

export interface Selection {
  academyId: string;
  slots: SelectedSlot[];
}

export interface AppState {
  constraints: Constraints;
  selections: Selection[];
}

export const SUBJECT_LABEL: Record<Subject, string> = {
  english: "영어",
  math: "수학",
  taekwondo: "태권도",
  art: "미술",
  piano: "피아노",
  coding: "코딩",
};

export const SUBJECT_EMOJI: Record<Subject, string> = {
  english: "🇺🇸",
  math: "📐",
  taekwondo: "🥋",
  art: "🎨",
  piano: "🎹",
  coding: "💻",
};

export const DAY_LABEL: Record<Day, string> = {
  mon: "월",
  tue: "화",
  wed: "수",
  thu: "목",
  fri: "금",
};

export const DAYS: Day[] = ["mon", "tue", "wed", "thu", "fri"];

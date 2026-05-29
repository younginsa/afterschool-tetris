"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AppState,
  Constraints,
  Day,
  Selection,
  SelectedSlot,
  Subject,
} from "./types";

const STORAGE_KEY = "afterschool-tetris/state/v1";

const DEFAULT_STATE: AppState = {
  constraints: {
    school: "광교초등학교",
    grade: 3,
    subjects: ["english", "math"],
    shuttleRequired: true,
    latestArrivalTime: "18:00",
  },
  selections: [],
};

type Action =
  | { type: "SET_CONSTRAINTS"; constraints: Partial<Constraints> }
  | { type: "TOGGLE_SUBJECT"; subject: Subject }
  | { type: "ADD_SELECTION"; selection: Selection }
  | { type: "REMOVE_SELECTION"; academyId: string }
  | { type: "TOGGLE_SLOT"; academyId: string; slot: SelectedSlot }
  | { type: "HYDRATE"; state: AppState }
  | { type: "RESET" };

function slotsEqual(a: SelectedSlot, b: SelectedSlot) {
  return (
    a.day === b.day && a.startTime === b.startTime && a.endTime === b.endTime
  );
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_CONSTRAINTS":
      return {
        ...state,
        constraints: { ...state.constraints, ...action.constraints },
      };
    case "TOGGLE_SUBJECT": {
      const has = state.constraints.subjects.includes(action.subject);
      return {
        ...state,
        constraints: {
          ...state.constraints,
          subjects: has
            ? state.constraints.subjects.filter((s) => s !== action.subject)
            : [...state.constraints.subjects, action.subject],
        },
      };
    }
    case "ADD_SELECTION": {
      const existing = state.selections.find(
        (s) => s.academyId === action.selection.academyId,
      );
      if (existing) {
        return {
          ...state,
          selections: state.selections.map((s) =>
            s.academyId === action.selection.academyId ? action.selection : s,
          ),
        };
      }
      return {
        ...state,
        selections: [...state.selections, action.selection],
      };
    }
    case "REMOVE_SELECTION":
      return {
        ...state,
        selections: state.selections.filter(
          (s) => s.academyId !== action.academyId,
        ),
      };
    case "TOGGLE_SLOT": {
      const existing = state.selections.find(
        (s) => s.academyId === action.academyId,
      );
      if (!existing) {
        return {
          ...state,
          selections: [
            ...state.selections,
            { academyId: action.academyId, slots: [action.slot] },
          ],
        };
      }
      const hasSlot = existing.slots.some((s) => slotsEqual(s, action.slot));
      const nextSlots = hasSlot
        ? existing.slots.filter((s) => !slotsEqual(s, action.slot))
        : [...existing.slots, action.slot];
      // Drop selection entirely if no slots remain
      const nextSelections =
        nextSlots.length === 0
          ? state.selections.filter((s) => s.academyId !== action.academyId)
          : state.selections.map((s) =>
              s.academyId === action.academyId
                ? { ...s, slots: nextSlots }
                : s,
            );
      return { ...state, selections: nextSelections };
    }
    case "HYDRATE":
      return action.state;
    case "RESET":
      return DEFAULT_STATE;
    default:
      return state;
  }
}

interface StoreValue {
  state: AppState;
  setConstraints: (partial: Partial<Constraints>) => void;
  toggleSubject: (subject: Subject) => void;
  addSelection: (selection: Selection) => void;
  removeSelection: (academyId: string) => void;
  toggleSlot: (academyId: string, slot: SelectedSlot) => void;
  selectionsForAcademy: (academyId: string) => SelectedSlot[];
  isSlotSelected: (academyId: string, slot: SelectedSlot) => boolean;
  reset: () => void;
}

const AppStoreContext = createContext<StoreValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, DEFAULT_STATE);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppState;
        dispatch({ type: "HYDRATE", state: parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const setConstraints = useCallback(
    (constraints: Partial<Constraints>) =>
      dispatch({ type: "SET_CONSTRAINTS", constraints }),
    [],
  );
  const toggleSubject = useCallback(
    (subject: Subject) => dispatch({ type: "TOGGLE_SUBJECT", subject }),
    [],
  );
  const addSelection = useCallback(
    (selection: Selection) => dispatch({ type: "ADD_SELECTION", selection }),
    [],
  );
  const removeSelection = useCallback(
    (academyId: string) => dispatch({ type: "REMOVE_SELECTION", academyId }),
    [],
  );
  const toggleSlot = useCallback(
    (academyId: string, slot: SelectedSlot) =>
      dispatch({ type: "TOGGLE_SLOT", academyId, slot }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const selectionsForAcademy = useCallback(
    (academyId: string): SelectedSlot[] =>
      state.selections.find((s) => s.academyId === academyId)?.slots ?? [],
    [state.selections],
  );

  const isSlotSelected = useCallback(
    (academyId: string, slot: SelectedSlot): boolean => {
      const sel = state.selections.find((s) => s.academyId === academyId);
      return sel ? sel.slots.some((s) => slotsEqual(s, slot)) : false;
    },
    [state.selections],
  );

  const value = useMemo<StoreValue>(
    () => ({
      state,
      setConstraints,
      toggleSubject,
      addSelection,
      removeSelection,
      toggleSlot,
      selectionsForAcademy,
      isSlotSelected,
      reset,
    }),
    [
      state,
      setConstraints,
      toggleSubject,
      addSelection,
      removeSelection,
      toggleSlot,
      selectionsForAcademy,
      isSlotSelected,
      reset,
    ],
  );

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

export function useAppStore(): StoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppProvider");
  }
  return ctx;
}

export type { Day };

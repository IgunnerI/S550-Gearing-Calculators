import { useEffect, useMemo, useState } from "react";
import { EXAMPLE_TIRE, GEARBOXES, GEARBOX_ORDER, type GearboxId } from "../data/gearboxes";
import { effectiveHeight, gearTable, type TireInput } from "./gearing";
import type { SpeedUnit } from "./format";

export interface DrivetrainSetup {
  rear: number;
  shiftRpms: number[];
}

export interface AppState {
  box: GearboxId;
  unit: SpeedUnit;
  tire: TireInput;
  setups: Record<GearboxId, DrivetrainSetup>;
  /** Road speed (mph) used for the "RPM at speed" column. */
  probeMph: number;
}

export function exampleSetup(id: GearboxId): DrivetrainSetup {
  const box = GEARBOXES[id];
  return { rear: box.defaultRear, shiftRpms: box.ratios.map(() => box.defaultShiftRpm) };
}

export function exampleState(): AppState {
  return {
    box: "10r80",
    unit: "mph",
    tire: { ...EXAMPLE_TIRE },
    setups: Object.fromEntries(GEARBOX_ORDER.map((id) => [id, exampleSetup(id)])) as AppState["setups"],
    probeMph: 70,
  };
}

const STORAGE_KEY = "s550-shift-speeds:v1";

function load(): AppState {
  const fallback = exampleState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const saved = JSON.parse(raw) as Partial<AppState>;
    const state: AppState = { ...fallback, ...saved, tire: { ...fallback.tire, ...saved.tire }, setups: { ...fallback.setups } };
    for (const id of GEARBOX_ORDER) {
      const s = saved.setups?.[id];
      if (s && Number.isFinite(s.rear) && Array.isArray(s.shiftRpms) && s.shiftRpms.length === GEARBOXES[id].ratios.length) {
        state.setups[id] = s;
      }
    }
    if (!GEARBOXES[state.box]) state.box = fallback.box;
    return state;
  } catch {
    return fallback;
  }
}

export function useAppState() {
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, sandboxed previews); the page works without it.
    }
  }, [state]);

  const box = GEARBOXES[state.box];
  const setup = state.setups[state.box];
  const tireHeight = effectiveHeight(state.tire);
  const rows = useMemo(
    () => gearTable(box.ratios, setup.rear, setup.shiftRpms, tireHeight),
    [box, setup, tireHeight],
  );

  const actions = {
    setBox: (id: GearboxId) => setState((s) => ({ ...s, box: id })),
    setUnit: (unit: SpeedUnit) => setState((s) => ({ ...s, unit })),
    setTire: (patch: Partial<TireInput>) => setState((s) => ({ ...s, tire: { ...s.tire, ...patch } })),
    setRear: (rear: number) =>
      setState((s) => ({ ...s, setups: { ...s.setups, [s.box]: { ...s.setups[s.box], rear } } })),
    setShiftRpm: (gearIndex: number, rpm: number) =>
      setState((s) => {
        const shiftRpms = s.setups[s.box].shiftRpms.slice();
        shiftRpms[gearIndex] = rpm;
        return { ...s, setups: { ...s.setups, [s.box]: { ...s.setups[s.box], shiftRpms } } };
      }),
    setAllShiftRpms: (rpm: number) =>
      setState((s) => ({
        ...s,
        setups: { ...s.setups, [s.box]: { ...s.setups[s.box], shiftRpms: s.setups[s.box].shiftRpms.map(() => rpm) } },
      })),
    setProbeMph: (probeMph: number) => setState((s) => ({ ...s, probeMph })),
    restoreExample: () =>
      setState((s) => ({ ...s, tire: { ...EXAMPLE_TIRE }, setups: { ...s.setups, [s.box]: exampleSetup(s.box) } })),
  };

  return { state, box, setup, tireHeight, rows, actions };
}

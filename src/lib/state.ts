import { useEffect, useMemo, useState } from "react";
import { EXAMPLE_TIRE, GEARBOXES, GEARBOX_ORDER, type GearboxId } from "../data/gearboxes";
import { effectiveHeight, gearTable, type TireInput } from "./gearing";
import { inRange } from "./limits";
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

/**
 * Rebuilds state from whatever was saved in the browser. Saved data can be stale or edited by hand,
 * so every value is checked against the same limits as the input fields; anything that fails falls
 * back to the example value.
 */
export function restoreState(saved: unknown): AppState {
  const fallback = exampleState();
  if (typeof saved !== "object" || saved === null) return fallback;
  const s = saved as Record<string, unknown>;
  const tire = (typeof s.tire === "object" && s.tire !== null ? s.tire : {}) as Record<string, unknown>;
  const setups = (typeof s.setups === "object" && s.setups !== null ? s.setups : {}) as Record<string, unknown>;

  const state: AppState = {
    box: typeof s.box === "string" && s.box in GEARBOXES ? (s.box as GearboxId) : fallback.box,
    unit: s.unit === "mph" || s.unit === "kmh" ? s.unit : fallback.unit,
    tire: {
      width: inRange("width", tire.width) ? tire.width : fallback.tire.width,
      aspect: inRange("aspect", tire.aspect) ? tire.aspect : fallback.tire.aspect,
      wheel: inRange("wheel", tire.wheel) ? tire.wheel : fallback.tire.wheel,
      override: inRange("override", tire.override) ? tire.override : null,
      growthPct: inRange("growthPct", tire.growthPct) ? tire.growthPct : fallback.tire.growthPct,
    },
    setups: { ...fallback.setups },
    probeMph: inRange("probe", s.probeMph) ? s.probeMph : fallback.probeMph,
  };
  for (const id of GEARBOX_ORDER) {
    const setup = setups[id] as Record<string, unknown> | undefined;
    const rear = setup?.rear;
    const rpms = setup?.shiftRpms;
    if (
      inRange("rear", rear) &&
      Array.isArray(rpms) &&
      rpms.length === GEARBOXES[id].ratios.length &&
      rpms.every((r) => inRange("shiftRpm", r))
    ) {
      state.setups[id] = { rear, shiftRpms: rpms as number[] };
    }
  }
  return state;
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? restoreState(JSON.parse(raw)) : exampleState();
  } catch {
    return exampleState();
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

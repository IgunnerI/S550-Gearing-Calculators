// Accepted ranges for every user input. Fields and saved-state loading share these.

export const LIMITS = {
  width: { min: 100, max: 500, label: "Width" },
  aspect: { min: 10, max: 100, label: "Aspect ratio" },
  wheel: { min: 10, max: 30, label: "Wheel diameter" },
  override: { min: 15, max: 50, label: "Measured height" },
  growthPct: { min: -20, max: 50, label: "Growth" },
  rear: { min: 1.5, max: 7, label: "Rear ratio" },
  shiftRpm: { min: 1000, max: 10000, label: "Shift RPM" },
  probe: { min: 1, max: 400, label: "Cruise speed" },
} as const;

export type LimitKey = keyof typeof LIMITS;

export function inRange(key: LimitKey, value: unknown): value is number {
  const { min, max } = LIMITS[key];
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

/** Validator for NumberField: an error message, or null when the value is acceptable. */
export const check = (key: LimitKey) => (value: number) => {
  const { min, max, label } = LIMITS[key];
  return inRange(key, value) ? null : `${label} must be between ${min} and ${max}.`;
};

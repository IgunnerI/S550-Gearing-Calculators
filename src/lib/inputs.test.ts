import { describe, expect, it } from "vitest";
import { exampleState, restoreState } from "./state";
import { check, inRange, LIMITS } from "./limits";

describe("input limits", () => {
  it("rejects zero, negative, non-finite and non-numeric values", () => {
    for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
      for (const bad of [0, -1, Number.NaN, Infinity, -Infinity, "315", null, undefined]) {
        // growth may legitimately be 0 or negative
        if (key === "growthPct" && (bad === 0 || bad === -1)) continue;
        expect(inRange(key, bad), `${key} ${String(bad)}`).toBe(false);
      }
    }
  });

  it("accepts both ends of each range and rejects just outside", () => {
    for (const [key, { min, max }] of Object.entries(LIMITS) as [keyof typeof LIMITS, { min: number; max: number }][]) {
      expect(inRange(key, min)).toBe(true);
      expect(inRange(key, max)).toBe(true);
      expect(inRange(key, min - 0.01)).toBe(false);
      expect(inRange(key, max + 0.01)).toBe(false);
    }
  });

  it("gives a message only for bad values", () => {
    expect(check("shiftRpm")(7800)).toBeNull();
    expect(check("shiftRpm")(0)).toBe("Shift RPM must be between 1000 and 10000.");
    expect(check("rear")(-3.73)).toBe("Rear ratio must be between 1.5 and 7.");
  });
});

describe("restoring saved inputs", () => {
  it("keeps valid saved values", () => {
    const saved = {
      ...exampleState(),
      box: "mt82-18",
      unit: "kmh",
      tire: { width: 305, aspect: 45, wheel: 18, override: 27.5, growthPct: 3 },
      probeMph: 80,
    };
    saved.setups["mt82-18"] = { rear: 3.55, shiftRpms: [7000, 7100, 7200, 7300, 7400, 7500] };
    expect(restoreState(JSON.parse(JSON.stringify(saved)))).toEqual(saved);
  });

  it("replaces corrupted values with the example ones", () => {
    const fallback = exampleState();
    const restored = restoreState({
      box: "th400",
      unit: "furlongs",
      tire: { width: 0, aspect: -50, wheel: "17", override: 0, growthPct: 900 },
      setups: {
        "10r80": { rear: 0, shiftRpms: Array(10).fill(7800) },
        "mt82-1517": { rear: 3.73, shiftRpms: [7500, 7500, null, 7500, 7500, 7500] },
        "mt82-18": { rear: 3.73, shiftRpms: [7500, 7500] },
      },
      probeMph: -5,
    });
    expect(restored).toEqual({ ...fallback, tire: { ...fallback.tire, override: null } });
  });

  it("falls back entirely for non-object data", () => {
    expect(restoreState(null)).toEqual(exampleState());
    expect(restoreState("garbage")).toEqual(exampleState());
    expect(restoreState(42)).toEqual(exampleState());
  });
});

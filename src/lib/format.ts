// Display precision for each kind of figure.
import { KM_PER_MILE } from "./gearing";

export type SpeedUnit = "mph" | "kmh";

const fixed = (digits: number) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
const f0 = fixed(0);
const f1 = fixed(1);
const f2 = fixed(2);
const f3 = fixed(3);

export const fmtRpm = (n: number) => f0.format(n);
export const fmtSpeed = (n: number) => f1.format(n);
export const fmtHeight = (n: number) => f2.format(n);
export const fmtOverall = (n: number) => f2.format(n);
export const fmtRatio = (n: number) => f3.format(n);
export const fmtRear = (n: number) => f2.format(n);
export const fmtPct = (n: number) => `${f1.format(n * 100)}%`;
export const fmtInt = (n: number) => f0.format(n);

export const unitLabel = (u: SpeedUnit) => (u === "mph" ? "mph" : "km/h");
export const toUnit = (mph: number, u: SpeedUnit) => (u === "mph" ? mph : mph * KM_PER_MILE);
export const fromUnit = (v: number, u: SpeedUnit) => (u === "mph" ? v : v / KM_PER_MILE);

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function tireSize(width: number, aspect: number, wheel: number): string {
  return `${f0.format(width)}/${Number(aspect.toFixed(2))}R${Number(wheel.toFixed(2))}`;
}

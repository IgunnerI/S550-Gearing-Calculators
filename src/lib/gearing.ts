// Shift-speed math.
// MPH = RPM ÷ (trans ratio × rear ratio) × tire height × π × 60 ÷ 63,360. OSS = RPM ÷ trans ratio.

export const INCHES_PER_MILE = 63360;
export const KM_PER_MILE = 1.609344;
export const MM_PER_INCH = 25.4;

export interface TireInput {
  width: number;
  aspect: number;
  wheel: number;
  /** Measured or advertised height in inches; null uses the calculated height. */
  override: number | null;
  /** Growth at speed in percent (2 means 2%). */
  growthPct: number;
}

/** B8: width × aspect/100 × 2 ÷ 25.4 + wheel. */
export function calculatedHeight(t: Pick<TireInput, "width" | "aspect" | "wheel">): number {
  return ((t.width * t.aspect) / 100) * 2 / MM_PER_INCH + t.wheel;
}

/** B11: IF(override="", calculated, override) × (1 + growth). */
export function effectiveHeight(t: TireInput): number {
  const base = t.override ?? calculatedHeight(t);
  return base * (1 + t.growthPct / 100);
}

/** Road speed in mph for an engine speed through a given overall ratio. */
export function mphAt(rpm: number, overall: number, tireHeight: number): number {
  return ((rpm / overall) * tireHeight * Math.PI * 60) / INCHES_PER_MILE;
}

/** Engine speed for a road speed in mph through a given overall ratio. */
export function rpmAt(mph: number, overall: number, tireHeight: number): number {
  return (mph * overall * INCHES_PER_MILE) / (tireHeight * Math.PI * 60);
}

export interface GearRow {
  gear: number;
  ratio: number;
  overall: number;
  shiftRpm: number;
  oss: number;
  mph: number;
  kmh: number;
  /** RPM in the next gear right after the upshift; null for the top gear. */
  rpmAfter: number | null;
  mphPer1000: number;
}

export function gearTable(ratios: number[], rear: number, shiftRpms: number[], tireHeight: number): GearRow[] {
  return ratios.map((ratio, i) => {
    const overall = ratio * rear;
    const shiftRpm = shiftRpms[i];
    const mph = mphAt(shiftRpm, overall, tireHeight);
    const next = ratios[i + 1];
    return {
      gear: i + 1,
      ratio,
      overall,
      shiftRpm,
      oss: shiftRpm / ratio,
      mph,
      kmh: mph * KM_PER_MILE,
      rpmAfter: next === undefined ? null : (shiftRpm * next) / ratio,
      mphPer1000: mphAt(1000, overall, tireHeight),
    };
  });
}

/** Share of engine speed lost on the upshift from gear i to i+1. */
export function rpmDrop(ratios: number[], i: number): number | null {
  const next = ratios[i + 1];
  return next === undefined ? null : 1 - next / ratios[i];
}

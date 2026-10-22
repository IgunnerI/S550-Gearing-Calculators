// Every figure here is copied from the "Ratios" tab of S550_Shift_Speed_Calculator.xlsx.

export type GearboxId = "10r80" | "mt82-1517" | "mt82-18";

export interface Gearbox {
  id: GearboxId;
  family: "10R80" | "MT82";
  name: string;
  short: string;
  years: string;
  kind: "automatic" | "manual";
  ratios: number[];
  /** Gear that runs 1:1, if any. */
  direct: number | null;
  /** Default shift RPM used on the calculator tab. */
  defaultShiftRpm: number;
  /** Default rear ratio used on the calculator tab. */
  defaultRear: number;
  source: string;
  slipNote: string;
}

export const GEARBOXES: Record<GearboxId, Gearbox> = {
  "10r80": {
    id: "10r80",
    family: "10R80",
    name: "Ford 10R80",
    short: "10R80",
    years: "2018+",
    kind: "automatic",
    ratios: [4.696, 2.985, 2.146, 1.769, 1.52, 1.275, 1, 0.854, 0.689, 0.636],
    direct: 7,
    defaultShiftRpm: 7800,
    defaultRear: 3.15,
    source: "Ford published 10R80 ratios (2018+ Mustang GT).",
    slipNote: "Assumes zero slip and a locked converter.",
  },
  "mt82-1517": {
    id: "mt82-1517",
    family: "MT82",
    name: "MT82",
    short: "MT82",
    years: "2015–2017",
    kind: "manual",
    ratios: [3.66, 2.43, 1.69, 1.32, 1, 0.65],
    direct: 5,
    defaultShiftRpm: 7500,
    defaultRear: 3.73,
    source: "Steeda Mustang Manual Transmission Guide (MT82 ratio table).",
    slipNote: "Assumes zero clutch and tire slip.",
  },
  "mt82-18": {
    id: "mt82-18",
    family: "MT82",
    name: "MT82-D4",
    short: "MT82-D4",
    years: "2018+",
    kind: "manual",
    ratios: [3.237, 2.104, 1.422, 1, 0.814, 0.622],
    direct: 4,
    defaultShiftRpm: 7500,
    defaultRear: 3.73,
    source: "Steeda Mustang Manual Transmission Guide (MT82 ratio table).",
    slipNote: "Assumes zero clutch and tire slip.",
  },
};

export const GEARBOX_ORDER: GearboxId[] = ["10r80", "mt82-1517", "mt82-18"];

/** Rear gear dropdown list, in the order it appears on the Ratios tab. */
export const REAR_RATIOS = [3.15, 3.31, 3.55, 3.73, 3.9, 4.09, 4.1, 4.3, 4.56, 4.88];

/** Tire used in the spreadsheet's example inputs: 315/50R17, no override, 0% growth. */
export const EXAMPLE_TIRE = { width: 315, aspect: 50, wheel: 17, override: null, growthPct: 0 };

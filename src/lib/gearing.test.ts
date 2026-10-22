import { describe, expect, it } from "vitest";
import { GEARBOXES, EXAMPLE_TIRE } from "../data/gearboxes";
import { calculatedHeight, effectiveHeight, gearTable, rpmAt } from "./gearing";

// Cached values read from the workbook with openpyxl (data_only=True).
const excel10r80 = [
  [46.12246477122515, 1660.9880749574106, 4958.049403747871, 5.913136509131428],
  [72.55983067526743, 2613.065326633166, 5607.638190954774, 9.302542394265057],
  [100.92781666620377, 3634.6691519105316, 6429.729729729729, 12.939463675154327],
  [122.4370234967062, 4409.270774448842, 6702.0915771622385, 15.697054294449513],
  [142.49414116162714, 5131.578947368421, 6542.763157894737, 18.268479636106044],
  [169.87536828680257, 6117.64705882353, 6117.64705882353, 21.778893370102892],
  [216.59109456567327, 7800, 6661.2, 27.768089046881187],
  [253.6195486717486, 9133.489461358315, 6292.974238875878, 32.515326752788276],
  [314.35572505903235, 11320.754716981133, 7200.000000000001, 40.30201603320928],
  [340.55203548061826, 12264.150943396226, null, 43.66051736931004],
];
const excelMt82 = [
  [48.053817352478646, 2049.1803278688526, 4979.508196721311, 6.407175646997153],
  [72.37735453089375, 3086.4197530864194, 5216.049382716049, 9.650313937452502],
  [104.0692139112851, 4437.869822485207, 5857.988165680474, 13.87589518817135],
  [133.24012993187262, 5681.818181818182, 5681.818181818182, 17.765350657583017],
  [175.87697151007185, 7500, 4875, 23.450262868009577],
  [270.5799561693413, 11538.461538461537, null, 36.07732748924551],
];

function check(rows: ReturnType<typeof gearTable>, expected: (number | null)[][]) {
  rows.forEach((r, i) => {
    const [mph, oss, after, per1000] = expected[i];
    expect(r.mph).toBeCloseTo(mph!, 9);
    expect(r.oss).toBeCloseTo(oss!, 9);
    if (after === null) expect(r.rpmAfter).toBeNull();
    else expect(r.rpmAfter).toBeCloseTo(after, 9);
    expect(r.mphPer1000).toBeCloseTo(per1000!, 9);
  });
}

describe("matches the spreadsheet", () => {
  const h = effectiveHeight(EXAMPLE_TIRE);
  it("tire height", () => {
    expect(calculatedHeight(EXAMPLE_TIRE)).toBeCloseTo(29.401574803149607, 12);
    expect(h).toBeCloseTo(29.401574803149607, 12);
  });
  it("10R80 tab: 3.15 rear, 7,800 RPM", () => {
    check(gearTable(GEARBOXES["10r80"].ratios, 3.15, Array(10).fill(7800), h), excel10r80);
  });
  it("MT82 tab: 2015-2017, 3.73 rear, 7,500 RPM", () => {
    check(gearTable(GEARBOXES["mt82-1517"].ratios, 3.73, Array(6).fill(7500), h), excelMt82);
  });
  it("override and growth", () => {
    expect(effectiveHeight({ ...EXAMPLE_TIRE, override: 28, growthPct: 5 })).toBeCloseTo(29.4, 12);
  });
  it("rpmAt inverts mphAt", () => {
    const row = gearTable([1], 3.15, [7800], h)[0];
    expect(rpmAt(row.mph, row.overall, h)).toBeCloseTo(7800, 9);
  });
});

import { describe, expect, it } from "vitest";
import { GEARBOXES, EXAMPLE_TIRE, REAR_RATIOS } from "../data/gearboxes";
import { calculatedHeight, effectiveHeight, gearTable, KM_PER_MILE, rpmAt, rpmDrop } from "./gearing";
import { fmtRpm, fmtSpeed, fromUnit, toUnit } from "./format";

// Reference results for the default setups: speed at shift, OSS, RPM after upshift, mph per 1,000 rpm.
const ref10r80 = [
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
const refMt82 = [
  [48.053817352478646, 2049.1803278688526, 4979.508196721311, 6.407175646997153],
  [72.37735453089375, 3086.4197530864194, 5216.049382716049, 9.650313937452502],
  [104.0692139112851, 4437.869822485207, 5857.988165680474, 13.87589518817135],
  [133.24012993187262, 5681.818181818182, 5681.818181818182, 17.765350657583017],
  [175.87697151007185, 7500, 4875, 23.450262868009577],
  [270.5799561693413, 11538.461538461537, null, 36.07732748924551],
];
// Worked out separately in Python from the same formulas: 315/50R17, 3.73 rear, 7,500 RPM.
const refMt82D4 = [
  [54.333324531996254, 2316.9601482854496, 4874.884151992585, 7.244443270932833],
  [83.59171649718243, 3564.638783269962, 5068.916349809886, 11.145562199624324],
  [123.68282103380582, 5274.261603375528, 5274.261603375528, 16.491042804507444],
  [175.87697151007185, 7500, 6105, 23.450262868009577],
  [216.06507556519887, 9213.759213759215, 5730.958230958231, 28.808676742026513],
  [282.76040435702873, 12057.877813504823, null, 37.701387247603826],
];

// 10R80 10th-gear speed at 7,800 RPM for every preset rear ratio, from the same Python check.
const ref10thByRear: Record<number, number> = {
  3.15: 340.55203548061826, 3.31: 324.09030566886634, 3.55: 302.179975144774, 3.73: 287.5975634755892,
  3.9: 275.06125942665324, 4.09: 262.2833525095227, 4.1: 261.643637015597, 4.3: 249.47416552649943,
  4.56: 235.24976135174293, 4.88: 219.82354749261228,
};

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

describe("matches reference results", () => {
  const h = effectiveHeight(EXAMPLE_TIRE);
  it("tire height", () => {
    expect(calculatedHeight(EXAMPLE_TIRE)).toBeCloseTo(29.401574803149607, 12);
    expect(h).toBeCloseTo(29.401574803149607, 12);
  });
  it("10R80: 3.15 rear, 7,800 RPM", () => {
    check(gearTable(GEARBOXES["10r80"].ratios, 3.15, Array(10).fill(7800), h), ref10r80);
  });
  it("MT82: 2015-2017, 3.73 rear, 7,500 RPM", () => {
    check(gearTable(GEARBOXES["mt82-1517"].ratios, 3.73, Array(6).fill(7500), h), refMt82);
  });
  it("override and growth", () => {
    expect(effectiveHeight({ ...EXAMPLE_TIRE, override: 28, growthPct: 5 })).toBeCloseTo(29.4, 12);
  });
  it("rpmAt inverts mphAt", () => {
    const row = gearTable([1], 3.15, [7800], h)[0];
    expect(rpmAt(row.mph, row.overall, h)).toBeCloseTo(7800, 9);
  });
});

describe("other configurations", () => {
  const h = effectiveHeight(EXAMPLE_TIRE);

  it("MT82-D4: 2018+, 3.73 rear, 7,500 RPM", () => {
    check(gearTable(GEARBOXES["mt82-18"].ratios, 3.73, Array(6).fill(7500), h), refMt82D4);
  });

  it("every preset rear ratio", () => {
    expect(REAR_RATIOS).toHaveLength(Object.keys(ref10thByRear).length);
    for (const rear of REAR_RATIOS) {
      const top = gearTable(GEARBOXES["10r80"].ratios, rear, Array(10).fill(7800), h)[9];
      expect(top.mph, `rear ${rear}`).toBeCloseTo(ref10thByRear[rear], 9);
    }
  });

  it("different shift RPM per gear", () => {
    const rows = gearTable([3.66, 2.43], 3.73, [6000, 7000], h);
    expect(rows[0].rpmAfter).toBeCloseTo((6000 * 2.43) / 3.66, 9);
    expect(rows[1].oss).toBeCloseTo(7000 / 2.43, 9);
  });

  it("upshift drop matches RPM after upshift", () => {
    const ratios = GEARBOXES["10r80"].ratios;
    const rows = gearTable(ratios, 3.15, Array(10).fill(7800), h);
    ratios.slice(0, -1).forEach((_, i) => {
      expect(1 - rows[i].rpmAfter! / 7800).toBeCloseTo(rpmDrop(ratios, i)!, 12);
    });
    expect(rpmDrop(ratios, 9)).toBeNull();
  });
});

describe("units and display", () => {
  it("km/h uses the exact mile", () => {
    const row = gearTable(GEARBOXES["10r80"].ratios, 3.15, Array(10).fill(7800), effectiveHeight(EXAMPLE_TIRE))[0];
    expect(row.kmh).toBeCloseTo(74.22691194478257, 9);
    expect(KM_PER_MILE).toBe(1.609344);
  });

  it("converts between mph and km/h both ways", () => {
    expect(toUnit(100, "kmh")).toBeCloseTo(160.9344, 12);
    expect(fromUnit(160.9344, "kmh")).toBeCloseTo(100, 12);
    expect(toUnit(70, "mph")).toBe(70);
    expect(fromUnit(toUnit(123.4, "kmh"), "kmh")).toBeCloseTo(123.4, 12);
  });

  it("formats like the original calculator", () => {
    expect(fmtRpm(4958.049403747871)).toBe("4,958");
    expect(fmtSpeed(46.12246477122515)).toBe("46.1");
    expect(fmtSpeed(1000)).toBe("1,000.0");
  });
});

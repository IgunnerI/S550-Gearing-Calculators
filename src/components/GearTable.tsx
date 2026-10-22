import { rpmAt, type GearRow } from "../lib/gearing";
import { fmtOverall, fmtRatio, fmtRpm, fmtSpeed, fromUnit, ordinal, toUnit, unitLabel, type SpeedUnit } from "../lib/format";
import { check } from "../lib/limits";
import { NumberField } from "./NumberField";

interface Props {
  rows: GearRow[];
  tireHeight: number;
  unit: SpeedUnit;
  probeMph: number;
  onProbe: (mph: number) => void;
  onShiftRpm: (gearIndex: number, rpm: number) => void;
  activeGear: number | null;
  onActiveGear: (gear: number | null) => void;
}

const rpmRange = check("shiftRpm");

export function GearTable({ rows, tireHeight, unit, probeMph, onProbe, onShiftRpm, activeGear, onActiveGear }: Props) {
  const other: SpeedUnit = unit === "mph" ? "kmh" : "mph";
  return (
    <section className="block" aria-labelledby="table-h">
      <div className="block__head">
        <div>
          <h2 id="table-h" className="section-title">Gear by gear</h2>
          <p className="block__sub">
            Every figure for each gear. Amber-underlined cells are inputs; change a gear's shift point here.
          </p>
        </div>
        <NumberField
          id="probe"
          className="probe-field"
          label="Cruise speed"
          suffix={unitLabel(unit)}
          value={Math.round(toUnit(probeMph, unit) * 10) / 10}
          validate={check("probe")}
          onCommit={(v) => v !== null && onProbe(fromUnit(v, unit))}
        />
      </div>
      <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="table-h">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col" className="sticky-col">Gear</th>
              <th scope="col">Trans ratio</th>
              <th scope="col">Overall ratio</th>
              <th scope="col">Shift RPM</th>
              <th scope="col">OSS at shift</th>
              <th scope="col">Speed at shift <span className="th-unit">{unitLabel(unit)}</span></th>
              <th scope="col"><span className="th-unit">{unitLabel(other)}</span></th>
              <th scope="col">RPM after upshift</th>
              <th scope="col">{unitLabel(unit)} per 1,000 rpm</th>
              <th scope="col">RPM at {fmtSpeed(toUnit(probeMph, unit))} {unitLabel(unit)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cruise = rpmAt(probeMph, r.overall, tireHeight);
              const over = cruise > r.shiftRpm;
              return (
                <tr
                  key={r.gear}
                  className={activeGear === r.gear ? "is-active" : ""}
                  onPointerEnter={() => onActiveGear(r.gear)}
                  onPointerLeave={() => onActiveGear(null)}
                >
                  <th scope="row" className="sticky-col">{ordinal(r.gear)}</th>
                  <td>{fmtRatio(r.ratio)}</td>
                  <td>{fmtOverall(r.overall)}</td>
                  <td className="input-cell">
                    <NumberField
                      id={`shift-${r.gear}`}
                      label={`Shift RPM, ${ordinal(r.gear)} gear`}
                      hideLabel
                      value={r.shiftRpm}
                      step={100}
                      format={fmtRpm}
                      validate={rpmRange}
                      onCommit={(v) => v !== null && onShiftRpm(i, v)}
                    />
                  </td>
                  <td>{fmtRpm(r.oss)}</td>
                  <td className="strong">{fmtSpeed(toUnit(r.mph, unit))}</td>
                  <td className="muted">{fmtSpeed(toUnit(r.mph, other))}</td>
                  <td>{r.rpmAfter === null ? "—" : fmtRpm(r.rpmAfter)}</td>
                  <td>{fmtSpeed(toUnit(r.mphPer1000, unit))}</td>
                  <td className={over ? "muted" : ""} title={over ? "Above this gear's shift point" : undefined}>
                    {fmtRpm(cruise)}
                    {over && <span className="flag"> over shift</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        OSS is output shaft speed: engine RPM ÷ transmission ratio.
      </p>
    </section>
  );
}

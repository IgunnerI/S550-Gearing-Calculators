import { REAR_RATIOS, type Gearbox } from "../data/gearboxes";
import { gearTable, rpmAt } from "../lib/gearing";
import { fmtRear, fmtRpm, fmtSpeed, ordinal, toUnit, unitLabel, type SpeedUnit } from "../lib/format";

interface Props {
  box: Gearbox;
  rear: number;
  shiftRpms: number[];
  tireHeight: number;
  unit: SpeedUnit;
  probeMph: number;
  onRear: (rear: number) => void;
}

export function RearMatrix({ box, rear, shiftRpms, tireHeight, unit, probeMph, onRear }: Props) {
  const options = REAR_RATIOS.includes(rear) ? REAR_RATIOS : [...REAR_RATIOS, rear].sort((a, b) => a - b);
  const top = box.ratios.length;
  return (
    <section className="block" aria-labelledby="rear-matrix-h">
      <div className="block__head">
        <div>
          <h2 id="rear-matrix-h" className="section-title">Every rear gear on the list</h2>
          <p className="block__sub">
            Speed at each shift for the {box.short} with your tire and shift points. Pick a row to use that ratio.
          </p>
        </div>
      </div>
      <div className="table-scroll" tabIndex={0} role="region" aria-labelledby="rear-matrix-h">
        <table className="data-table data-table--matrix">
          <thead>
            <tr>
              <th scope="col" className="sticky-col">Rear</th>
              {box.ratios.map((_, i) => (
                <th key={i} scope="col">{ordinal(i + 1)}</th>
              ))}
              <th scope="col">{ordinal(top)} at {fmtSpeed(toUnit(probeMph, unit))} {unitLabel(unit)}</th>
            </tr>
          </thead>
          <tbody>
            {options.map((r) => {
              const rows = gearTable(box.ratios, r, shiftRpms, tireHeight);
              const selected = r === rear;
              return (
                <tr key={r} className={selected ? "is-selected" : ""}>
                  <th scope="row" className="sticky-col">
                    <button type="button" className="row-pick" aria-pressed={selected} onClick={() => onRear(r)}>
                      {fmtRear(r)}
                      {!REAR_RATIOS.includes(r) && <span className="flag"> custom</span>}
                    </button>
                  </th>
                  {rows.map((row) => (
                    <td key={row.gear}>{fmtSpeed(toUnit(row.mph, unit))}</td>
                  ))}
                  <td>{fmtRpm(rpmAt(probeMph, rows[top - 1].overall, tireHeight))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="table-note">Speeds in {unitLabel(unit)}.</p>
    </section>
  );
}

import type { GearRow } from "../lib/gearing";
import { fmtRpm, ordinal, toUnit, unitLabel, type SpeedUnit } from "../lib/format";

interface Props {
  rows: GearRow[];
  unit: SpeedUnit;
  activeGear: number | null;
  onActiveGear: (gear: number | null) => void;
}

const speed0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export function GearStrip({ rows, unit, activeGear, onActiveGear }: Props) {
  return (
    <ol className={`gear-strip gear-strip--${rows.length}`} aria-label="Speed at each shift">
      {rows.map((r) => (
        <li
          key={r.gear}
          className={`gear-cell ${activeGear === r.gear ? "is-active" : ""}`}
          onPointerEnter={() => onActiveGear(r.gear)}
          onPointerLeave={() => onActiveGear(null)}
        >
          <span className="gear-cell__gear">{ordinal(r.gear)}</span>
          <span className="gear-cell__speed">
            {speed0.format(toUnit(r.mph, unit))}
            <span className="gear-cell__unit"> {unitLabel(unit)}</span>
          </span>
          <span className="gear-cell__after">
            {r.rpmAfter === null ? <>Top<span className="after-label"> gear</span></> : <><span className="after-label">Lands at </span>{fmtRpm(r.rpmAfter)}</>}
          </span>
        </li>
      ))}
    </ol>
  );
}

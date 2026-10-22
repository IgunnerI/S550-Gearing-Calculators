import { GEARBOXES, GEARBOX_ORDER, type GearboxId } from "../data/gearboxes";
import type { SpeedUnit } from "../lib/format";

interface Props {
  box: GearboxId;
  unit: SpeedUnit;
  onBox: (id: GearboxId) => void;
  onUnit: (unit: SpeedUnit) => void;
}

export function Masthead({ box, unit, onBox, onUnit }: Props) {
  return (
    <header className="masthead">
      <div className="masthead__inner">
        <div className="brand">
          <p className="brand__mark">S550</p>
          <div>
            <p className="brand__name">Shift Speeds</p>
            <p className="brand__sub">Mustang GT gearing calculator</p>
          </div>
        </div>

        <nav className="gearbox-nav" aria-label="Transmission">
          {GEARBOX_ORDER.map((id) => {
            const g = GEARBOXES[id];
            return (
              <button
                key={id}
                type="button"
                className="gearbox-nav__item"
                aria-pressed={box === id}
                onClick={() => onBox(id)}
              >
                <span className="gearbox-nav__name">{g.short}</span>
                <span className="gearbox-nav__meta">
                  <span className="gearbox-nav__long">{g.ratios.length}-speed {g.kind} · </span>{g.years}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="segmented" role="radiogroup" aria-label="Speed unit">
          {(["mph", "kmh"] as const).map((u) => (
            <button key={u} type="button" role="radio" aria-checked={unit === u} onClick={() => onUnit(u)}>
              {u === "mph" ? "mph" : "km/h"}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

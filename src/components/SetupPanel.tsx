import { useState } from "react";
import { REAR_RATIOS, type Gearbox } from "../data/gearboxes";
import { calculatedHeight, MM_PER_INCH, type TireInput } from "../lib/gearing";
import { fmtHeight, fmtInt, fmtRear, fmtRpm } from "../lib/format";
import type { DrivetrainSetup } from "../lib/state";
import { between, NumberField } from "./NumberField";

interface Props {
  box: Gearbox;
  tire: TireInput;
  tireHeight: number;
  setup: DrivetrainSetup;
  onTire: (patch: Partial<TireInput>) => void;
  onRear: (rear: number) => void;
  onAllShift: (rpm: number) => void;
  onRestore: () => void;
}

const rpmRange = between(1000, 10000, "Shift RPM");

export function SetupPanel({ box, tire, tireHeight, setup, onTire, onRear, onAllShift, onRestore }: Props) {
  const calc = calculatedHeight(tire);
  const inList = REAR_RATIOS.includes(setup.rear);
  const uniform = setup.shiftRpms.every((r) => r === setup.shiftRpms[0]);
  const [allRpm, setAllRpm] = useState<number | null>(setup.shiftRpms[0]);

  return (
    <aside className="setup" aria-label="Setup">
      <section className="setup__group" aria-labelledby="tire-h">
        <h2 id="tire-h" className="setup__title">Tire</h2>
        <div className="tire-row">
          <NumberField id="tire-width" label="Width" suffix="mm" value={tire.width}
            validate={between(100, 500, "Width")} onCommit={(v) => v !== null && onTire({ width: v })} />
          <NumberField id="tire-aspect" label="Aspect" suffix="%" value={tire.aspect}
            validate={between(10, 100, "Aspect ratio")} onCommit={(v) => v !== null && onTire({ aspect: v })} />
          <NumberField id="tire-wheel" label="Wheel" suffix="in" value={tire.wheel}
            validate={between(10, 30, "Wheel diameter")} onCommit={(v) => v !== null && onTire({ wheel: v })} />
        </div>
        <p className="readout-line">
          <span>Calculated height</span>
          <span className="num">{fmtHeight(calc)} in</span>
        </p>
        <NumberField id="tire-override" label="Measured height" suffix="in" value={tire.override} allowEmpty
          placeholder="Use calculated" format={fmtHeight}
          validate={between(15, 50, "Measured height")}
          hint="Optional. Enter a measured or advertised height, such as 28 for a 28×10.5."
          onCommit={(v) => onTire({ override: v })} />
        <NumberField id="tire-growth" label="Growth at speed" suffix="%" value={tire.growthPct} step={0.5}
          validate={between(-20, 50, "Growth")}
          hint="Drag radials grow at speed. 0% means no growth."
          onCommit={(v) => v !== null && onTire({ growthPct: v })} />
        <div className="effective">
          <p className="effective__label">Effective height</p>
          <p className="effective__value">
            {fmtHeight(tireHeight)}<span> in</span>
          </p>
          <p className="effective__alt">{fmtInt(tireHeight * MM_PER_INCH)} mm · {fmtHeight(tireHeight * Math.PI)} in around</p>
        </div>
      </section>

      <section className="setup__group" aria-labelledby="rear-h">
        <h2 id="rear-h" className="setup__title">Rear gear</h2>
        <div className="rear-grid" role="radiogroup" aria-labelledby="rear-h">
          {REAR_RATIOS.map((r) => (
            <button key={r} type="button" role="radio" aria-checked={setup.rear === r} className="rear-chip" onClick={() => onRear(r)}>
              {fmtRear(r)}
            </button>
          ))}
        </div>
        <NumberField id="rear-custom" label="Other ratio" value={inList ? null : setup.rear} allowEmpty
          placeholder="e.g. 3.27" format={fmtRear} step={0.01}
          validate={between(1.5, 7, "Rear ratio")}
          onCommit={(v) => v !== null && onRear(v)} />
      </section>

      <section className="setup__group" aria-labelledby="rpm-h">
        <h2 id="rpm-h" className="setup__title">Shift RPM</h2>
        <form
          className="rpm-all"
          onSubmit={(e) => {
            e.preventDefault();
            if (allRpm !== null && rpmRange(allRpm) === null) onAllShift(allRpm);
          }}
        >
          <NumberField id="rpm-all" label="Every gear" suffix="rpm" value={allRpm} step={100} format={fmtRpm}
            validate={rpmRange} onCommit={setAllRpm} />
          <button type="submit" className="button">Apply</button>
        </form>
        <p className="setup__note">
          {uniform
            ? `All ${box.ratios.length} gears shift at ${fmtRpm(setup.shiftRpms[0])} rpm.`
            : `Gears shift at ${fmtRpm(Math.min(...setup.shiftRpms))}–${fmtRpm(Math.max(...setup.shiftRpms))} rpm.`}{" "}
          Set single gears in the table.
        </p>
      </section>

      <button type="button" className="text-button setup__restore" onClick={() => { onRestore(); setAllRpm(box.defaultShiftRpm); }}>
        Restore the defaults
      </button>
    </aside>
  );
}

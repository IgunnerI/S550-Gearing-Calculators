import { useState } from "react";
import { GearStrip } from "./components/GearStrip";
import { GearTable } from "./components/GearTable";
import { Masthead } from "./components/Masthead";
import { Method } from "./components/Method";
import { RatioSheet } from "./components/RatioSheet";
import { RearMatrix } from "./components/RearMatrix";
import { SetupPanel } from "./components/SetupPanel";
import { ShiftChart } from "./components/ShiftChart";
import { fmtHeight, fmtRear, fmtRpm, tireSize } from "./lib/format";
import { useAppState } from "./lib/state";

export function App() {
  const { state, box, setup, tireHeight, rows, actions } = useAppState();
  const [activeGear, setActiveGear] = useState<number | null>(null);
  const uniform = setup.shiftRpms.every((r) => r === setup.shiftRpms[0]);
  const t = state.tire;

  return (
    <>
      <Masthead box={state.box} unit={state.unit} onBox={actions.setBox} onUnit={actions.setUnit} />
      <div className="layout">
        <SetupPanel
          key={state.box}
          box={box}
          tire={state.tire}
          tireHeight={tireHeight}
          setup={setup}
          onTire={actions.setTire}
          onRear={actions.setRear}
          onAllShift={actions.setAllShiftRpms}
          onRestore={actions.restoreExample}
        />
        <main className="main" id="main">
          <section className="hero" aria-labelledby="hero-h">
            <p className="spec-line">
              <span>{box.name} {box.years}</span>
              <span>{fmtRear(setup.rear)} rear</span>
              <span>{t.override === null ? tireSize(t.width, t.aspect, t.wheel) : `${fmtHeight(t.override)} in tire`}{t.growthPct !== 0 ? ` +${t.growthPct}%` : ""}</span>
              <span>
                {uniform ? `${fmtRpm(setup.shiftRpms[0])} rpm shifts` : "Per-gear shift points"}
                {uniform && setup.shiftRpms[0] === box.defaultShiftRpm ? " (example)" : ""}
              </span>
            </p>
            <h1 id="hero-h" className="hero__title">Speed at every shift</h1>
            <GearStrip rows={rows} unit={state.unit} activeGear={activeGear} onActiveGear={setActiveGear} />
            <p className="hero__note">
              Theoretical speeds: where each shift point falls with zero slip. They are not speeds the car can reach.
              Drag and engine power stop it well short of the top-gear figures.
            </p>
          </section>

          <ShiftChart
            rows={rows}
            tireHeight={tireHeight}
            unit={state.unit}
            probeMph={state.probeMph}
            onProbe={actions.setProbeMph}
            activeGear={activeGear}
            onActiveGear={setActiveGear}
          />

          <GearTable
            rows={rows}
            tireHeight={tireHeight}
            unit={state.unit}
            probeMph={state.probeMph}
            onProbe={actions.setProbeMph}
            onShiftRpm={actions.setShiftRpm}
            activeGear={activeGear}
            onActiveGear={setActiveGear}
          />

          <RearMatrix
            box={box}
            rear={setup.rear}
            shiftRpms={setup.shiftRpms}
            tireHeight={tireHeight}
            unit={state.unit}
            probeMph={state.probeMph}
            onRear={actions.setRear}
          />

          <RatioSheet current={state.box} onBox={actions.setBox} />
        </main>
      </div>
      <Method box={box} />
    </>
  );
}

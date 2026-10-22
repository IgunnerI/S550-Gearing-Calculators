import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { rpmAt, type GearRow } from "../lib/gearing";
import { fmtRpm, fmtSpeed, fromUnit, ordinal, toUnit, unitLabel, type SpeedUnit } from "../lib/format";

interface Props {
  rows: GearRow[];
  tireHeight: number;
  unit: SpeedUnit;
  probeMph: number;
  onProbe: (mph: number) => void;
  activeGear: number | null;
  onActiveGear: (gear: number | null) => void;
}

const M = { top: 30, right: 18, bottom: 40, left: 44 };

function niceStep(range: number, target: number): number {
  const raw = range / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 2.25 ? 2 : norm < 3.5 ? 2.5 : norm < 7.5 ? 5 : 10;
  return nice * mag;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** The gear you would be in at a road speed if every shift happens at its set RPM. */
function gearAtSpeed(rows: GearRow[], mph: number): number | null {
  const row = rows.find((r) => mph <= r.mph);
  return row ? row.gear : null;
}

export function ShiftChart({ rows, tireHeight, unit, probeMph, onProbe, activeGear, onActiveGear }: Props) {
  const [hidden, setHidden] = useState<Set<number>>(new Set());
  const [cursorMph, setCursorMph] = useState<number | null>(null);
  const [wrapRef, width] = useWidth<HTMLDivElement>();

  // Gear count changes when switching gearbox; drop hidden gears that no longer exist.
  useEffect(() => {
    setHidden((h) => new Set([...h].filter((g) => g <= rows.length)));
  }, [rows.length]);

  const visible = rows.filter((r) => !hidden.has(r.gear));
  const height = Math.round(Math.min(460, Math.max(300, width * 0.52)));
  const iw = width - M.left - M.right;
  const ih = height - M.top - M.bottom;

  const { xMax, xStep, yMax } = useMemo(() => {
    const top = Math.max(...(visible.length ? visible : rows).map((r) => toUnit(r.mph, unit)));
    const step = niceStep(top, width < 520 ? 4 : 7);
    const maxRpm = Math.max(...rows.map((r) => r.shiftRpm));
    return { xMax: Math.ceil((top * 1.04) / step) * step, xStep: step, yMax: Math.ceil((maxRpm + 400) / 1000) * 1000 };
  }, [visible, rows, unit, width]);

  const x = (mph: number) => M.left + (toUnit(mph, unit) / xMax) * iw;
  const y = (rpm: number) => M.top + ih - (rpm / yMax) * ih;
  const xTicks = Array.from({ length: Math.floor(xMax / xStep) + 1 }, (_, i) => i * xStep);
  const yTicks = Array.from({ length: yMax / 1000 + 1 }, (_, i) => i * 1000);

  function speedFromPointer(e: MouseEvent<SVGRectElement>) {
    const box = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * iw;
    return fromUnit(Math.max(0, Math.min(xMax, (px / iw) * xMax)), unit);
  }

  function onKey(e: KeyboardEvent<SVGSVGElement>) {
    const stepMph = fromUnit(e.shiftKey ? 10 : 1, unit);
    const current = cursorMph ?? probeMph;
    const limit = fromUnit(xMax, unit);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = Math.max(0, Math.min(limit, current + (e.key === "ArrowRight" ? stepMph : -stepMph)));
      setCursorMph(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onProbe(current);
    } else if (e.key === "Escape") {
      setCursorMph(null);
    }
  }

  const cursorGear = cursorMph === null ? null : gearAtSpeed(rows, cursorMph);
  const tipLeft = cursorMph === null ? 0 : x(cursorMph);
  const tipOnLeft = tipLeft > width * 0.6;

  return (
    <figure className="chart" aria-labelledby="chart-title">
      <div className="chart__head">
        <div>
          <h2 id="chart-title" className="section-title">Engine speed through the gears</h2>
          <p className="chart__sub">
            Each line is one gear. The heavy trace follows the car through every shift; amber drops show
            where the revs land after each upshift. Click the chart to set the cruise speed used in the table.
          </p>
        </div>
        <fieldset className="gear-toggles">
          <legend className="sr-only">Gears shown on the chart</legend>
          {rows.map((r) => (
            <label key={r.gear} className="gear-toggle">
              <input
                type="checkbox"
                checked={!hidden.has(r.gear)}
                onChange={(e) =>
                  setHidden((h) => {
                    const n = new Set(h);
                    if (e.target.checked) n.delete(r.gear);
                    else if (rows.length - n.size > 1) n.add(r.gear);
                    return n;
                  })
                }
              />
              <span>{r.gear}</span>
            </label>
          ))}
          {hidden.size > 0 && (
            <button type="button" className="text-button" onClick={() => setHidden(new Set())}>
              Show all
            </button>
          )}
        </fieldset>
      </div>

      <div className="chart__plot" ref={wrapRef}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Engine RPM against road speed for ${rows.length} gears. Use the left and right arrow keys to read RPM at a speed; press Enter to set it as the cruise speed.`}
          tabIndex={0}
          onKeyDown={onKey}
          onBlur={() => setCursorMph(null)}
          className="chart__svg"
        >
          <g className="grid">
            {yTicks.map((t) => (
              <g key={t}>
                <line x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} />
                <text x={M.left - 10} y={y(t)} dy="0.32em" textAnchor="end">{t / 1000}</text>
              </g>
            ))}
            {xTicks.map((t) => (
              <text key={t} x={M.left + (t / xMax) * iw} y={height - M.bottom + 20} textAnchor="middle">{t}</text>
            ))}
            <text x={4} y={M.top - 14} className="axis-name">×1000 rpm</text>
            <text x={width - M.right} y={height - 6} textAnchor="end" className="axis-name">{unitLabel(unit)}</text>
          </g>

          {/* Probe (cruise) speed */}
          {toUnit(probeMph, unit) <= xMax && (
            <g className="probe">
              <line x1={x(probeMph)} x2={x(probeMph)} y1={M.top} y2={M.top + ih} />
              <text x={x(probeMph) + 6} y={M.top + ih - 8}>{fmtSpeed(toUnit(probeMph, unit))}</text>
            </g>
          )}

          {/* Full gear lines from rest */}
          {visible.map((r) => (
            <line
              key={`ray-${r.gear}`}
              className={`ray ${activeGear === r.gear ? "is-active" : ""}`}
              x1={x(0)} y1={y(0)} x2={x(r.mph)} y2={y(r.shiftRpm)}
            />
          ))}

          {/* The in-gear stretch of the sawtooth */}
          {visible.map((r) => {
            const prev = rows[r.gear - 2];
            const x0 = prev ? x(prev.mph) : x(0);
            const y0 = prev && prev.rpmAfter !== null ? y(prev.rpmAfter) : y(0);
            return (
              <line
                key={`run-${r.gear}`}
                className={`run ${activeGear === r.gear ? "is-active" : ""}`}
                x1={x0} y1={y0} x2={x(r.mph)} y2={y(r.shiftRpm)}
              />
            );
          })}

          {/* Upshift drops */}
          {visible.map((r) =>
            r.rpmAfter === null || hidden.has(r.gear + 1) ? null : (
              <line key={`drop-${r.gear}`} className="drop" x1={x(r.mph)} x2={x(r.mph)} y1={y(r.shiftRpm)} y2={y(r.rpmAfter)} />
            ),
          )}

          {visible.map((r) => (
            <g key={`pt-${r.gear}`} className={`shift-pt ${activeGear === r.gear ? "is-active" : ""}`}>
              <circle cx={x(r.mph)} cy={y(r.shiftRpm)} r={4.5} />
              <text x={x(r.mph)} y={y(r.shiftRpm) - 11} textAnchor="middle">{r.gear}</text>
            </g>
          ))}

          {cursorMph !== null && (
            <g className="cursor">
              <line x1={x(cursorMph)} x2={x(cursorMph)} y1={M.top} y2={M.top + ih} />
              {rows.map((r) => {
                if (hidden.has(r.gear) || cursorMph > r.mph) return null;
                const rpm = rpmAt(cursorMph, r.overall, tireHeight);
                return <circle key={r.gear} cx={x(cursorMph)} cy={y(rpm)} r={r.gear === cursorGear ? 4.5 : 3} className={r.gear === cursorGear ? "is-current" : ""} />;
              })}
            </g>
          )}

          <rect
            className="hit"
            x={M.left} y={M.top} width={iw} height={ih}
            fill="transparent"
            onPointerMove={(e) => setCursorMph(speedFromPointer(e))}
            onPointerLeave={() => { setCursorMph(null); onActiveGear(null); }}
            onClick={(e) => onProbe(speedFromPointer(e))}
          />
        </svg>

        {cursorMph !== null && (
          <div
            className="tooltip"
            style={{ left: tipOnLeft ? undefined : tipLeft + 14, right: tipOnLeft ? width - tipLeft + 14 : undefined }}
            role="status"
          >
            <p className="tooltip__head">
              <strong>{fmtSpeed(toUnit(cursorMph, unit))}</strong> {unitLabel(unit)}
            </p>
            <ul>
              {visible.map((r) => {
                const rpm = rpmAt(cursorMph, r.overall, tireHeight);
                const past = cursorMph > r.mph;
                return (
                  <li key={r.gear} className={r.gear === cursorGear ? "is-current" : past ? "is-past" : ""}>
                    <span className="tooltip__key" aria-hidden="true" />
                    <span className="tooltip__value">{past ? "past shift" : fmtRpm(rpm)}</span>
                    <span className="tooltip__label">{ordinal(r.gear)}</span>
                  </li>
                );
              })}
            </ul>
            {cursorGear === null && <p className="tooltip__note">Beyond the top-gear shift point.</p>}
          </div>
        )}
      </div>

      <figcaption className="chart__key">
        <span><i className="key key--run" /> In gear</span>
        <span><i className="key key--ray" /> Gear line from rest</span>
        <span><i className="key key--drop" /> Upshift drop</span>
        <span><i className="key key--probe" /> Cruise speed</span>
      </figcaption>
    </figure>
  );
}

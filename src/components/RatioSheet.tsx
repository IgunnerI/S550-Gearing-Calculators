import { GEARBOXES, GEARBOX_ORDER, type GearboxId } from "../data/gearboxes";
import { rpmDrop } from "../lib/gearing";
import { fmtPct, fmtRatio, ordinal } from "../lib/format";

interface Props {
  current: GearboxId;
}

// One scale for every gearbox, so bar lengths compare across tabs.
const MAX_RATIO = Math.max(...GEARBOX_ORDER.flatMap((id) => GEARBOXES[id].ratios));

export function RatioSheet({ current }: Props) {
  const g = GEARBOXES[current];
  const spread = g.ratios[0] / g.ratios[g.ratios.length - 1];
  return (
    <section className="block" aria-labelledby="ratios-h">
      <div className="block__head">
        <div>
          <h2 id="ratios-h" className="section-title">{g.name} ratios</h2>
          <p className="block__sub">
            {g.years} · {g.ratios.length}-speed {g.kind}. The drop is how far the revs fall on the upshift into the
            next gear. Bars use the same scale on every transmission tab.
          </p>
        </div>
      </div>
      <div className="ratio-sheet">
        <table className="ratio-table">
          <thead>
            <tr>
              <th scope="col">Gear</th>
              <th scope="col">Ratio</th>
              <th scope="col"><span className="sr-only">Ratio bar</span></th>
              <th scope="col">Drop</th>
            </tr>
          </thead>
          <tbody>
            {g.ratios.map((r, i) => {
              const drop = rpmDrop(g.ratios, i);
              return (
                <tr key={i}>
                  <th scope="row">{ordinal(i + 1)}</th>
                  <td className="num">
                    {fmtRatio(r)}
                    {g.direct === i + 1 && <span className="tag">1:1</span>}
                    {r < 1 && <span className="tag tag--quiet">OD</span>}
                  </td>
                  <td className="bar-cell" aria-hidden="true">
                    <span className="ratio-bar" style={{ width: `${(r / MAX_RATIO) * 100}%` }} />
                  </td>
                  <td className="num muted">{drop === null ? "—" : fmtPct(drop)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <aside className="ratio-sheet__facts" aria-label={`${g.name} summary`}>
          <p className="ratio-sheet__spread">
            <span className="num">{spread.toFixed(2)}</span>
            overall spread (1st ÷ top)
          </p>
          <p>{g.direct === null ? "No 1:1 gear." : `${ordinal(g.direct)} is 1:1.`}</p>
          <p className="source">Source: {g.source}</p>
        </aside>
      </div>
    </section>
  );
}

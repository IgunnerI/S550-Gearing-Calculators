import { GEARBOXES, GEARBOX_ORDER, type GearboxId } from "../data/gearboxes";
import { rpmDrop } from "../lib/gearing";
import { fmtPct, fmtRatio, ordinal } from "../lib/format";

interface Props {
  current: GearboxId;
  onBox: (id: GearboxId) => void;
}

const MAX_RATIO = Math.max(...GEARBOX_ORDER.flatMap((id) => GEARBOXES[id].ratios));

export function RatioSheet({ current, onBox }: Props) {
  return (
    <section className="block" aria-labelledby="ratios-h">
      <div className="block__head">
        <div>
          <h2 id="ratios-h" className="section-title">Transmission ratios</h2>
          <p className="block__sub">
            Bars are drawn to one scale. The drop is how far the revs fall on the upshift into the next gear.
          </p>
        </div>
      </div>
      <div className="ratio-sheet">
        {GEARBOX_ORDER.map((id) => {
          const g = GEARBOXES[id];
          const spread = g.ratios[0] / g.ratios[g.ratios.length - 1];
          return (
            <article key={id} className={`ratio-card ${id === current ? "is-current" : ""}`} aria-labelledby={`rc-${id}`}>
              <header className="ratio-card__head">
                <h3 id={`rc-${id}`}>{g.name}</h3>
                <p>{g.years} · {g.ratios.length}-speed {g.kind}</p>
              </header>
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
              <footer className="ratio-card__foot">
                <p><span className="num">{spread.toFixed(2)}</span> overall spread (1st ÷ top)</p>
                <p className="source">Source: {g.source}</p>
                {id !== current && (
                  <button type="button" className="text-button" onClick={() => { onBox(id); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                    Calculate with the {g.short}
                  </button>
                )}
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}

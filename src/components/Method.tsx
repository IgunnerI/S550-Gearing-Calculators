import type { Gearbox } from "../data/gearboxes";

export function Method({ box }: { box: Gearbox }) {
  return (
    <footer className="method" aria-labelledby="method-h">
      <div className="method__inner">
        <h2 id="method-h" className="section-title">How the numbers are made</h2>
        <div className="method__grid">
          <div className="method__formula">
            <p className="formula">
              <span>mph</span> = <span>rpm</span> ÷ (<span>trans</span> × <span>rear</span>) × <span>tire height</span> × π × 60 ÷ 63,360
            </p>
            <p className="formula">
              <span>OSS</span> = <span>rpm</span> ÷ <span>trans</span>
            </p>
            <p className="formula">
              <span>height</span> = <span>width</span> × <span>aspect</span> ÷ 100 × 2 ÷ 25.4 + <span>wheel</span>
            </p>
          </div>
          <ul className="method__notes">
            <li>{box.slipNote} Real speeds come in a little lower.</li>
            <li>Calculated height uses the nominal tire size. A loaded tire is usually a bit shorter, so a measured height gives truer numbers.</li>
            <li>Tire growth is applied as one fixed percentage. Real growth changes with the tire's construction, pressure, load and speed.</li>
            <li>Shift RPMs start at an example value. They are not factory shift points; set them for your engine and tune.</li>
            <li>The top-gear shift speeds are theoretical. They show where the shift point would fall; aerodynamic drag stops the car well before them.</li>
            <li>2015–2017 MT82: 5th is 1:1. 2018+ MT82-D4: 4th is 1:1. 10R80: 7th is 1:1.</li>
            <li>Ratios are for the Mustang GT. Other S550 models can use different transmissions; the Shelby GT350 and the Mach 1 manual use a Tremec 6-speed, which isn't covered here.</li>
          </ul>
        </div>
        <p className="method__credit">
          Your inputs are saved in this browser only.
        </p>
      </div>
    </footer>
  );
}

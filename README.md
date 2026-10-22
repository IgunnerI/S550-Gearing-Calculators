# S550 Shift Speeds

A shift-speed calculator for the S550 Mustang GT. It covers the 10R80 automatic, the 2015–2017 MT82
and the 2018+ MT82-D4, with tire, rear-gear and per-gear shift-RPM inputs.

```sh
npm install
npm run dev        # local dev server
npm test           # checks the math against known results
npm run build      # static site in dist/
npm run artifact   # single-file page in artifact/index.html
```

- `src/data/gearboxes.ts`: transmission ratios, rear-gear list and default inputs
- `src/lib/gearing.ts`: the shift-speed formulas
- `src/components/`: masthead, setup rail, shift strip, chart, tables, ratio sheet

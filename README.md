# S550 Shift Speeds

A shift-speed calculator for the S550 Mustang GT, built from `S550_Shift_Speed_Calculator.xlsx`.
It covers the 10R80 automatic, the 2015–2017 MT82 and the 2018+ MT82-D4, with the workbook's
tire, rear-gear and per-gear shift-RPM inputs.

```sh
npm install
npm run dev        # local dev server
npm test           # checks the math against the workbook's cached values
npm run build      # static site in dist/
npm run artifact   # single-file page in artifact/index.html
```

- `src/data/gearboxes.ts`: ratios, rear-gear list and example inputs copied from the Ratios tab
- `src/lib/gearing.ts`: the workbook formulas
- `src/components/`: masthead, setup rail, shift strip, chart, tables, ratio sheet

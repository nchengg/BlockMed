import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/cwbec/BlockMed/financial-projections/Blockmediary_Financial_Model_Detailed_2026-08-12.xlsx";
const outDir = "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/before-renders";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
await fs.mkdir(outDir, { recursive: true });

function colName(index) {
  let n = index + 1;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

const sheets = [];
const matchedCells = [];
const linkedFormulas = [];
for (let i = 0; i < 15; i += 1) {
  const sheet = workbook.worksheets.getItemAt(i);
  const used = sheet.getUsedRange();
  const values = used.values;
  const formulas = used.formulas;
  sheets.push({ name: sheet.name, rows: values.length, cols: values[0]?.length ?? 0 });

  for (let r = 0; r < values.length; r += 1) {
    for (let c = 0; c < (values[r]?.length ?? 0); c += 1) {
      const value = values[r][c];
      const formula = formulas[r]?.[c] ?? null;
      const address = `${sheet.name}!${colName(c)}${r + 1}`;
      if (typeof value === "string" && /VARA|DIFC|pilot|launch|licen[cs]|permitted month|operating month|first paid|first cash/i.test(value)) {
        matchedCells.push({ address, value, formula });
      }
      if (typeof formula === "string" && /Launch Readiness|VARA|DIFC/i.test(formula)) {
        linkedFormulas.push({ address, value, formula });
      }
    }
  }

  const rendered = await workbook.render({ sheetName: sheet.name, autoCrop: "all", scale: 0.75, format: "png" });
  const safe = `${String(i + 1).padStart(2, "0")}-${sheet.name.replaceAll(" ", "-").replaceAll("&", "and")}`;
  await fs.writeFile(`${outDir}/${safe}.png`, new Uint8Array(await rendered.arrayBuffer()));
}

const ranges = {};
for (const [sheetName, address] of [
  ["Launch Readiness", "A1:H90"],
  ["Dashboard", "A1:U30"],
  ["P&L 5yr", "A1:G85"],
  ["Cash Flow Statement", "A1:G45"],
  ["Assumptions", "B1:H180"],
  ["Model Checks", "A1:G50"],
]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  ranges[sheetName] = {
    address,
    values: sheet.getRange(address).values,
    formulas: sheet.getRange(address).formulas,
  };
}

const output = { sheets, matchedCells, linkedFormulas, ranges };
await fs.writeFile("C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/current-inspection.json", JSON.stringify(output, null, 2), "utf8");
console.log(JSON.stringify({ sheetCount: sheets.length, matchedCells: matchedCells.length, linkedFormulas: linkedFormulas.length, rendered: sheets.length }));

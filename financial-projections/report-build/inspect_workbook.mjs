import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = "C:/Users/cwbec/BlockMed";
const inputPath = path.join(root, "financial-projections", "Blockmediary_Financial_Model_Submission_Ready_2026-08-13.xlsx");
const outDir = path.join(root, "tmp", "financial-report", "workbook-audit");
await fs.mkdir(outDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sections = [];
sections.push((await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 6000 })).ndjson);

for (const range of [
  "Dashboard!A1:O78",
  "Launch Readiness!A1:J23",
  "Tier Economics!A1:U35",
  "Revenue Risk Add-Ons!A1:G35",
  "P&L 5yr!A1:H91",
  "Scenario Engine!A1:R67",
  "Client Funds Memo!A1:H31",
  "Model Checks!A1:G48",
]) {
  sections.push(`\n### ${range}\n`);
  sections.push((await workbook.inspect({
    kind: "table",
    range,
    include: "values,formulas",
    tableMaxRows: 100,
    tableMaxCols: 22,
    tableMaxCellChars: 140,
    maxChars: 18000,
  })).ndjson);
}

sections.push("\n### FORMULA ERRORS\n");
sections.push((await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
  maxChars: 8000,
})).ndjson);

await fs.writeFile(path.join(outDir, "audit.ndjson"), sections.join("\n"), "utf8");

for (const [sheetName, range, fileName] of [
  ["Dashboard", "A1:O78", "dashboard.png"],
  ["Launch Readiness", "A1:J23", "launch-readiness.png"],
  ["Tier Economics", "A1:U35", "tier-economics.png"],
  ["P&L 5yr", "A1:H91", "pl-5yr.png"],
  ["Scenario Engine", "A1:R67", "scenario-engine.png"],
  ["Model Checks", "A1:G48", "model-checks.png"],
]) {
  const blob = await workbook.render({ sheetName, range, scale: 1.2, format: "png" });
  await fs.writeFile(path.join(outDir, fileName), new Uint8Array(await blob.arrayBuffer()));
}

console.log(`Workbook audit written to ${outDir}`);

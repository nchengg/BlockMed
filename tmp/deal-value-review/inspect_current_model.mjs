import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx";
const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const output = [];
async function show(label, options) {
  const result = await workbook.inspect(options);
  output.push(`\n===== ${label} =====\n${result.ndjson}`);
}

await show("SHEETS", { kind: "sheet", include: "id,name", maxChars: 15000 });
await show("DEAL VALUE LABEL MATCHES", {
  kind: "match",
  searchTerm: "deal value|average ticket|avg ticket|automatic-verdict|50,000|50000|tier mix|review cost",
  options: { useRegex: true, maxResults: 250 },
  maxChars: 30000,
});
await show("ASSUMPTIONS", {
  kind: "table",
  sheetId: "Assumptions",
  range: "A1:H220",
  include: "values,formulas",
  tableMaxRows: 220,
  tableMaxCols: 8,
  tableMaxCellChars: 160,
  maxChars: 50000,
});
await show("TIER ECONOMICS", {
  kind: "table",
  sheetId: "Tier_Economics",
  range: "A1:V32",
  include: "values,formulas",
  tableMaxRows: 32,
  tableMaxCols: 22,
  tableMaxCellChars: 100,
  maxChars: 50000,
});
await show("REVENUE RISK ADDONS", {
  kind: "table",
  sheetId: "Revenue_Risk_AddOns",
  range: "A1:H52",
  include: "values,formulas",
  tableMaxRows: 52,
  tableMaxCols: 8,
  tableMaxCellChars: 140,
  maxChars: 30000,
});
await show("MODEL CHECKS", {
  kind: "table",
  sheetId: "Model_Checks",
  range: "A1:H40",
  include: "values,formulas",
  tableMaxRows: 40,
  tableMaxCols: 8,
  tableMaxCellChars: 140,
  maxChars: 30000,
});
await show("FORMULA ERRORS", {
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!",
  options: { useRegex: true, maxResults: 300 },
  maxChars: 12000,
});

const outputPath = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/current_model_inspect.txt";
await fs.writeFile(outputPath, output.join("\n"), "utf8");
console.log(`wrote=${outputPath} chars=${output.join("\n").length}`);

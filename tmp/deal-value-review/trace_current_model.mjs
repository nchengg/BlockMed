import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const blocks = [
  ["Tier_Economics", "B4:U26"],
  ["Scenario_Engine", "B8:R24"],
  ["Scenario_Engine", "B39:R46"],
  ["P&L_5yr", "C7:G29"],
  ["Revenue_Risk_AddOns", "B5:F24"],
  ["Model_Checks", "A4:G20"],
  ["Dashboard", "S10:U20"],
];

const output = [];
for (const [sheetName, rangeAddress] of blocks) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const range = sheet.getRange(rangeAddress);
  output.push(`\n===== ${sheetName}!${rangeAddress} VALUES =====\n${JSON.stringify(range.values)}`);
  output.push(`\n===== ${sheetName}!${rangeAddress} FORMULAS =====\n${JSON.stringify(range.formulas)}`);
}

for (const address of ["Tier_Economics!B8", "Tier_Economics!B9", "Tier_Economics!B12", "P&L_5yr!C8", "P&L_5yr!C9", "Scenario_Engine!H9", "Scenario_Engine!H10"]) {
  const traced = await workbook.trace(address);
  output.push(`\n===== TRACE ${address} =====\n${traced.ndjson}`);
}

const outputPath = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/current_model_trace.txt";
await fs.writeFile(outputPath, output.join("\n"), "utf8");
console.log(`wrote=${outputPath} chars=${output.join("\n").length}`);

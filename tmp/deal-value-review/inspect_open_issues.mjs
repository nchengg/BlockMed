import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/outputs/deal-value-update-2026-08-11/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx";
const outputPath = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/open-issues-inspection.txt";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

const blocks = [
  ["README", "B85:W102"],
  ["Assumptions", "A150:H190"],
  ["P&L_5yr", "A67:H90"],
  ["Cash_Flow_Statement", "A1:H90"],
  ["Scenario_Engine", "A5:R16"],
  ["Model_Checks", "A1:G35"],
];

const lines = [];
for (const [sheetName, address] of blocks) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const range = sheet.getRange(address);
  lines.push(`===== ${sheetName}!${address} VALUES =====`);
  range.values.forEach((row, index) => lines.push(`${index + Number(address.match(/\d+/)[0])}\t${row.map((value) => value ?? "").join("\t")}`));
  lines.push(`===== ${sheetName}!${address} FORMULAS =====`);
  range.formulas.forEach((row, index) => lines.push(`${index + Number(address.match(/\d+/)[0])}\t${row.map((value) => value ?? "").join("\t")}`));
}

await fs.writeFile(outputPath, lines.join("\n"), "utf8");
console.log(`saved=${outputPath} chars=${lines.join("\n").length}`);

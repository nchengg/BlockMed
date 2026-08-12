import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/outputs/deal-value-update-2026-08-11/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx";
const renderDir = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/final-rendered/detailed";
const auditPath = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/final-detailed-audit.txt";

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 20000 });
const names = [];
for (const line of sheetInfo.ndjson.split(/\r?\n/)) {
  try {
    const item = JSON.parse(line);
    if (item.name) names.push(item.name);
  } catch {}
}

function cell(sheetName, address) {
  const range = workbook.worksheets.getItem(sheetName).getRange(address);
  return { address: `${sheetName}!${address}`, value: range.values[0][0], formula: range.formulas[0][0] };
}

function columnName(index) {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

const formulaErrors = [];
const legacyReferences = [];
for (const name of names) {
  const sheet = workbook.worksheets.getItem(name);
  const used = sheet.getUsedRange();
  if (!used) continue;
  const values = used.values;
  const formulas = used.formulas;
  for (let row = 0; row < values.length; row += 1) {
    for (let col = 0; col < values[row].length; col += 1) {
      const value = values[row][col];
      const formula = formulas[row][col];
      if (typeof value === "string" && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.test(value)) {
        formulaErrors.push(`${name}!${columnName(col)}${row + 1}: ${value}`);
      }
      if (typeof formula === "string" && /Assumptions!\$?F\$?1[45](?!\d)/i.test(formula)) {
        legacyReferences.push(`${name}!${columnName(col)}${row + 1}: ${formula}`);
      }
    }
  }
}

const headlineCells = [
  "C7", "C8", "C9", "C14", "C18", "C30", "C61", "C62", "C66",
  "D7", "D8", "D9", "D14", "D18", "D30", "D61", "D62", "D66",
  "E7", "E8", "E9", "E14", "E18", "E30", "E61", "E62", "E66",
  "F7", "F8", "F9", "F14", "F18", "F30", "F61", "F62", "F66",
  "G7", "G8", "G9", "G14", "G18", "G30", "G61", "G62", "G66",
].map((address) => cell("P&L_5yr", address));

const tierCells = [
  "B8", "C8", "D8", "E8", "E9", "E12",
  "F8", "G8", "H8", "I8", "I9", "I12",
  "J8", "K8", "L8", "M8", "M9", "M12",
  "N8", "O8", "P8", "Q8", "Q9", "Q12",
  "R8", "S8", "T8", "U8", "U9", "U12",
].map((address) => cell("Tier_Economics", address));

const checkCells = ["B4", "F21", "F22", "F23", "F24", "F25"].map((address) => cell("Model_Checks", address));
const scenarioCells = ["H8", "H9", "H10", "H19", "I9", "I10", "I19", "L9", "L10", "L19"].map((address) => cell("Scenario_Engine", address));

const audit = {
  workbook: inputPath,
  sheets: names,
  formulaErrorCount: formulaErrors.length,
  formulaErrors,
  legacyReferenceCount: legacyReferences.length,
  legacyReferences,
  assumptions: ["F170", "F171", "F172", "F173", "F174", "F175"].map((address) => cell("Assumptions", address)),
  headlineCells,
  tierCells,
  scenarioCells,
  checkCells,
};

await fs.mkdir(renderDir, { recursive: true });
for (const name of names) {
  const safe = name.replace(/[^a-z0-9_-]+/gi, "_");
  const image = await workbook.render({ sheetName: name, autoCrop: "all", scale: 0.7, format: "png" });
  await fs.writeFile(path.join(renderDir, `${safe}.png`), new Uint8Array(await image.arrayBuffer()));
}

await fs.writeFile(auditPath, JSON.stringify(audit, null, 2), "utf8");
console.log(`audit=${auditPath}`);
console.log(`sheets=${names.length} formulaErrors=${formulaErrors.length} legacyReferences=${legacyReferences.length}`);
console.log(`overallCheck=${checkCells[0].value}`);

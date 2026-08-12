import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-11_Churn_Client_Funds.xlsx";
const renderDir = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/churn-client-funds-rendered";
const auditPath = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/churn-client-funds-audit.json";

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
  return {
    address: `${sheetName}!${address}`,
    value: range.values[0][0],
    formula: range.formulas[0][0],
  };
}

function rangeData(sheetName, address) {
  const range = workbook.worksheets.getItem(sheetName).getRange(address);
  return { address: `${sheetName}!${address}`, values: range.values, formulas: range.formulas };
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
for (const name of names) {
  const sheet = workbook.worksheets.getItem(name);
  const used = sheet.getUsedRange();
  if (!used) continue;
  const values = used.values;
  for (let row = 0; row < values.length; row += 1) {
    for (let col = 0; col < values[row].length; col += 1) {
      const value = values[row][col];
      if (typeof value === "string" && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.test(value)) {
        formulaErrors.push(`${name}!${columnName(col)}${row + 1}: ${value}`);
      }
    }
  }
}

const checks = ["B4", "F26", "F27", "F28", "F29"].map((address) => cell("Model_Checks", address));
const audit = {
  workbook: inputPath,
  sheetCount: names.length,
  sheets: names,
  formulaErrorCount: formulaErrors.length,
  formulaErrors,
  assumptions: rangeData("Assumptions", "B177:H181"),
  customerBridge: rangeData("P&L_5yr", "B76:H85"),
  clientFundsMemo: rangeData("Client_Funds_Memo", "A4:H22"),
  readmeResolutions: rangeData("README", "B88:B91"),
  cashFlowLabel: cell("Cash_Flow_Statement", "A18"),
  modelChecks: checks,
};

await fs.mkdir(renderDir, { recursive: true });
for (const name of names) {
  const safe = name.replace(/[^a-z0-9_-]+/gi, "_");
  const image = await workbook.render({ sheetName: name, autoCrop: "all", scale: 0.75, format: "png" });
  await fs.writeFile(path.join(renderDir, `${safe}.png`), new Uint8Array(await image.arrayBuffer()));
}

await fs.writeFile(auditPath, JSON.stringify(audit, null, 2), "utf8");
console.log(`audit=${auditPath}`);
console.log(`sheets=${names.length}`);
console.log(`formulaErrors=${formulaErrors.length}`);
console.log(`overallCheck=${checks[0].value}`);
console.log(`newChecks=${checks.slice(1).map((item) => item.value).join(",")}`);
console.log(`clientFundsYear1=${cell("Client_Funds_Memo", "B8").value}`);
console.log(`clientFundsYear5=${cell("Client_Funds_Memo", "F8").value}`);
console.log(`sourceCurrencyFormat=${JSON.stringify(workbook.worksheets.getItem("P&L_5yr").getRange("C9").format.numberFormat)}`);
console.log(`memoCurrencyFormat=${JSON.stringify(workbook.worksheets.getItem("Client_Funds_Memo").getRange("B8").format.numberFormat)}`);

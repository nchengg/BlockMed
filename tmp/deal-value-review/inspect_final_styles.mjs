import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/BlockMed/outputs/deal-value-update-2026-08-11/Blockmediary_Financial_Model_Detailed_2026-08-11.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));

for (const [sheetId, range] of [
  ["P&L_5yr", "C8:G9"],
  ["Sensitivity", "D27:F35"],
  ["Tier_Economics", "B8:D8"],
]) {
  const result = await workbook.inspect({ kind: "computedStyle", sheetId, range, maxChars: 20000 });
  console.log(`===== ${sheetId}!${range} =====`);
  console.log(result.ndjson);
}

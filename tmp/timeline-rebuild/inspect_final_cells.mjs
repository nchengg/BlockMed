import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const source = "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/Blockmediary_Financial_Model_Detailed_2026-08-12.parallel-timeline.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
for (const [sheetName, address] of [
  ["Model Checks", "A39:G46"],
  ["Launch Readiness", "D12:I16"],
  ["Launch Readiness", "A19:I23"],
  ["Launch Readiness", "A48:E59"],
]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  console.log(JSON.stringify({ sheetName, address, values: sheet.getRange(address).values, formulas: sheet.getRange(address).formulas }, null, 2));
}
const cash = workbook.worksheets.getItem("Cash Flow Statement");
const cashValues = cash.getRange("B14:BI19").values;
const monthlyDiffs = [];
for (let c = 0; c < 60; c += 1) {
  const expected = cashValues[0][c] + cashValues[1][c] + cashValues[2][c] + cashValues[3][c] + cashValues[4][c];
  const diff = cashValues[5][c] - expected;
  if (Math.abs(diff) > 0.001) monthlyDiffs.push({ month: c + 1, actual: cashValues[5][c], expected, diff });
}
console.log(JSON.stringify({ monthlyDiffs, totalDiff: monthlyDiffs.reduce((sum, item) => sum + item.diff, 0) }, null, 2));

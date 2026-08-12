import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load("C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/Blockmediary_Financial_Model_Detailed_2026-08-12.parallel-timeline.xlsx"));
const values = workbook.worksheets.getItem("Cash Flow Statement").getRange("B14:BI19").values;
const diffs = [];
for (let c = 0; c < 60; c += 1) {
  const expected = values[0][c] + values[1][c] + values[2][c] + values[3][c] + values[4][c];
  const diff = values[5][c] - expected;
  if (Math.abs(diff) > 0.001) diffs.push({ month: c + 1, actual: values[5][c], expected, diff });
}
console.log(JSON.stringify(diffs));

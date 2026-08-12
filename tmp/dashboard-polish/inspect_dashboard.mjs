import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:\\Users\\cwbec\\BlockMed\\financial-projections\\Blockmediary_Financial_Model_Detailed_2026-08-12.xlsx";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(inputPath));
const dashboard = workbook.worksheets.getItem("Dashboard");

const inspectRanges = [];
for (const address of ["B2:O14", "J23:N33", "R9:W28", "R30:AA40", "B56:M77"]) {
  const values = dashboard.getRange(address).values;
  const formulas = dashboard.getRange(address).formulas;
  inspectRanges.push({ address, values, formulas });
}

const styles = [];
for (const address of ["B2:O6", "B9:O14", "J25:N28", "R9:W12", "R30:AA35"]) {
  const result = await workbook.inspect({
    kind: "computedStyle",
    sheetId: "Dashboard",
    range: address,
    maxChars: 6000,
  });
  styles.push({ address, ndjson: result.ndjson });
}

const charts = dashboard.charts.items.map((chart, index) => ({
  index,
  name: chart.name,
  type: chart.type,
  title: chart.title,
  hasLegend: chart.hasLegend,
  series: chart.series.items.map((series) => ({
    name: series.name,
    formula: series.formula,
    categoryFormula: series.categoryFormula,
  })),
}));

const sheets = [];
for (let i = 0; i < 30; i += 1) {
  try {
    const sheet = workbook.worksheets.getItemAt(i);
    sheets.push(sheet.name);
  } catch {
    break;
  }
}

console.log(JSON.stringify({ sheets, charts, inspectRanges, styles }, null, 2));

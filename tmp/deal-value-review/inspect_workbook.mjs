import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/cwbec/Downloads/Blockmediary_Deal_Value_Model.xlsx";
const outputDir = "C:/Users/cwbec/BlockMed/tmp/deal-value-review/rendered";
await fs.mkdir(outputDir, { recursive: true });

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheets = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 12000,
});
console.log("SHEETS");
console.log(sheets.ndjson);

const overview = await workbook.inspect({
  kind: "workbook,table,region",
  maxChars: 30000,
  tableMaxRows: 20,
  tableMaxCols: 15,
  tableMaxCellChars: 160,
});
console.log("OVERVIEW");
console.log(overview.ndjson);

const names = [];
for (const line of sheets.ndjson.split(/\r?\n/)) {
  if (!line.trim()) continue;
  try {
    const item = JSON.parse(line);
    if (item.name) names.push(item.name);
  } catch {}
}

for (const name of names) {
  const safe = name.replace(/[^a-z0-9_-]+/gi, "_");
  const rendered = await workbook.render({
    sheetName: name,
    autoCrop: "all",
    scale: 1,
    format: "png",
  });
  await fs.writeFile(path.join(outputDir, `${safe}.png`), new Uint8Array(await rendered.arrayBuffer()));
}

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!",
  options: { useRegex: true, maxResults: 300 },
  summary: "formula error scan",
  maxChars: 12000,
});
console.log("ERRORS");
console.log(errors.ndjson);

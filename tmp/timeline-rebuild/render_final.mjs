import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/Blockmediary_Financial_Model_Detailed_2026-08-12.parallel-timeline.xlsx";
const outDir = "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/final-renders";
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
await fs.mkdir(outDir, { recursive: true });

for (let i = 0; i < 15; i += 1) {
  const sheetName = workbook.worksheets.getItemAt(i).name;
  const rendered = await workbook.render({ sheetName, autoCrop: "all", scale: 0.8, format: "png" });
  const safe = `${String(i + 1).padStart(2, "0")}-${sheetName.replaceAll(" ", "-").replaceAll("&", "and")}`;
  await fs.writeFile(`${outDir}/${safe}.png`, new Uint8Array(await rendered.arrayBuffer()));
}
console.log("rendered=15");

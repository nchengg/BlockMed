import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const models = [
  {
    label: "detailed",
    input: "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Detailed_2026-08-09.xlsx",
  },
  {
    label: "executive",
    input: "C:/Users/cwbec/BlockMed/financial-projections/financial-model-2026-08-09/Blockmediary_Financial_Model_Executive_2026-08-09.xlsx",
  },
];

for (const model of models) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(model.input));
  const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 20000 });
  const names = [];
  for (const line of sheetInfo.ndjson.split(/\r?\n/)) {
    try {
      const item = JSON.parse(line);
      if (item.name) names.push(item.name);
    } catch {}
  }
  const outDir = `C:/Users/cwbec/BlockMed/tmp/deal-value-review/source-rendered/${model.label}`;
  await fs.mkdir(outDir, { recursive: true });
  for (const name of names) {
    const safe = name.replace(/[^a-z0-9_-]+/gi, "_");
    const image = await workbook.render({ sheetName: name, autoCrop: "all", scale: 0.7, format: "png" });
    await fs.writeFile(path.join(outDir, `${safe}.png`), new Uint8Array(await image.arrayBuffer()));
  }

  const sensitivity = workbook.worksheets.getItem("Sensitivity");
  const audit = [];
  audit.push(`===== ${model.label} Sensitivity values =====\n${JSON.stringify(sensitivity.getRange("A1:I23").values)}`);
  audit.push(`===== ${model.label} Sensitivity formulas =====\n${JSON.stringify(sensitivity.getRange("A1:I23").formulas)}`);

  const styles = await workbook.inspect({
    kind: "computedStyle",
    sheetId: "Assumptions",
    range: "A63:H78",
    maxChars: 12000,
  });
  audit.push(`===== ${model.label} Assumption styles =====\n${styles.ndjson}`);
  await fs.writeFile(`C:/Users/cwbec/BlockMed/tmp/deal-value-review/${model.label}-source-audit.txt`, audit.join("\n"), "utf8");
  console.log(`rendered ${model.label}: ${names.length} sheets`);
}

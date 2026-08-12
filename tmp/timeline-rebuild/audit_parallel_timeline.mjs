import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const paths = {
  before: "C:/Users/cwbec/BlockMed/financial-projections/Blockmediary_Financial_Model_Detailed_2026-08-12.bak-before-parallel-timeline.xlsx",
  pass1: "C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/pass1-parallel-timeline.xlsx",
  final: "C:/Users/cwbec/BlockMed/financial-projections/Blockmediary_Financial_Model_Detailed_2026-08-12.xlsx",
};

async function load(path) {
  return SpreadsheetFile.importXlsx(await FileBlob.load(path));
}

const before = await load(paths.before);
const pass1 = await load(paths.pass1);
const final = await load(paths.final);

function getValue(wb, sheet, address) {
  return wb.worksheets.getItem(sheet).getRange(address).values[0][0];
}

function getRow(wb, sheet, address) {
  return wb.worksheets.getItem(sheet).getRange(address).values[0];
}

function compareMatrices(a, b, tolerance = 1e-8) {
  const changed = [];
  for (let r = 0; r < a.length; r += 1) {
    for (let c = 0; c < (a[r]?.length ?? 0); c += 1) {
      const av = a[r][c];
      const bv = b[r]?.[c];
      const equal = typeof av === "number" && typeof bv === "number"
        ? Math.abs(av - bv) <= tolerance
        : av === bv;
      if (!equal) changed.push({ row: r + 1, col: c + 1, before: av, after: bv });
    }
  }
  return changed;
}

const pass1FinancialVsFinal = {};
for (const [sheet, address] of [
  ["Launch Readiness", "B26:F34"],
  ["P&L 5yr", "C7:G66"],
  ["Cash Flow Statement", "B12:BI40"],
  ["Scenario Engine", "B8:R60"],
]) {
  const a = pass1.worksheets.getItem(sheet).getRange(address).values;
  const b = final.worksheets.getItem(sheet).getRange(address).values;
  pass1FinancialVsFinal[`${sheet}!${address}`] = compareMatrices(a, b).slice(0, 20);
}

const assumptionsBefore = before.worksheets.getItem("Assumptions");
const assumptionsFinal = final.worksheets.getItem("Assumptions");
const assumptionValueChanges = compareMatrices(
  assumptionsBefore.getRange("B1:H190").values,
  assumptionsFinal.getRange("B1:H190").values,
).filter((item) => !(item.row === 185 && item.col === 7));
const assumptionFormulaChanges = compareMatrices(
  assumptionsBefore.getRange("B1:H190").formulas,
  assumptionsFinal.getRange("B1:H190").formulas,
);

const timingCases = [];
const launch = final.worksheets.getItem("Launch Readiness");
for (const caseNumber of [1, 2, 3]) {
  launch.getRange("B5").values = [[caseNumber]];
  timingCases.push({
    caseNumber,
    firstPaidPilot: getValue(final, "Launch Readiness", "E6"),
    firstReceipt: getValue(final, "Launch Readiness", "E11"),
    varaIdqStart: getValue(final, "Launch Readiness", "G14"),
    fullSubmissionTarget: getValue(final, "Launch Readiness", `H${20 + caseNumber}`),
    fullVaraLicenceTarget: getValue(final, "Launch Readiness", "E14"),
    revenueActiveMonths: getRow(final, "Launch Readiness", "B26:F26"),
    prePilotPartnerMonths: getRow(final, "Launch Readiness", "B29:F29"),
    varaOperatingMonths: getRow(final, "Launch Readiness", "B31:F31"),
    varaApplicationFeeTiming: getRow(final, "Launch Readiness", "B33:F33"),
    partnerFeeFactor: getRow(final, "Launch Readiness", "B34:F34"),
    fundingNeed: getValue(final, "Launch Readiness", "E12"),
  });
}
launch.getRange("B5").values = [[2]];

const formulaErrors = await final.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});

const statuses = final.worksheets.getItem("Model Checks").getRange("F7:F46").values.flat();
const failures = statuses.map((status, index) => ({ row: index + 7, status })).filter((item) => item.status === "FAIL");

const report = {
  modelStatus: getValue(final, "Model Checks", "B4"),
  failures,
  formulaErrors: formulaErrors.ndjson,
  assumptionValueChangesExcludingNoteH185: assumptionValueChanges,
  assumptionFormulaChanges,
  pass1FinancialVsFinal,
  timingCases,
  baseCase: {
    fundingNeedBefore: getValue(before, "Launch Readiness", "E12"),
    fundingNeedAfter: getValue(final, "Launch Readiness", "E12"),
    firstPaidPilot: getValue(final, "Launch Readiness", "E6"),
    firstReceipt: getValue(final, "Launch Readiness", "E11"),
    fullVaraLicenceTarget: getValue(final, "Launch Readiness", "E14"),
    varaIdqStart: getValue(final, "Launch Readiness", "G14"),
    fullSubmissionTarget: getValue(final, "Launch Readiness", "H22"),
    year1RevenueBefore: getValue(before, "P&L 5yr", "C18"),
    year1RevenueAfter: getValue(final, "P&L 5yr", "C18"),
    year5RevenueBefore: getValue(before, "P&L 5yr", "G18"),
    year5RevenueAfter: getValue(final, "P&L 5yr", "G18"),
    year1OneOffBefore: getValue(before, "P&L 5yr", "C58"),
    year1OneOffAfter: getValue(final, "P&L 5yr", "C58"),
    year1ComplianceBefore: getValue(before, "P&L 5yr", "C52"),
    year1ComplianceAfter: getValue(final, "P&L 5yr", "C52"),
    year2ComplianceBefore: getValue(before, "P&L 5yr", "D52"),
    year2ComplianceAfter: getValue(final, "P&L 5yr", "D52"),
    applicationFeeMonth1Cash: getValue(final, "Cash Flow Statement", "B17"),
    restrictedCapitalFundingMonth17: getValue(final, "Cash Flow Statement", "R26"),
    restrictedCapitalPlacementMonth17: getValue(final, "Cash Flow Statement", "R27"),
    fullLicenceMonth18FixedOpexCash: getValue(final, "Cash Flow Statement", "S16"),
    firstReceiptMonth13: getValue(final, "Cash Flow Statement", "N12"),
    modelCheck39: getRow(final, "Model Checks", "B39:G39"),
  },
};

await fs.writeFile("C:/Users/cwbec/BlockMed/tmp/timeline-rebuild/audit-report.json", JSON.stringify(report, null, 2), "utf8");
console.log(JSON.stringify({
  modelStatus: report.modelStatus,
  failureCount: report.failures.length,
  formulaErrors: report.formulaErrors,
  nonNoteAssumptionValueChanges: report.assumptionValueChangesExcludingNoteH185.length,
  assumptionFormulaChanges: report.assumptionFormulaChanges.length,
  timingCases: report.timingCases.map(({ caseNumber, firstPaidPilot, firstReceipt, varaIdqStart, fullSubmissionTarget, fullVaraLicenceTarget, varaOperatingMonths }) => ({
    caseNumber, firstPaidPilot, firstReceipt, varaIdqStart, fullSubmissionTarget, fullVaraLicenceTarget, varaOperatingMonths,
  })),
  baseCase: report.baseCase,
}, null, 2));

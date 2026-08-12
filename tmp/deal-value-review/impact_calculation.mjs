const years = [1, 2, 3, 4, 5];
const deals = [60, 1500, 6000, 15000, 30000];
const currentValues = [25000, 33750, 45563, 61510, 83039];
const tierValues = {
  A: years.map((_, i) => 35000 * 1.10 ** i),
  B: years.map((_, i) => 30000 * 1.08 ** i),
  C: years.map((_, i) => 30000 * 1.05 ** i),
};
const mix = {
  A: [0.15, 0.30, 0.45, 0.60, 0.70],
  B: [0.45, 0.45, 0.40, 0.32, 0.25],
  C: [0.40, 0.25, 0.15, 0.08, 0.05],
};
const pricing = {
  A: { rate: 0.0065, min: 150, doc: 25, disputeRate: 0.04, disputeFee: 100, cogs: 3 + 3 + 2 + 0.04 * 60 },
  B: { rate: 0.0090, min: 250, doc: 90, disputeRate: 0.10, disputeFee: 200, cogs: 10 + 20 + 6 + 0.10 * 120 },
  C: { rate: 0.0200, min: 500, doc: 300, disputeRate: 0.20, disputeFee: 500, cogs: 150 + 120 + 20 + 0.20 * 350 },
};

function portfolio(yearIndex, valuesByTier) {
  let gmv = 0;
  let escrowRevenue = 0;
  let tierRevenue = 0;
  let tierCogs = 0;
  for (const tier of ["A", "B", "C"]) {
    const tierDeals = deals[yearIndex] * mix[tier][yearIndex];
    const value = valuesByTier[tier][yearIndex];
    const p = pricing[tier];
    gmv += tierDeals * value;
    const escrowPerDeal = Math.max(value * p.rate, p.min);
    escrowRevenue += tierDeals * escrowPerDeal;
    tierRevenue += tierDeals * (escrowPerDeal + p.doc + p.disputeRate * p.disputeFee);
    tierCogs += tierDeals * p.cogs;
  }
  return {
    blendedValue: gmv / deals[yearIndex],
    gmv,
    escrowRevenue,
    tierRevenue,
    tierCogs,
    grossProfit: tierRevenue - tierCogs,
    grossMargin: (tierRevenue - tierCogs) / tierRevenue,
  };
}

const currentByTier = {
  A: currentValues,
  B: currentValues,
  C: currentValues,
};

console.log("year\tblended_new\tblended_old\tgmv_new\tgmv_old\tgmv_change\tescrow_new\tescrow_old\tescrow_change\ttier_gm_new\ttier_gm_old");
const currentDocRevenue = [9855, 184500, 553500, 1017000, 1650000];
const currentDisputeRevenue = [2976, 52800, 148800, 252000, 384000];
const currentAddonRevenue = [2548, 92233, 265059, 499289, 871066];
const currentDiscountDrag = [-3369, -65897, -135621, -225511, -364334];
const currentOpReserve = [356, 8864, 35713, 95001, 223362];
const currentPartnerCommission = [0, 13296, 53569, 142501, 335043];
const currentCogs = [12765.6859375, 245833.5078125, 735895.5625, 1384309.375, 2392328.53125];
const payroll = [483950, 797900, 1015250, 1232600, 1449950];
const fixedOpex = [285183.333333333, 344180, 416380, 503100, 594740];
const activeCustomers = [20, 375, 1000, 1875, 3000];
const impactRows = [];
for (let i = 0; i < years.length; i++) {
  const revised = portfolio(i, tierValues);
  const current = portfolio(i, currentByTier);
  const pct = (a, b) => a / b - 1;
  console.log([
    years[i],
    revised.blendedValue.toFixed(2),
    current.blendedValue.toFixed(2),
    revised.gmv.toFixed(0),
    current.gmv.toFixed(0),
    (pct(revised.gmv, current.gmv) * 100).toFixed(1) + "%",
    revised.escrowRevenue.toFixed(0),
    current.escrowRevenue.toFixed(0),
    (pct(revised.escrowRevenue, current.escrowRevenue) * 100).toFixed(1) + "%",
    (revised.grossMargin * 100).toFixed(1) + "%",
    (current.grossMargin * 100).toFixed(1) + "%",
  ].join("\t"));

  const newCustomers = i === 0 ? activeCustomers[i] : activeCustomers[i] - activeCustomers[i - 1];
  const newDiscountDrag = -Math.round(newCustomers * (revised.escrowRevenue / deals[i]) * 0.5);
  const otherAddons = currentAddonRevenue[i] - currentDiscountDrag[i];
  const newAddonRevenue = otherAddons + newDiscountDrag;
  const newTotalRevenue = revised.escrowRevenue + currentDocRevenue[i] + currentDisputeRevenue[i] + newAddonRevenue;
  const newOpReserve = Math.round(newTotalRevenue * 0.01);
  const newPartnerCommission = i === 0 ? 0 : Math.round(newTotalRevenue * 0.30 * 0.05);
  const newCogs = currentCogs[i] - currentOpReserve[i] - currentPartnerCommission[i] + newOpReserve + newPartnerCommission;
  const newGrossProfit = newTotalRevenue - newCogs;
  const newEbitda = newGrossProfit - payroll[i] - fixedOpex[i];
  impactRows.push({
    year: years[i],
    newDiscountDrag,
    newTotalRevenue,
    newCogs,
    newGrossProfit,
    newGrossMargin: newGrossProfit / newTotalRevenue,
    newEbitda,
  });
}

console.log("\nfull-model approximation before above-cap review cost; unchanged non-value drivers");
console.log("year\tdiscount_drag\ttotal_revenue\ttotal_cogs\tgross_profit\tgross_margin\tebitda");
for (const row of impactRows) {
  console.log([
    row.year,
    row.newDiscountDrag,
    row.newTotalRevenue.toFixed(0),
    row.newCogs.toFixed(0),
    row.newGrossProfit.toFixed(0),
    (row.newGrossMargin * 100).toFixed(1) + "%",
    row.newEbitda.toFixed(0),
  ].join("\t"));
}

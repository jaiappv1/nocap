// Commission calculation engine for the Policy Fact-check tool.
// All values in INR. Rates are industry-typical mid-points based on IRDAI
// disclosures and public research; final numbers are transparent estimates,
// not exact figures from any specific insurer.

export type ProductType =
  | "term"
  | "endowment"
  | "ulip"
  | "moneyback"
  | "annuity"
  | "health"
  | "critical_illness"
  | "mutual_fund";

export const PRODUCT_LABELS: Record<ProductType, string> = {
  term: "Term Insurance",
  endowment: "Endowment / Traditional",
  ulip: "ULIP",
  moneyback: "Money Back",
  annuity: "Annuity (lump-sum)",
  health: "Health Insurance",
  critical_illness: "Critical Illness",
  mutual_fund: "Mutual Fund (Regular plan)",
};

export type Policy = {
  id: string;
  nickname: string;
  type: ProductType;
  insurer: string;
  intermediary?: string;
  // Annual premium for insurance; annual SIP total for MF; lump-sum for annuity.
  premium: number;
  years: number;
  // ULIP / MF specific
  expenseRatio?: number; // %
  assumedReturn?: number; // % (for AMC estimation)
  // MF specific
  isDirect?: boolean;
};

export type YearRow = {
  year: number;
  premium: number;
  rate: number; // fraction
  commission: number;
};

export type CommissionResult = {
  totalPremium: number;
  agentCommission: number;
  entryLoads: number;
  amcCharges: number;
  totalCost: number;
  costPct: number; // total cost as % of total premium
  yearBreakdown: YearRow[];
  transparencyScore: number; // 0-10
  transparencyBand: "opaque" | "somewhat" | "transparent";
  whatYouKnow: string[];
  whatYouDont: string[];
  vsDirect?: { directCost: number; extraPaid: number };
  recommendation: string;
  // If the money that leaked to costs had been invested each year at
  // `growthRate` instead, this is what it would have grown to by the end.
  opportunityCost: number;
  growthRate: number; // fraction, e.g. 0.10
  // Populated only when policy.type === "mutual_fund"
  mfDetails?: MutualFundBreakdown;
};

export type MutualFundBreakdown = {
  isDirect: boolean;
  years: number;
  totalInvested: number;
  assumedReturnPct: number;
  effectiveErPct: number;   // ER on the plan the user actually holds
  directErPct: number;      // baseline direct-plan ER for comparison
  regularErPct: number;     // baseline regular-plan ER for comparison
  yourCorpus: number;       // final AUM on the plan they hold
  directCorpus: number;     // final AUM had they picked Direct
  regularCorpus: number;    // final AUM had they picked Regular
  corpusDelta: number;      // directCorpus - yourCorpus (extra you'd have had)
  totalErCharged: number;   // total rupees charged as ER over the years
  mfdCommission: number;    // MFD share of ER (~40% for regular; 0 for direct)
  amcRetained: number;      // AMC share of ER (~60% for regular; 100% for direct)
  mfdSharePct: number;      // 40
  amcSharePct: number;      // 60
};

// Commission bands (year 1, 2-5, 6-10, 11+). Uses mid-points.
const BANDS: Record<
  Exclude<ProductType, "annuity" | "mutual_fund">,
  [number, number, number, number]
> = {
  term:             [0.42, 0.10, 0.02, 0.00],
  endowment:        [0.75, 0.12, 0.07, 0.03],
  ulip:             [0.40, 0.08, 0.03, 0.01],
  moneyback:        [0.50, 0.12, 0.08, 0.03],
  health:           [0.15, 0.07, 0.02, 0.00],
  critical_illness: [0.30, 0.12, 0.08, 0.03],
};

function rateForYear(bands: [number, number, number, number], year: number) {
  if (year === 1) return bands[0];
  if (year <= 5) return bands[1];
  if (year <= 10) return bands[2];
  return bands[3];
}

function makeEmpty(): CommissionResult {
  return {
    totalPremium: 0,
    agentCommission: 0,
    entryLoads: 0,
    amcCharges: 0,
    totalCost: 0,
    costPct: 0,
    yearBreakdown: [],
    transparencyScore: 5,
    transparencyBand: "somewhat",
    whatYouKnow: [],
    whatYouDont: [],
    recommendation: "",
    opportunityCost: 0,
    growthRate: 0.10,
  };
}

// Given a total cost bled out evenly across `years` and reinvested at `rate`
// per year (end-of-year contributions), what would it have grown to today?
export function opportunityCostOf(totalCost: number, years: number, rate = 0.10): number {
  if (totalCost <= 0 || years <= 0) return 0;
  const c = totalCost / years;
  // Future value of an ordinary annuity: C * ((1+r)^n - 1) / r
  return c * ((Math.pow(1 + rate, years) - 1) / rate);
}

export function analyze(policy: Policy): CommissionResult {
  const p = Math.max(0, policy.premium || 0);
  const y = Math.max(1, Math.floor(policy.years || 1));
  const r = makeEmpty();

  if (policy.type === "annuity") {
    // One-time premium, small initial + tiny trail
    const initial = p * 0.02;
    const trail = p * 0.005 * y;
    r.totalPremium = p;
    r.agentCommission = initial + trail;
    r.totalCost = r.agentCommission;
    r.costPct = p ? (r.totalCost / p) * 100 : 0;
    r.yearBreakdown = [
      { year: 1, premium: p, rate: 0.02, commission: initial },
      ...Array.from({ length: y - 1 }, (_, i) => ({
        year: i + 2,
        premium: 0,
        rate: 0.005,
        commission: p * 0.005,
      })),
    ];
    r.transparencyScore = 6;
    r.transparencyBand = "somewhat";
    r.whatYouKnow = [`One-time premium: ${inr(p)}`, `Monthly / annual payouts over ${y}+ years`];
    r.whatYouDont = [
      `Initial commission (~2%): ${inr(initial)}`,
      `Trail commission over ${y} yrs: ${inr(trail)}`,
      "Insurer margin also comes from mortality assumptions, not just from your lump sum.",
    ];
    r.recommendation =
      "Annuities suit guaranteed retirement income needs. Compare payout rates across LIC, HDFC Life, ICICI Pru before locking in — differences of 0.5–1% p.a. compound heavily.";
    r.opportunityCost = opportunityCostOf(r.totalCost, y, r.growthRate);
    return r;
  }

  if (policy.type === "mutual_fund") {
    return analyzeMutualFund(policy, r);
  }

  // Regular insurance path
  const bands = BANDS[policy.type];
  let commissionTotal = 0;
  const rows: YearRow[] = [];
  for (let i = 1; i <= y; i++) {
    const rate = rateForYear(bands, i);
    const c = p * rate;
    commissionTotal += c;
    rows.push({ year: i, premium: p, rate, commission: c });
  }
  const totalPrem = p * y;
  r.totalPremium = totalPrem;
  r.agentCommission = commissionTotal;
  r.yearBreakdown = rows;

  if (policy.type === "ulip") {
    const entry = totalPrem * 0.01; // 1% each year
    const er = policy.expenseRatio ?? 1.25;
    const ret = (policy.assumedReturn ?? 8) / 100;
    let fv = 0;
    let amc = 0;
    for (let i = 1; i <= y; i++) {
      // premium invested after loads/charges — approximate
      fv = (fv + p * 0.85) * (1 + ret);
      amc += fv * (er / 100);
    }
    r.entryLoads = entry;
    r.amcCharges = amc;
    r.totalCost = commissionTotal + entry + amc;
    r.costPct = (r.totalCost / totalPrem) * 100;
    r.transparencyScore = 2;
    r.transparencyBand = "opaque";
    r.whatYouKnow = [`Annual premium ${inr(p)} × ${y} yrs`, "You have a fund value that fluctuates"];
    r.whatYouDont = [
      `Agent commission: ${inr(commissionTotal)} (${(commissionTotal / totalPrem * 100).toFixed(1)}% of premiums)`,
      `Premium allocation + admin loads: ~${inr(entry)}`,
      `Fund management charges over ${y} yrs: ~${inr(amc)}`,
      `Every ₹100 you paid, ~₹${r.costPct.toFixed(1)} went to costs — not investment.`,
    ];
    r.recommendation =
      "For pure equity growth, ULIPs are almost never the cheapest route. Keep it only if the life-cover component is genuinely needed — else pair a term plan with a Direct-plan index fund and save 5–10% of every rupee.";
    r.opportunityCost = opportunityCostOf(r.totalCost, y, r.growthRate);
    return r;
  }

  r.totalCost = commissionTotal;
  r.costPct = totalPrem ? (commissionTotal / totalPrem) * 100 : 0;

  switch (policy.type) {
    case "term":
      r.transparencyScore = 5;
      r.transparencyBand = "somewhat";
      r.whatYouKnow = [`Annual premium: ${inr(p)}`, `Duration: ${y} years`];
      r.whatYouDont = [
        `Year-1 commission (~${(bands[0] * 100).toFixed(0)}%): ${inr(p * bands[0])}`,
        `Total agent earnings across ${y} yrs: ${inr(commissionTotal)}`,
        "Commission drops to near-zero after year 10 — buying online direct saves this.",
      ];
      r.recommendation =
        "Term is the right product. Next renewal, buy directly from the insurer's website — same policy, lower premium (no distributor cut).";
      break;
    case "endowment":
      r.transparencyScore = 2;
      r.transparencyBand = "opaque";
      r.whatYouKnow = [`Annual premium: ${inr(p)}`, "You'll get a maturity amount + possible bonuses"];
      r.whatYouDont = [
        `Year-1 commission alone: ${inr(p * bands[0])} (~${(bands[0] * 100).toFixed(0)}% of premium)`,
        `Total commission over ${y} yrs: ${inr(commissionTotal)}`,
        "Effective IRR on endowments is typically 4–5.5% — barely beats FD, well below equity + term combo.",
      ];
      r.recommendation =
        "Endowment mixes insurance and savings, and does both poorly. Consider term + PPF/index fund — same money, materially higher outcome. Surrender math is worth checking.";
      break;
    case "moneyback":
      r.transparencyScore = 3;
      r.transparencyBand = "opaque";
      r.whatYouKnow = [`Annual premium: ${inr(p)}`, "You get periodic pay-backs during the term"];
      r.whatYouDont = [
        `Total agent commission: ${inr(commissionTotal)}`,
        "The periodic 'money-back' is a slice of your own premium returned to you — not a bonus.",
      ];
      r.recommendation =
        "Same as endowment: separate insurance from investment. Term plan + your own SIP will outperform any money-back structure.";
      break;
    case "health":
      r.transparencyScore = 6;
      r.transparencyBand = "somewhat";
      r.whatYouKnow = [`Annual premium: ${inr(p)}`, "Covers hospitalisation up to sum insured"];
      r.whatYouDont = [
        `Agent commission over ${y} yrs: ${inr(commissionTotal)}`,
        "Buying via the insurer's own website usually gets the same policy at same or lower premium.",
      ];
      r.recommendation =
        "Health cover is essential. At renewal, quote direct on the insurer site — commission on renewals still averages 5–7%.";
      break;
    case "critical_illness":
      r.transparencyScore = 4;
      r.transparencyBand = "somewhat";
      r.whatYouKnow = [`Annual premium: ${inr(p)}`, "Lump-sum payout on diagnosis of listed illnesses"];
      r.whatYouDont = [
        `Year-1 commission (~${(bands[0] * 100).toFixed(0)}%): ${inr(p * bands[0])}`,
        `Total commission: ${inr(commissionTotal)}`,
        "Definitions of covered illnesses vary wildly across insurers — the cheapest is not always the best.",
      ];
      r.recommendation =
        "Consider a CI rider on your term plan, or a super-topup health cover — often better cost-per-lakh than standalone CI.";
      break;
  }
  r.opportunityCost = opportunityCostOf(r.totalCost, y, r.growthRate);
  return r;
}

/**
 * Mutual-fund analyser.
 *
 * Model: annual SIP `p` at end of each year, growing at `assumedReturn` before
 * the annual expense-ratio (ER) drag is deducted from NAV.
 *
 * ER split (industry standard for equity funds):
 *   Regular plan → ~40% of ER paid to the MFD (distributor), ~60% retained by
 *   the AMC (fund-house running costs).
 *   Direct plan → 0% MFD, 100% AMC.
 *
 * We simulate three parallel worlds:
 *   • Your plan (regular OR direct, whatever you actually hold)
 *   • Regular baseline (~1.75% ER)   → so we can show what regular investors get
 *   • Direct baseline  (~0.75% ER)   → so we can show what you'd have had direct
 */
function analyzeMutualFund(policy: Policy, r: CommissionResult): CommissionResult {
  const p = Math.max(0, policy.premium || 0);
  const y = Math.max(1, Math.floor(policy.years || 1));
  const ret = (policy.assumedReturn ?? 10) / 100;

  const regularErPct = 1.75;
  const directErPct = 0.75;
  const effectiveErPct =
    policy.expenseRatio ?? (policy.isDirect ? directErPct : regularErPct);

  const sim = (erPct: number) => {
    let corpus = 0;
    let totalEr = 0;
    const rows: YearRow[] = [];
    for (let i = 1; i <= y; i++) {
      // SIP contribution at start of year, grows for the year
      corpus = (corpus + p) * (1 + ret);
      // ER charged on year-end AUM, deducted from NAV
      const er = corpus * (erPct / 100);
      corpus -= er;
      totalEr += er;
      rows.push({ year: i, premium: p, rate: erPct / 100, commission: er });
    }
    return { corpus, totalEr, rows };
  };

  const you = sim(effectiveErPct);
  const regular = policy.isDirect || effectiveErPct === regularErPct ? sim(regularErPct) : you;
  const direct = policy.isDirect && effectiveErPct === directErPct ? you : sim(directErPct);

  const totalInvested = p * y;
  const mfdSharePct = 40;
  const amcSharePct = 60;
  const mfdCommission = policy.isDirect ? 0 : you.totalEr * (mfdSharePct / 100);
  const amcRetained = policy.isDirect ? you.totalEr : you.totalEr * (amcSharePct / 100);

  r.totalPremium = totalInvested;
  r.agentCommission = mfdCommission;
  r.amcCharges = amcRetained;
  r.totalCost = you.totalEr;
  r.costPct = totalInvested ? (r.totalCost / totalInvested) * 100 : 0;
  r.yearBreakdown = you.rows;

  const corpusDelta = Math.max(0, direct.corpus - you.corpus);

  r.mfDetails = {
    isDirect: !!policy.isDirect,
    years: y,
    totalInvested,
    assumedReturnPct: ret * 100,
    effectiveErPct,
    directErPct,
    regularErPct,
    yourCorpus: you.corpus,
    directCorpus: direct.corpus,
    regularCorpus: regular.corpus,
    corpusDelta,
    totalErCharged: you.totalEr,
    mfdCommission,
    amcRetained,
    mfdSharePct,
    amcSharePct,
  };

  if (policy.isDirect) {
    r.transparencyScore = 8;
    r.transparencyBand = "transparent";
    r.whatYouKnow = [
      `Total invested over ${y} yrs: ${inr(totalInvested)}`,
      `Direct-plan expense ratio: ${effectiveErPct}% p.a.`,
      "No distributor sits between you and the AMC.",
    ];
    r.whatYouDont = [
      `Even on Direct, the AMC still deducts ~${inr(you.totalEr)} across ${y} yrs from your NAV.`,
    ];
    r.recommendation =
      "You're on the cheapest route. Watch expense-ratio creep and benchmark performance annually.";
  } else {
    r.vsDirect = { directCost: direct.totalEr, extraPaid: you.totalEr - direct.totalEr };
    r.transparencyScore = 2;
    r.transparencyBand = "opaque";
    r.whatYouKnow = [
      `Total invested over ${y} yrs: ${inr(totalInvested)}`,
      "You see a folio number and daily NAV updates.",
    ];
    r.whatYouDont = [
      `Regular-plan ER ~${effectiveErPct}% p.a. → ${inr(you.totalEr)} charged across ${y} yrs.`,
      `Of that, ~${mfdSharePct}% (${inr(mfdCommission)}) is paid to your MFD as trail commission — every year, for as long as you hold.`,
      `The remaining ~${amcSharePct}% (${inr(amcRetained)}) is retained by the AMC to run the fund.`,
      `Same scheme in Direct plan would have grown to ${inr(direct.corpus)} vs your ${inr(you.corpus)} — a ${inr(corpusDelta)} gap.`,
    ];
    r.recommendation = `Switch to the Direct plan of the same scheme (look for "— Direct — Growth" in the name). Same fund, same manager — roughly ${inr(corpusDelta)} more in your pocket over ${y} years.`;
  }

  r.opportunityCost = corpusDelta; // for MF, the "could have saved" IS the corpus gap
  return r;
}

export type Portfolio = {
  policies: Policy[];
};

export type PortfolioSummary = {
  totalPremium: number;
  explicitCommission: number;
  embeddedCost: number;
  totalCost: number;
  costPct: number;
  opportunityCost: number;
  growthRate: number;
  results: { policy: Policy; result: CommissionResult }[];
};

export function analyzePortfolio(portfolio: Portfolio): PortfolioSummary {
  const results = portfolio.policies.map((policy) => ({ policy, result: analyze(policy) }));
  const totalPremium = results.reduce((s, r) => s + r.result.totalPremium, 0);
  const explicitCommission = results.reduce((s, r) => s + r.result.agentCommission, 0);
  const embeddedCost = results.reduce((s, r) => s + r.result.entryLoads + r.result.amcCharges, 0);
  const totalCost = explicitCommission + embeddedCost;
  const opportunityCost = results.reduce((s, r) => s + r.result.opportunityCost, 0);
  return {
    totalPremium,
    explicitCommission,
    embeddedCost,
    totalCost,
    costPct: totalPremium ? (totalCost / totalPremium) * 100 : 0,
    opportunityCost,
    growthRate: 0.10,
    results,
  };
}

export function inr(n: number): string {
  if (!isFinite(n)) return "₹0";
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
}

export function newPolicy(type: ProductType = "term"): Policy {
  return {
    id: Math.random().toString(36).slice(2, 9),
    nickname: "",
    type,
    insurer: "",
    intermediary: "",
    premium: 0,
    years: 5,
    expenseRatio: type === "ulip" ? 1.25 : type === "mutual_fund" ? 1.75 : undefined,
    assumedReturn: type === "mutual_fund" ? 10 : type === "ulip" ? 8 : undefined,
    isDirect: type === "mutual_fund" ? false : undefined,
  };
}

export const INTERMEDIARIES = [
  "Agent",
  "Bank (RM / branch)",
  "Policybazaar",
  "Ditto Insurance",
  "Direct from insurer / AMC",
  "Other",
] as const;

export const INSURERS_LIFE = [
  "LIC",
  "HDFC Life",
  "ICICI Prudential Life",
  "SBI Life",
  "Max Life",
  "Tata AIA Life",
  "Bajaj Allianz Life",
  "Kotak Life",
  "Aditya Birla Sun Life Insurance",
  "PNB MetLife",
  "Canara HSBC Life",
  "Bandhan Life",
];

export const INSURERS_HEALTH = [
  "Star Health",
  "HDFC Ergo Health",
  "ICICI Lombard",
  "Niva Bupa",
  "Care Health",
  "Aditya Birla Health",
  "Manipal Cigna",
  "New India Assurance",
  "National Insurance",
  "Oriental Insurance",
  "United India",
  "Tata AIG",
  "Bajaj Allianz General",
];

export const AMCS = [
  "SBI Mutual Fund",
  "HDFC Mutual Fund",
  "ICICI Prudential MF",
  "Nippon India MF",
  "Kotak Mahindra MF",
  "Aditya Birla Sun Life MF",
  "Axis Mutual Fund",
  "UTI Mutual Fund",
  "DSP Mutual Fund",
  "Mirae Asset MF",
  "Franklin Templeton",
  "Tata Mutual Fund",
  "Edelweiss MF",
  "Parag Parikh MF (PPFAS)",
  "Quant Mutual Fund",
  "Motilal Oswal MF",
  "Bandhan MF",
];

export function providerListForType(type: ProductType): string[] {
  if (type === "mutual_fund") return AMCS;
  if (type === "health" || type === "critical_illness") return INSURERS_HEALTH;
  return INSURERS_LIFE;
}
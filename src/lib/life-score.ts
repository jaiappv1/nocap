// Life Score — Financial Security Scoring Framework (0-10)
// Implements the multi-dimensional scoring described in the product brief.

export type EmploymentType = "salaried" | "self-employed" | "gig" | "business";
export type LiquidityStore = "savings" | "fd" | "liquid_mf" | "mixed";

export interface Assessment {
  // Demographics
  age: number;
  annualIncome: number; // INR
  monthlyExpenses: number; // INR
  spouse: boolean;
  children: number;
  elderlyParents: number;
  employmentType: EmploymentType;

  // Protection
  termAmount: number; // 0 if none
  healthBasic: number; // family basic cover
  healthTopUp: number; // super top-up
  ciAmount: number; // critical illness cover
  ciKind: "none" | "rider" | "standalone" | "both";

  // Emergency
  emergencyFund: number;
  emergencyStore: LiquidityStore;

  // Assets
  propertyValue: number; // total market value
  propertyLoan: number; // total outstanding on property
  liquidMF: number;
  ppf: number;
  nps: number;
  fixedDeposits: number;
  savingsBalance: number;
  otherLiabilities: number; // personal, business, etc.

  // Savings & investment
  monthlySavings: number;
  equityPct: number; // 0-100
  debtPct: number; // 0-100
  usingSIP: boolean;

  // Retirement
  hasNPS: boolean;
  hasEPF: boolean;
  hasPersonalRetirement: boolean;
  monthlyRetContribution: number;

  // Discipline / behaviour (subjective)
  tracksExpenses: boolean;
  hasBudget: boolean;
  debtFreeExceptMortgage: boolean;
  insuranceReviewed: boolean;
  knowsCoverAccurately: boolean;
  hasWrittenPlan: boolean;
}

export const emptyAssessment: Assessment = {
  age: 30,
  annualIncome: 1200000,
  monthlyExpenses: 50000,
  spouse: false,
  children: 0,
  elderlyParents: 0,
  employmentType: "salaried",
  termAmount: 0,
  healthBasic: 0,
  healthTopUp: 0,
  ciAmount: 0,
  ciKind: "none",
  emergencyFund: 0,
  emergencyStore: "savings",
  propertyValue: 0,
  propertyLoan: 0,
  liquidMF: 0,
  ppf: 0,
  nps: 0,
  fixedDeposits: 0,
  savingsBalance: 0,
  otherLiabilities: 0,
  monthlySavings: 0,
  equityPct: 60,
  debtPct: 40,
  usingSIP: false,
  hasNPS: false,
  hasEPF: false,
  hasPersonalRetirement: false,
  monthlyRetContribution: 0,
  tracksExpenses: false,
  hasBudget: false,
  debtFreeExceptMortgage: false,
  insuranceReviewed: false,
  knowsCoverAccurately: false,
  hasWrittenPlan: false,
};

const clamp = (v: number, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, v));

export function scoreTerm(a: Assessment): number {
  const dependents = (a.spouse ? 1 : 0) + a.children + a.elderlyParents;
  const perDep = a.children * 6 + a.elderlyParents * 4 + (a.spouse ? 4 : 0);
  const idealMultiple = 10 + Math.min(5, dependents); // 10-15x
  const ideal = a.annualIncome * idealMultiple + a.annualIncome * perDep;
  if (a.termAmount <= 0) return 0;
  const ratio = a.termAmount / Math.max(1, ideal);
  if (ratio >= 1) return 10;
  if (ratio >= 0.75) return 8;
  if (ratio >= 0.5) return 6;
  if (ratio >= 0.25) return 4;
  return 2;
}

export function scoreHealth(a: Assessment): number {
  if (a.healthBasic <= 0) return 0;
  let s = 5;
  if (a.healthTopUp > 0) s += 3;
  if (a.ciKind !== "none") s += 2;
  if (a.healthBasic < 300000) s -= 1;
  else if (a.healthBasic >= 500000) s += 1;
  if (a.healthTopUp > 0) {
    if (a.healthTopUp < 2000000) s -= 1;
    else if (a.healthTopUp >= 5000000) s += 1;
  }
  return clamp(s);
}

export function scoreCI(a: Assessment): number {
  let s = 2;
  if (a.ciKind === "rider") s = 6;
  else if (a.ciKind === "standalone") s = 7;
  else if (a.ciKind === "both") s = 10;
  if (a.ciAmount >= 2500000) s += 2;
  else if (a.ciAmount >= 1000000) s += 1;
  return clamp(s);
}

export function scoreProtection(a: Assessment): number {
  // Term 50%, Health 25%, CI 25% within Protection layer
  return clamp(scoreTerm(a) * 0.5 + scoreHealth(a) * 0.25 + scoreCI(a) * 0.25);
}

export function idealEmergencyMonths(a: Assessment): number {
  if (a.employmentType === "self-employed" || a.employmentType === "gig") return 12;
  if (!a.spouse && a.children === 0) return 6;
  return 8; // single income family / dependents
}

export function scoreEmergency(a: Assessment): number {
  if (a.monthlyExpenses <= 0) return 0;
  const months = a.emergencyFund / a.monthlyExpenses;
  const ideal = idealEmergencyMonths(a);
  const ratio = months / ideal;
  let s = 0;
  if (ratio >= 1) s = 10;
  else if (ratio >= 0.8) s = 8;
  else if (ratio >= 0.6) s = 7;
  else if (ratio >= 0.4) s = 5;
  else if (ratio >= 0.2) s = 3;
  else if (a.emergencyFund > 0) s = 1;
  if (a.emergencyStore === "savings" || a.emergencyStore === "fd") s += 0.5;
  if (a.emergencyStore === "liquid_mf") s += 0;
  return clamp(s);
}

export function scoreSavingsRate(a: Assessment): number {
  if (a.annualIncome <= 0) return 0;
  const monthlyIncome = a.annualIncome / 12;
  const rate = (a.monthlySavings / monthlyIncome) * 100;
  const adj = a.employmentType === "self-employed" || a.employmentType === "gig" ? 0.8 : 1;
  const r = rate / adj;
  if (r >= 25) return 10;
  if (r >= 20) return 8;
  if (r >= 15) return 7;
  if (r >= 10) return 5;
  if (r > 0) return 2;
  return 0;
}

export function idealEquityForAge(age: number): number {
  if (age < 30) return 80;
  if (age < 40) return 68;
  if (age < 50) return 52;
  if (age < 60) return 38;
  return 25;
}

export function scoreInvestments(a: Assessment): number {
  const ideal = idealEquityForAge(a.age);
  const dev = Math.abs(a.equityPct - ideal);
  let s = 0;
  if (dev <= 5) s = 10;
  else if (dev <= 10) s = 8;
  else if (dev <= 20) s = 6;
  else s = 4;
  if (a.equityPct === 0 || a.equityPct === 100) s = Math.min(s, 4);
  if (a.usingSIP) s += 1;
  return clamp(s);
}

export function scoreSavingsGrowth(a: Assessment): number {
  return clamp(scoreSavingsRate(a) * 0.5 + scoreInvestments(a) * 0.5);
}

export function scoreAssets(a: Assessment): number {
  const netProp = a.propertyValue - a.propertyLoan;
  const liquid = a.savingsBalance + a.fixedDeposits + a.liquidMF;
  const total = netProp + liquid + a.ppf + a.nps;
  if (total <= 0 && a.propertyValue === 0) return 3;
  let s = 5;
  if (netProp > 0 && a.propertyValue > 0) s += 2;
  if (netProp < 0) s -= 3;
  if (a.propertyValue > 0 && liquid > a.monthlyExpenses * 6) s += 1;
  const propRatio = liquid > 0 ? a.propertyValue / liquid : a.propertyValue > 0 ? 99 : 0;
  if (propRatio > 5) s -= 1;
  return clamp(s);
}

export function scoreRetirement(a: Assessment): number {
  let s = 2;
  const schemes = (a.hasNPS ? 1 : 0) + (a.hasEPF ? 1 : 0) + (a.hasPersonalRetirement ? 1 : 0);
  if (schemes === 1) s = 4;
  else if (schemes === 2) s = 6;
  else if (schemes >= 3) s = 8;
  const yearsLeft = Math.max(0, 60 - a.age);
  const monthlyIncome = a.annualIncome / 12;
  const contribRate = monthlyIncome > 0 ? a.monthlyRetContribution / monthlyIncome : 0;
  if (contribRate >= 0.15) s += 2;
  else if (contribRate >= 0.1) s += 1;
  if (a.age >= 50 && schemes === 0) s -= 2;
  if (a.age < 30 && schemes >= 1) s += 1;
  if (yearsLeft < 10 && schemes < 2) s -= 1;
  return clamp(s);
}

export interface Scores {
  categorical: {
    protection: number;
    emergency: number;
    savingsGrowth: number;
    assets: number;
    retirement: number;
  };
  primary: {
    operationalSecurity: number;
    wealthAccumulation: number;
    liquidityFlexibility: number;
  };
  subjective: {
    discipline: number; // 0-5
    knowledge: number; // 0-5
    resilience: number; // 0-5
    futureReadiness: number; // 0-5
    protectionRobustness: number; // 0-5
  };
  metrics: {
    netWorth: number;
    totalLiabilities: number;
    liquidAssets: number;
    mediumTermAssets: number;
    longTermAssets: number;
    loanToAssetRatio: number;
    debtServiceBurden: number;
    propertyToLiquidityRatio: number;
    liquidAssetPct: number;
    monthsCovered: number;
  };
  overallStatus: "financially_secure" | "moderately_secure" | "vulnerable" | "at_risk";
  overall: number; // 0-10 weighted composite
}

export function computeScores(a: Assessment): Scores {
  const protection = scoreProtection(a);
  const emergency = scoreEmergency(a);
  const savingsGrowth = scoreSavingsGrowth(a);
  const assets = scoreAssets(a);
  const retirement = scoreRetirement(a);

  const operationalSecurity = clamp(
    protection * 0.25 + emergency * 0.35 + savingsGrowth * 0.2 + retirement * 0.2,
  );

  const liquid = a.savingsBalance + a.fixedDeposits + a.liquidMF;
  const mediumTerm = a.ppf + a.nps;
  const longTerm = Math.max(0, a.propertyValue - a.propertyLoan);
  const totalAssets = liquid + mediumTerm + longTerm;
  const totalLiabilities = a.propertyLoan + a.otherLiabilities;
  const netWorth = totalAssets - totalLiabilities + a.propertyLoan; // add back since already in longTerm net
  const realNetWorth = liquid + mediumTerm + longTerm - a.otherLiabilities;
  const liquidAssetPct = totalAssets > 0 ? (liquid / totalAssets) * 100 : 0;

  const wealthAccumulation = clamp(
    assets * 0.4 + scoreSavingsRate(a) * 0.3 + scoreInvestments(a) * 0.3,
  );
  const liquidityFlexibility = clamp((liquidAssetPct / 30) * 10);

  const monthlyIncome = a.annualIncome / 12;
  const monthlyDebt = a.otherLiabilities * 0.02 + a.propertyLoan * 0.008; // rough EMI approx
  const debtServiceBurden = monthlyIncome > 0 ? (monthlyDebt / monthlyIncome) * 100 : 0;
  const loanToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const propertyToLiquidityRatio = liquid > 0 ? a.propertyValue / liquid : a.propertyValue > 0 ? 99 : 0;
  const monthsCovered = a.monthlyExpenses > 0 ? a.emergencyFund / a.monthlyExpenses : 0;

  // Subjective 1-5
  const discipline =
    (a.tracksExpenses ? 1 : 0) +
    (a.hasBudget ? 1 : 0) +
    (a.debtFreeExceptMortgage ? 1 : 0) +
    (a.monthlySavings > 0 ? 1 : 0) +
    (a.insuranceReviewed ? 1 : 0);
  const knowledge =
    (a.knowsCoverAccurately ? 1 : 0) +
    (a.hasWrittenPlan ? 1 : 0) +
    (a.usingSIP ? 1 : 0) +
    (a.hasNPS || a.hasEPF ? 1 : 0) +
    (a.equityPct > 0 && a.equityPct < 100 ? 1 : 0);
  const resilience =
    monthsCovered >= 6 ? 5 : monthsCovered >= 3 ? 4 : monthsCovered >= 1 ? 3 : monthsCovered > 0 ? 2 : 1;
  const futureReadiness =
    (a.hasNPS || a.hasEPF || a.hasPersonalRetirement ? 1 : 0) +
    (a.hasWrittenPlan ? 1 : 0) +
    (retirement >= 6 ? 1 : 0) +
    (a.usingSIP ? 1 : 0) +
    (protection >= 6 ? 1 : 0);
  const protectionRobustness =
    (a.termAmount > 0 ? 1 : 0) +
    (a.healthBasic > 0 ? 1 : 0) +
    (a.healthTopUp > 0 ? 1 : 0) +
    (a.ciKind !== "none" ? 1 : 0) +
    (a.emergencyFund > a.monthlyExpenses * 3 ? 1 : 0);

  const overall = clamp(
    protection * 0.25 + emergency * 0.2 + savingsGrowth * 0.25 + retirement * 0.2 + assets * 0.1,
  );

  let status: Scores["overallStatus"] = "at_risk";
  if (overall >= 8) status = "financially_secure";
  else if (overall >= 6) status = "moderately_secure";
  else if (overall >= 4) status = "vulnerable";

  return {
    categorical: { protection, emergency, savingsGrowth, assets, retirement },
    primary: { operationalSecurity, wealthAccumulation, liquidityFlexibility },
    subjective: { discipline, knowledge, resilience, futureReadiness, protectionRobustness },
    metrics: {
      netWorth: realNetWorth,
      totalLiabilities,
      liquidAssets: liquid,
      mediumTermAssets: mediumTerm,
      longTermAssets: longTerm,
      loanToAssetRatio,
      debtServiceBurden,
      propertyToLiquidityRatio,
      liquidAssetPct,
      monthsCovered,
    },
    overallStatus: status,
    overall,
  };
}

export interface Recommendation {
  priority: "critical" | "high" | "medium" | "optimize";
  title: string;
  detail: string;
}

export function buildRecommendations(a: Assessment, s: Scores): Recommendation[] {
  const recs: Recommendation[] = [];
  const idealMonths = idealEmergencyMonths(a);

  if (a.termAmount === 0 && (a.spouse || a.children > 0 || a.elderlyParents > 0)) {
    recs.push({
      priority: "critical",
      title: "You have dependents but no term insurance",
      detail: `Aim for roughly ₹${Math.round((a.annualIncome * 12) / 100000)}L of pure-term cover so income loss doesn't wreck the family.`,
    });
  }
  if (s.metrics.monthsCovered < idealMonths / 2) {
    const target = Math.round((idealMonths * a.monthlyExpenses) / 100000);
    recs.push({
      priority: "critical",
      title: `Emergency fund covers only ${s.metrics.monthsCovered.toFixed(1)} months`,
      detail: `Build to ${idealMonths} months (~₹${target}L) in a plain savings account or short FD before anything else.`,
    });
  }
  if (a.healthBasic === 0) {
    recs.push({
      priority: "critical",
      title: "No health insurance on record",
      detail: "Even a ₹5L family floater plus a ₹25L super top-up is cheap protection against a single hospital bill.",
    });
  }
  if (s.categorical.protection < 6 && a.termAmount > 0) {
    recs.push({
      priority: "high",
      title: "Term cover is too small for your income",
      detail: `A 10-15x annual-income cover is the industry rule of thumb. You are currently at ${(a.termAmount / a.annualIncome).toFixed(1)}x.`,
    });
  }
  if (a.ciKind === "none") {
    recs.push({
      priority: "high",
      title: "No critical-illness cover",
      detail: "Add a ₹25-50L standalone CI policy or rider — cancer/cardiac events are the single biggest wealth destroyers.",
    });
  }
  if (scoreSavingsRate(a) < 5) {
    recs.push({
      priority: "high",
      title: "Savings rate is below 15%",
      detail: "Automate a monthly transfer on payday. Target 20%+ of take-home to build a real growth engine.",
    });
  }
  if (s.metrics.propertyToLiquidityRatio > 5 && a.propertyValue > 0) {
    recs.push({
      priority: "medium",
      title: "Wealth is heavily locked in property",
      detail: `Property-to-liquidity ratio is ${s.metrics.propertyToLiquidityRatio.toFixed(1)}:1. Rebalance toward liquid mutual funds/FDs.`,
    });
  }
  if (a.age >= 30 && !a.hasNPS && !a.hasEPF && !a.hasPersonalRetirement) {
    recs.push({
      priority: "high",
      title: "No retirement instrument in place",
      detail: "Open NPS Tier-1 today. Even ₹5K/month compounded to age 60 becomes a meaningful cushion.",
    });
  }
  const ideal = idealEquityForAge(a.age);
  if (Math.abs(a.equityPct - ideal) > 15) {
    recs.push({
      priority: "medium",
      title: `Equity allocation drifted from ideal (${ideal}%)`,
      detail: `At age ${a.age}, aim near ${ideal}% equity. You are at ${a.equityPct}%. Rebalance over 2-3 quarters.`,
    });
  }
  if (!a.usingSIP && s.categorical.savingsGrowth < 8) {
    recs.push({
      priority: "medium",
      title: "Not using systematic investing (SIP)",
      detail: "SIPs beat lump-sum timing and enforce discipline. Start with any low-cost index fund.",
    });
  }
  if (s.overall >= 7 && recs.length < 3) {
    recs.push({
      priority: "optimize",
      title: "You're in good shape — optimize taxes next",
      detail: "Max out 80C/80CCD(1B), review capital-gains harvesting, and consider a fee-only advisor for a portfolio audit.",
    });
  }

  return recs.slice(0, 8);
}

export function inr(n: number): string {
  if (!isFinite(n)) return "₹0";
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

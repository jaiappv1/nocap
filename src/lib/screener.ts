// Life-insurance screener engine.
// Generates demo quotes across insurers and platforms, plus insurer
// credential data. All numbers are illustrative estimates based on
// publicly disclosed IRDAI ranges — not live quotes.
import licLogo from "@/assets/insurers/lic.jpeg.asset.json";
import hdfcLogo from "@/assets/insurers/hdfc.jpeg.asset.json";
import iciciLogo from "@/assets/insurers/iciciprulife.jpeg.asset.json";
import sbiLogo from "@/assets/insurers/sbi.jpeg.asset.json";
import tataLogo from "@/assets/insurers/tataaia.jpeg.asset.json";
import bajajLogo from "@/assets/insurers/bajajallianz.jpeg.asset.json";
import kotakLogo from "@/assets/insurers/kotaklife.jpeg.asset.json";
import axismaxLogo from "@/assets/insurers/axismax.jpeg.asset.json";
import adityaLogo from "@/assets/insurers/aditya.jpeg.asset.json";
import pnbLogo from "@/assets/insurers/pnbmet.jpeg.asset.json";

export type PlanType = "term" | "term_rop" | "ulip" | "endowment" | "whole_life";
export type PayFrequency = "yearly" | "monthly";
export type Smoker = "no" | "yes";
export type Employment = "salaried" | "self_employed";

export const PLAN_LABELS: Record<PlanType, string> = {
  term: "Term Insurance (Pure protection)",
  term_rop: "Term with Return of Premium",
  ulip: "ULIP (Market linked)",
  endowment: "Endowment / Guaranteed savings",
  whole_life: "Whole Life",
};

export type ScreenerInput = {
  gender: "male" | "female";
  age: number;
  smoker: Smoker;
  employment: Employment;
  annualIncome: number; // INR
  cover: number;        // INR
  coverTillAge: number; // years
  planType: PlanType;
  payFrequency: PayFrequency;
};

export type Platform =
  | "insurer_direct"
  | "policybazaar"
  | "ditto"
  | "bima_sugam";

export const PLATFORM_LABELS: Record<Platform, string> = {
  insurer_direct: "Insurer website (Direct)",
  policybazaar: "Policybazaar",
  ditto: "Ditto Insurance",
  bima_sugam: "Bima Sugam (Govt)",
};

// Commission the platform takes on Year-1 premium (typical mid-points).
// Bima Sugam is the government-run exchange — no distributor cut.
// Ditto charges the insurer a small lead fee, not a % commission.
export const PLATFORM_COMMISSION_PCT: Record<Platform, number> = {
  insurer_direct: 0,
  policybazaar: 25,
  ditto: 15,
  bima_sugam: 0,
};

// Premium multiplier vs the insurer-direct baseline. Even though IRDAI
// mandates same-price-across-channels, real-world display prices differ
// due to discount coupons, exclusive variants, and add-on bundles.
export const PLATFORM_PRICE_FACTOR: Record<Platform, number> = {
  insurer_direct: 1.00,
  policybazaar: 1.02,
  ditto: 1.00,
  bima_sugam: 0.85,
};

export type Insurer = {
  id: string;
  name: string;
  short: string;
  brandBg: string;   // background color for logo tile
  brandFg: string;   // foreground/text color
  logoUrl?: string;  // official logo (CDN asset)
  founded: number;
  // Base annual premium for a 30-year-old non-smoker for ₹1 Cr / 30-yr term.
  // Everything else is scaled from this reference point.
  baseTerm: number;
  planTypes: PlanType[];
  credentials: InsurerCredentials;
};

export type InsurerCredentials = {
  claimSettlementRatio: number;      // %
  claimAmountRatio: number;          // %
  grievanceRatio: number;            // per 10,000 policies
  solvencyRatio: number;             // x (regulatory min: 1.5)
  persistency13m: number;            // %
  persistency61m: number;            // %
  avgClaimTatDays: number;           // days
  annualBusinessCr: number;          // ₹ Cr (new business premium)
  csrTrend: number[];                // last 5 years, %
  businessTrend: number[];           // last 5 years, ₹ Cr
};

export const INSURERS: Insurer[] = [
  {
    id: "lic", name: "LIC of India", short: "LIC",
    brandBg: "#FFD400", brandFg: "#0A2B5C",
    logoUrl: licLogo.url,
    founded: 1956, baseTerm: 14500,
    planTypes: ["term", "term_rop", "endowment", "whole_life", "ulip"],
    credentials: {
      claimSettlementRatio: 98.62, claimAmountRatio: 96.48,
      grievanceRatio: 3.7, solvencyRatio: 1.98,
      persistency13m: 78.6, persistency61m: 62.1,
      avgClaimTatDays: 6, annualBusinessCr: 222500,
      csrTrend: [96.69, 98.31, 98.74, 98.52, 98.62],
      businessTrend: [178000, 198000, 232000, 212000, 222500],
    },
  },
  {
    id: "hdfc", name: "HDFC Life", short: "HDFC",
    brandBg: "#ED232A", brandFg: "#ffffff",
    logoUrl: hdfcLogo.url,
    founded: 2000, baseTerm: 11800,
    planTypes: ["term", "term_rop", "ulip", "endowment", "whole_life"],
    credentials: {
      claimSettlementRatio: 99.5, claimAmountRatio: 98.1,
      grievanceRatio: 5.2, solvencyRatio: 1.94,
      persistency13m: 87.4, persistency61m: 59.3,
      avgClaimTatDays: 4, annualBusinessCr: 31200,
      csrTrend: [99.07, 99.39, 99.66, 99.5, 99.5],
      businessTrend: [20200, 24150, 27150, 29650, 31200],
    },
  },
  {
    id: "iciciprulife", name: "ICICI Prudential Life", short: "ICICI Pru",
    brandBg: "#F58220", brandFg: "#ffffff",
    logoUrl: iciciLogo.url,
    founded: 2001, baseTerm: 12400,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 99.17, claimAmountRatio: 96.8,
      grievanceRatio: 6.1, solvencyRatio: 1.91,
      persistency13m: 85.9, persistency61m: 55.4,
      avgClaimTatDays: 5, annualBusinessCr: 18800,
      csrTrend: [97.9, 97.82, 97.9, 98.79, 99.17],
      businessTrend: [13030, 15400, 16620, 17870, 18800],
    },
  },
  {
    id: "sbilife", name: "SBI Life", short: "SBI",
    brandBg: "#5F259F", brandFg: "#ffffff",
    logoUrl: sbiLogo.url,
    founded: 2001, baseTerm: 13100,
    planTypes: ["term", "term_rop", "ulip", "endowment", "whole_life"],
    credentials: {
      claimSettlementRatio: 98.39, claimAmountRatio: 97.3,
      grievanceRatio: 4.4, solvencyRatio: 2.14,
      persistency13m: 86.2, persistency61m: 61.7,
      avgClaimTatDays: 5, annualBusinessCr: 29580,
      csrTrend: [94.52, 97.05, 97.05, 98.05, 98.39],
      businessTrend: [20620, 25460, 29590, 30200, 29580],
    },
  },
  {
    id: "tataaia", name: "Tata AIA Life", short: "Tata AIA",
    brandBg: "#486FBF", brandFg: "#ffffff",
    logoUrl: tataLogo.url,
    founded: 2001, baseTerm: 11600,
    planTypes: ["term", "term_rop", "ulip", "endowment", "whole_life"],
    credentials: {
      claimSettlementRatio: 99.13, claimAmountRatio: 97.6,
      grievanceRatio: 3.9, solvencyRatio: 1.96,
      persistency13m: 88.5, persistency61m: 60.4,
      avgClaimTatDays: 4, annualBusinessCr: 9310,
      csrTrend: [99.06, 98.53, 99.06, 99.01, 99.13],
      businessTrend: [5030, 6800, 7100, 8380, 9310],
    },
  },
  {
    id: "bajajallianz", name: "Bajaj Allianz Life", short: "Bajaj",
    brandBg: "#00548E", brandFg: "#ffffff",
    logoUrl: bajajLogo.url,
    founded: 2001, baseTerm: 12000,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 99.04, claimAmountRatio: 96.9,
      grievanceRatio: 5.6, solvencyRatio: 4.32,
      persistency13m: 82.3, persistency61m: 51.8,
      avgClaimTatDays: 5, annualBusinessCr: 6820,
      csrTrend: [98.48, 99.02, 99.04, 99.04, 99.04],
      businessTrend: [5180, 5510, 5800, 6350, 6820],
    },
  },
  {
    id: "kotaklife", name: "Kotak Life", short: "Kotak",
    brandBg: "#EE1C25", brandFg: "#ffffff",
    logoUrl: kotakLogo.url,
    founded: 2001, baseTerm: 11500,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 98.82, claimAmountRatio: 97.1,
      grievanceRatio: 4.1, solvencyRatio: 2.83,
      persistency13m: 87.6, persistency61m: 62.4,
      avgClaimTatDays: 4, annualBusinessCr: 4530,
      csrTrend: [98.5, 98.82, 98.82, 98.71, 98.82],
      businessTrend: [2810, 3390, 3970, 4210, 4530],
    },
  },
  {
    id: "axismax", name: "Axis Max Life", short: "Axis Max",
    brandBg: "#8B1A1A", brandFg: "#ffffff",
    logoUrl: axismaxLogo.url,
    founded: 2000, baseTerm: 11100,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 99.7, claimAmountRatio: 98.9,
      grievanceRatio: 3.2, solvencyRatio: 1.87,
      persistency13m: 88.4, persistency61m: 59.8,
      avgClaimTatDays: 3, annualBusinessCr: 9550,
      csrTrend: [99.34, 99.35, 99.51, 99.65, 99.7],
      businessTrend: [6800, 7900, 9100, 9200, 9550],
    },
  },
  {
    id: "aditya", name: "Aditya Birla Sun Life", short: "ABSLI",
    brandBg: "#C8102E", brandFg: "#ffffff",
    logoUrl: adityaLogo.url,
    founded: 2000, baseTerm: 12800,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 98.12, claimAmountRatio: 95.8,
      grievanceRatio: 6.4, solvencyRatio: 1.86,
      persistency13m: 84.1, persistency61m: 52.6,
      avgClaimTatDays: 6, annualBusinessCr: 3410,
      csrTrend: [98.04, 98.07, 98.12, 98.12, 98.12],
      businessTrend: [2450, 2870, 3060, 3220, 3410],
    },
  },
  {
    id: "pnbmet", name: "PNB MetLife", short: "PNB Met",
    brandBg: "#004B87", brandFg: "#ffffff",
    logoUrl: pnbLogo.url,
    founded: 2001, baseTerm: 12200,
    planTypes: ["term", "term_rop", "ulip", "endowment"],
    credentials: {
      claimSettlementRatio: 97.31, claimAmountRatio: 94.2,
      grievanceRatio: 7.2, solvencyRatio: 1.98,
      persistency13m: 82.7, persistency61m: 47.9,
      avgClaimTatDays: 7, annualBusinessCr: 2680,
      csrTrend: [97.18, 97.33, 97.31, 97.31, 97.31],
      businessTrend: [1980, 2120, 2360, 2510, 2680],
    },
  },
  {
    id: "bandhan", name: "Bandhan Life", short: "Bandhan",
    brandBg: "#E03A3E", brandFg: "#ffffff",
    founded: 2011, baseTerm: 12600,
    planTypes: ["term", "term_rop", "ulip"],
    credentials: {
      claimSettlementRatio: 99.44, claimAmountRatio: 96.1,
      grievanceRatio: 5.8, solvencyRatio: 1.95,
      persistency13m: 79.2, persistency61m: 46.3,
      avgClaimTatDays: 5, annualBusinessCr: 1740,
      csrTrend: [98.42, 99.11, 99.34, 99.44, 99.44],
      businessTrend: [1240, 1360, 1490, 1610, 1740],
    },
  },
];

export type Quote = {
  insurer: Insurer;
  planName: string;
  baseAnnualPremium: number;       // insurer-direct baseline
  perPlatform: { platform: Platform; premium: number; commission: number }[];
  coverAmount: number;
  coverTillAge: number;
  zeroCost?: boolean;
  freeAddOns?: number;
};

function planNameFor(insurer: Insurer, plan: PlanType): string {
  const suffix: Record<PlanType, string> = {
    term: "Smart Term Shield",
    term_rop: "Smart Term ROP",
    ulip: "Smart Wealth ULIP",
    endowment: "Guaranteed Savings",
    whole_life: "Whole Life Plan",
  };
  return `${insurer.short} ${suffix[plan]}`;
}

/**
 * Very simplified pricing model (illustrative). Real underwriting uses
 * mortality tables, medicals, income proof. We approximate:
 *   base * ageFactor * coverFactor * durationFactor * planFactor * smokerFactor
 */
function estimateBasePremium(insurer: Insurer, input: ScreenerInput): number {
  const ageFactor = Math.pow(1.048, input.age - 30); // ~4.8% per year over 30
  const durationYears = Math.max(5, input.coverTillAge - input.age);
  const durFactor = 0.85 + (durationYears / 30) * 0.30;
  const coverFactor = input.cover / 1_00_00_000; // relative to ₹1 Cr
  const smokerFactor = input.smoker === "yes" ? 1.6 : 1.0;
  const genderFactor = input.gender === "female" ? 0.88 : 1.0;
  const planFactor: Record<PlanType, number> = {
    term: 1.0,
    term_rop: 2.4,
    ulip: 8.0,       // ULIPs are effectively investments, not just cover
    endowment: 10.0,
    whole_life: 3.2,
  };
  const raw =
    insurer.baseTerm *
    ageFactor *
    durFactor *
    coverFactor *
    smokerFactor *
    genderFactor *
    planFactor[input.planType];
  return Math.round(raw / 12) * 12;
}

export function screen(input: ScreenerInput): Quote[] {
  const quotes: Quote[] = [];
  for (const insurer of INSURERS) {
    if (!insurer.planTypes.includes(input.planType)) continue;
    const base = estimateBasePremium(insurer, input);
    // Bima Sugam is always 10-20% cheaper; insurer direct is sometimes
    // 10-20% cheaper (roughly half the insurers) via first-year online
    // discounts. Deterministic per insurer so repeat searches are stable.
    const h = hashStr(insurer.id);
    const bimaFactor = 0.80 + ((h % 11) / 100);            // 0.80–0.90
    const directCheaper = h % 2 === 0;
    const directFactor = directCheaper
      ? 0.83 + ((h % 8) / 100)                              // 0.83–0.90
      : PLATFORM_PRICE_FACTOR.insurer_direct;
    const factorFor = (p: Platform) =>
      p === "bima_sugam" ? bimaFactor
      : p === "insurer_direct" ? directFactor
      : PLATFORM_PRICE_FACTOR[p];
    const perPlatform = (Object.keys(PLATFORM_LABELS) as Platform[]).map((p) => {
      const premium = Math.round((base * factorFor(p)) / 12) * 12;
      const commission = Math.round((premium * PLATFORM_COMMISSION_PCT[p]) / 100);
      return { platform: p, premium, commission };
    });
    quotes.push({
      insurer,
      planName: planNameFor(insurer, input.planType),
      baseAnnualPremium: base,
      perPlatform,
      coverAmount: input.cover,
      coverTillAge: input.coverTillAge,
      zeroCost: ["term", "term_rop"].includes(input.planType) && Math.random() > 0.4,
      freeAddOns: Math.floor((insurer.baseTerm % 5) + 2),
    });
  }
  return quotes.sort((a, b) => a.baseAnnualPremium - b.baseAnnualPremium);
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function inr(n: number): string {
  if (!isFinite(n)) return "₹0";
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toLocaleString("en-IN", { maximumFractionDigits: 1 })}K`;
  return `${sign}₹${abs.toLocaleString("en-IN")}`;
}

export function inrExact(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

// Median commission on a typical policy — used in the disclosure line.
export function medianCommissionForPlan(plan: PlanType): { yr1: number; renewal: number } {
  const map: Record<PlanType, { yr1: number; renewal: number }> = {
    term:        { yr1: 35, renewal: 4 },
    term_rop:    { yr1: 40, renewal: 6 },
    ulip:        { yr1: 25, renewal: 3 },
    endowment:   { yr1: 30, renewal: 6 },
    whole_life:  { yr1: 40, renewal: 5 },
  };
  return map[plan];
}
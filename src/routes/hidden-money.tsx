import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CreditCard,
  Home,
  Search,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/hidden-money")({
  head: () => ({
    meta: [
      { title: "Hidden Money — Find the covers, refunds & unclaimed assets already in your name" },
      {
        name: "description",
        content:
          "Most Indians already have ₹10–50 Lakh of free insurance and forgotten deposits sitting in their name. Find yours in under 3 minutes — EPF EDLI, LPG cover, RuPay/Visa insurance, PMSBY/PMJJY, UDGAM, Bima Bharosa, MITRA.",
      },
      { property: "og:title", content: "Hidden Money — Aapki Punji, Aapka Adhikar" },
      {
        property: "og:description",
        content: "Find the free insurance, forgotten claims and unclaimed assets already in your name.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HiddenMoneyPage,
});

/* ============================== Types ============================== */

type Employment = "salaried" | "self_employed" | "retired" | "";
type CardKind = "rupay_classic" | "rupay_platinum" | "visa_premium" | "mc_premium" | "none";

type Answers = {
  employment: Employment;
  hasEpf: boolean;
  cards: Record<CardKind, boolean>;
  lastCardTxnDays: number | null; // days since last txn on primary RuPay
  pmsby: boolean;
  pmjjy: boolean;
  bankSavings: boolean;
  hasLpg: boolean;
  lpgIsi: boolean;
  usesIrctc: boolean;
  irctcOptIn: boolean;
  sweepName: string;
  sweepPan: string;
  sweepDob: string;
  sweepOldCity: string;
};

const EMPTY: Answers = {
  employment: "",
  hasEpf: false,
  cards: {
    rupay_classic: false,
    rupay_platinum: false,
    visa_premium: false,
    mc_premium: false,
    none: false,
  },
  lastCardTxnDays: null,
  pmsby: false,
  pmjjy: false,
  bankSavings: true,
  hasLpg: false,
  lpgIsi: true,
  usesIrctc: false,
  irctcOptIn: false,
  sweepName: "",
  sweepPan: "",
  sweepDob: "",
  sweepOldCity: "",
};

/* ============================== Cover DB ============================== */

type Finding = {
  id: string;
  title: string;
  category: "Automatic cover" | "Micro-premium" | "Card cover" | "Utility cover" | "Unclaimed asset";
  valueMin: number;   // INR
  valueMax: number;   // INR
  status: "active" | "conditional" | "at_risk" | "needs_check";
  summary: string;
  triggerHint: string;
  actionLabel?: string;
  actionHref?: string;
};

function inr(n: number): string {
  if (!isFinite(n)) return "₹0";
  const abs = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(2)} L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return `${sign}₹${abs}`;
}

function inrRange(a: number, b: number): string {
  if (a === b) return inr(a);
  return `${inr(a)} – ${inr(b)}`;
}

function computeFindings(a: Answers): Finding[] {
  const out: Finding[] = [];

  // EPF EDLI
  if (a.employment === "salaried" && a.hasEpf) {
    out.push({
      id: "edli",
      title: "EPF EDLI life cover",
      category: "Automatic cover",
      valueMin: 2_50_000,
      valueMax: 7_00_000,
      status: "active",
      summary:
        "Every active EPF member gets ₹2.5–7 Lakh life insurance for their nominee — paid automatically by EPFO if the member dies while on company payroll. Zero premium.",
      triggerHint:
        "Covers death while in service (extends up to 6 months after leaving in some cases). Payout depends on last 12 months' PF wages.",
      actionLabel: "Check / update EPF nominee",
      actionHref: "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
    });
  }

  // PMSBY / PMJJY
  if (a.pmsby) {
    out.push({
      id: "pmsby",
      title: "PMSBY — accident cover",
      category: "Micro-premium",
      valueMin: 2_00_000,
      valueMax: 2_00_000,
      status: "active",
      summary:
        "₹20/year is auto-debited from your bank account for ₹2 Lakh accidental death / total disability cover. Most people forget they signed up at account opening.",
      triggerHint:
        "Renews on 1 June each year. If auto-debit fails, cover lapses silently — check your June bank statement.",
    });
  }
  if (a.pmjjy) {
    out.push({
      id: "pmjjy",
      title: "PMJJY — life cover",
      category: "Micro-premium",
      valueMin: 2_00_000,
      valueMax: 2_00_000,
      status: "active",
      summary:
        "₹436/year auto-debited for ₹2 Lakh life insurance (any cause of death). Renews annually on 1 June.",
      triggerHint: "If premium bounces, cover lapses. Nominee is set at enrolment — verify it's current.",
    });
  }

  // If bank savings but no PMSBY / PMJJY → nudge
  if (a.bankSavings && (!a.pmsby || !a.pmjjy)) {
    out.push({
      id: "pm_missing",
      title: "PMSBY / PMJJY — not enrolled?",
      category: "Micro-premium",
      valueMin: 2_00_000,
      valueMax: 4_00_000,
      status: "needs_check",
      summary:
        "For ₹20 + ₹436 a year total, you can get ₹2L accident + ₹2L life cover through your existing bank. Ask your branch — takes one form.",
      triggerHint: "Enrol before 31 May for the next 1 June renewal cycle. Nominee must be an immediate family member.",
    });
  }

  // Cards
  const hasRupay = a.cards.rupay_classic || a.cards.rupay_platinum;
  if (a.cards.rupay_platinum) {
    const window = 45;
    const lapsed = a.lastCardTxnDays != null && a.lastCardTxnDays > window;
    out.push({
      id: "rupay_platinum",
      title: "RuPay Platinum — accident & disability",
      category: "Card cover",
      valueMin: 2_00_000,
      valueMax: 2_00_000,
      status: lapsed ? "at_risk" : "conditional",
      summary:
        "₹2 Lakh accidental death or permanent disability cover comes free with every RuPay Platinum card.",
      triggerHint: lapsed
        ? `⚠️ Cover lapses if the card wasn't used in the 45 days before the accident. Your last use was ${a.lastCardTxnDays} days ago — swipe it once to reactivate.`
        : "Requires at least one successful ATM / POS / online transaction in the 45 days before the accident.",
    });
  }
  if (a.cards.rupay_classic) {
    const window = 90;
    const lapsed = a.lastCardTxnDays != null && a.lastCardTxnDays > window;
    out.push({
      id: "rupay_classic",
      title: "RuPay Classic / Jan Dhan — accident",
      category: "Card cover",
      valueMin: 1_00_000,
      valueMax: 1_00_000,
      status: lapsed ? "at_risk" : "conditional",
      summary:
        "₹1 Lakh accidental death / permanent disability cover on Classic and PMJDY RuPay cards.",
      triggerHint: lapsed
        ? `⚠️ Cover lapses if the card wasn't used in the 90 days before the accident. Your last use was ${a.lastCardTxnDays} days ago.`
        : "Needs one successful transaction in the 90 days before the accident.",
    });
  }
  if (a.cards.visa_premium || a.cards.mc_premium) {
    out.push({
      id: "premium_card",
      title: `${a.cards.visa_premium ? "Visa" : "Mastercard"} premium — travel & purchase`,
      category: "Card cover",
      valueMin: 2_00_000,
      valueMax: 1_00_00_000,
      status: "conditional",
      summary:
        "Gold / Platinum / Signature / Infinite cards bundle air-accident cover (up to ₹1 Cr), lost baggage, and 90-day purchase protection.",
      triggerHint:
        "Only valid when the flight ticket / purchase was paid on this exact card. Ask your bank for the current benefit schedule — insurers change every 1–2 years.",
    });
  }
  if (hasRupay && a.lastCardTxnDays == null) {
    out.push({
      id: "rupay_txn_unknown",
      title: "RuPay activation — status unknown",
      category: "Card cover",
      valueMin: 1_00_000,
      valueMax: 2_00_000,
      status: "needs_check",
      summary:
        "You hold a RuPay card but haven't confirmed a recent transaction. The insurance only activates if the card was used within 45 (Platinum) or 90 (Classic) days before the incident.",
      triggerHint: "Do one ₹10 UPI-linked debit-card purchase this week to keep the cover live.",
    });
  }

  // LPG
  if (a.hasLpg) {
    out.push({
      id: "lpg",
      title: "LPG public-liability insurance",
      category: "Utility cover",
      valueMin: 10_00_000,
      valueMax: 50_00_000,
      status: a.lpgIsi ? "active" : "at_risk",
      summary:
        "Every registered domestic LPG connection carries ₹10 L per person for accidental death, up to ₹4 L medical, ₹2 L property damage — with total per-event cover up to ₹50 L.",
      triggerHint: a.lpgIsi
        ? "Valid as long as the pipe, regulator and stove are ISI-marked and the accident stems from the cylinder."
        : "⚠️ Cover can be denied if the pipe / regulator / stove aren't ISI-certified. Replace non-ISI parts (₹250–₹600 job).",
    });
  }

  // IRCTC
  if (a.usesIrctc) {
    out.push({
      id: "irctc",
      title: "IRCTC train-journey cover",
      category: "Utility cover",
      valueMin: 2_00_000,
      valueMax: 10_00_000,
      status: a.irctcOptIn ? "active" : "needs_check",
      summary:
        "For 45 paise per ticket you get ₹10 L death / permanent disability + ₹2 L hospitalisation from train accidents.",
      triggerHint: a.irctcOptIn
        ? "Cover applies only to the specific journey the ticket was booked for."
        : "Not currently opted in. Toggle 'Travel Insurance' ON at every IRCTC checkout — costs less than a rupee.",
    });
  }

  // Unclaimed sweep
  const hasIdentifier = !!(a.sweepName || a.sweepPan || a.sweepDob);
  if (hasIdentifier) {
    out.push({
      id: "udgam",
      title: "Unclaimed bank deposits & FDs",
      category: "Unclaimed asset",
      valueMin: 0,
      valueMax: 0,
      status: "needs_check",
      summary:
        "Any bank account or FD dormant for 10+ years transfers to RBI's DEA Fund. Search the RBI UDGAM portal with the details you entered — a UDRN reference is generated for each match.",
      triggerHint: `Try Name "${a.sweepName || "—"}" ± PAN "${a.sweepPan || "—"}" and cities you (or parents) lived in. Add old accounts, joint accounts and legacy branches.`,
      actionLabel: "Open UDGAM (RBI)",
      actionHref: "https://udgam.rbi.org.in/",
    });
    out.push({
      id: "bima_bharosa",
      title: "Unclaimed insurance payouts",
      category: "Unclaimed asset",
      valueMin: 0,
      valueMax: 0,
      status: "needs_check",
      summary:
        "Matured / lapsed policies unclaimed for 10+ years show up on IRDAI's Bima Bharosa. Very common for policies taken out by parents or grandparents.",
      triggerHint: "Search by policyholder name + DOB. Include maiden names and both parents.",
      actionLabel: "Open Bima Bharosa (IRDAI)",
      actionHref: "https://bimabharosa.irdai.gov.in/",
    });
    out.push({
      id: "mitra",
      title: "Unclaimed mutual funds, dividends & shares",
      category: "Unclaimed asset",
      valueMin: 0,
      valueMax: 0,
      status: "needs_check",
      summary:
        "Dividends and shares unclaimed for 7 years move to IEPF; folios inactive across AMCs surface on SEBI's MITRA portal.",
      triggerHint: "Search by PAN, folio number or DP ID. IEPF has a separate claim form (IEPF-5).",
      actionLabel: "Open MITRA (SEBI)",
      actionHref: "https://mitra.camsonline.com/",
    });
    out.push({
      id: "hub",
      title: "One-stop hub — Aapki Punji, Aapka Adhikar",
      category: "Unclaimed asset",
      valueMin: 0,
      valueMax: 0,
      status: "needs_check",
      summary:
        "Ministry of Finance's unified portal (May 2026) — a single form that routes across RBI, IRDAI and SEBI in one shot.",
      triggerHint: "Best starting point. Save the reference IDs it generates.",
      actionLabel: "Open unclaimed assets portal",
      actionHref: "https://www.unclaimedassetsportal.in/",
    });
  }

  return out;
}

/* ============================== Page ============================== */

function HiddenMoneyPage() {
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  const findings = useMemo(() => computeFindings(answers), [answers]);
  const totalMin = findings.reduce((s, f) => s + f.valueMin, 0);
  const totalMax = findings.reduce((s, f) => s + f.valueMax, 0);

  const patch = (p: Partial<Answers>) => setAnswers((a) => ({ ...a, ...p }));
  const patchCards = (p: Partial<Record<CardKind, boolean>>) =>
    setAnswers((a) => ({ ...a, cards: { ...a.cards, ...p } }));

  const isResults = step === 4;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to NoCap
          </Link>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Coins className="h-4 w-4" />
            Hidden Money
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 py-10 md:px-6 md:py-16">
        {!isResults ? (
          <>
            <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
              <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Aapki Punji, Aapka Adhikar
              </p>
              <h1 className="font-display text-3xl leading-tight md:text-5xl">
                You're already covered by <em className="font-hand not-italic text-trust">₹10–50 Lakh</em>
                <br />
                of insurance you never paid for.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground md:text-base">
                EPF, LPG, RuPay, Visa premium, PMSBY / PMJJY, and India's new unified unclaimed-assets portal.
                Four short steps — no sign-up, nothing leaves your browser.
              </p>
            </div>

            <Stepper current={step} total={4} />

            {step === 0 && (
              <StepShell
                title="1 · Your work situation"
                subtitle="Decides whether EPF EDLI cover applies to you."
                Icon={Building2}
              >
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { v: "salaried", label: "Salaried", hint: "In a company payroll" },
                    { v: "self_employed", label: "Self-employed", hint: "Freelancer / business" },
                    { v: "retired", label: "Retired", hint: "Or between jobs" },
                  ].map((o) => {
                    const active = answers.employment === o.v;
                    return (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => patch({ employment: o.v as Employment })}
                        className={`ink-border rounded-lg p-4 text-left transition-all ${
                          active ? "bg-foreground text-background" : "bg-card hover:-translate-y-0.5"
                        }`}
                      >
                        <p className="font-display text-base">{o.label}</p>
                        <p
                          className={`mt-0.5 text-xs ${
                            active ? "text-background/70" : "text-muted-foreground"
                          }`}
                        >
                          {o.hint}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {answers.employment === "salaried" && (
                  <ToggleRow
                    label="I have an active EPF (PF) account"
                    hint="Any UAN with contributions in the last 6 months counts."
                    value={answers.hasEpf}
                    onChange={(v) => patch({ hasEpf: v })}
                  />
                )}
              </StepShell>
            )}

            {step === 1 && (
              <StepShell
                title="2 · Cards & bank micro-covers"
                subtitle="Most people miss ₹4–8 Lakh of cover here."
                Icon={CreditCard}
              >
                <p className="mb-2 text-xs font-medium text-foreground">Which cards do you hold?</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {(
                    [
                      { k: "rupay_classic", label: "RuPay Classic / Jan Dhan" },
                      { k: "rupay_platinum", label: "RuPay Platinum" },
                      { k: "visa_premium", label: "Visa Gold / Signature / Infinite" },
                      { k: "mc_premium", label: "Mastercard Titanium / World / Elite" },
                    ] as { k: CardKind; label: string }[]
                  ).map((o) => (
                    <Check
                      key={o.k}
                      label={o.label}
                      checked={answers.cards[o.k]}
                      onChange={(v) => patchCards({ [o.k]: v })}
                    />
                  ))}
                </div>
                {(answers.cards.rupay_classic || answers.cards.rupay_platinum) && (
                  <div className="mt-4">
                    <p className="mb-1 text-xs font-medium text-foreground">
                      Roughly how many days ago did you last use your RuPay card?
                    </p>
                    <p className="mb-2 text-[11px] text-muted-foreground">
                      Cover only activates if you've used it in the last 45 (Platinum) or 90 (Classic) days.
                    </p>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      value={answers.lastCardTxnDays ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        patch({ lastCardTxnDays: v === "" ? null : Math.max(0, Number(v) || 0) });
                      }}
                      className="w-40 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
                      placeholder="e.g. 12"
                    />
                  </div>
                )}
                <div className="mt-6 space-y-2">
                  <ToggleRow
                    label="I have a savings / current bank account"
                    value={answers.bankSavings}
                    onChange={(v) => patch({ bankSavings: v })}
                  />
                  <ToggleRow
                    label="PMSBY is auto-debited from my account (₹20/yr)"
                    hint="Look for a ~₹20 debit around June each year."
                    value={answers.pmsby}
                    onChange={(v) => patch({ pmsby: v })}
                  />
                  <ToggleRow
                    label="PMJJY is auto-debited from my account (₹436/yr)"
                    hint="Look for a ~₹436 debit around June each year."
                    value={answers.pmjjy}
                    onChange={(v) => patch({ pmjjy: v })}
                  />
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                title="3 · Home & travel"
                subtitle="LPG and IRCTC cover more than people realise."
                Icon={Home}
              >
                <ToggleRow
                  label="I have a registered LPG cylinder connection at home"
                  hint="Indane, HP Gas or Bharat Gas — all count."
                  value={answers.hasLpg}
                  onChange={(v) => patch({ hasLpg: v })}
                />
                {answers.hasLpg && (
                  <ToggleRow
                    label="My pipe, regulator and stove are ISI-marked"
                    hint="Cover can be denied without ISI parts."
                    value={answers.lpgIsi}
                    onChange={(v) => patch({ lpgIsi: v })}
                  />
                )}
                <ToggleRow
                  label="I book train tickets on IRCTC"
                  value={answers.usesIrctc}
                  onChange={(v) => patch({ usesIrctc: v })}
                />
                {answers.usesIrctc && (
                  <ToggleRow
                    label="I always tick 'Travel Insurance' at IRCTC checkout"
                    hint="It costs 45 paise. Gives ₹10 L death cover for that journey."
                    value={answers.irctcOptIn}
                    onChange={(v) => patch({ irctcOptIn: v })}
                  />
                )}
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                title="4 · Unclaimed asset sweep"
                subtitle="Search your own, your parents' or a deceased relative's records — RBI + IRDAI + SEBI, in one form."
                Icon={Search}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextField
                    label="Full name (as on records)"
                    hint="Include maiden name if applicable"
                    value={answers.sweepName}
                    onChange={(v) => patch({ sweepName: v })}
                    placeholder="e.g. Rajesh Kumar Sharma"
                  />
                  <TextField
                    label="PAN (optional but ideal)"
                    hint="Highest-quality identifier across all three regulators"
                    value={answers.sweepPan}
                    onChange={(v) => patch({ sweepPan: v.toUpperCase().slice(0, 10) })}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                  <TextField
                    label="Date of birth"
                    value={answers.sweepDob}
                    onChange={(v) => patch({ sweepDob: v })}
                    placeholder="DD / MM / YYYY"
                    maxLength={12}
                  />
                  <TextField
                    label="City lived in ~10 years ago"
                    hint="Old bank branches are often the source of dormant accounts."
                    value={answers.sweepOldCity}
                    onChange={(v) => patch({ sweepOldCity: v })}
                    placeholder="e.g. Kanpur"
                    maxLength={80}
                  />
                </div>
                <p className="mt-4 flex items-start gap-2 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Nothing here leaves your browser — we use these only to pre-fill instructions for the official portals.
                </p>
              </StepShell>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => (Math.max(0, s - 1) as 0 | 1 | 2 | 3 | 4))}
                className="ink-border inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-background"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                disabled={step === 0 && !answers.employment}
                onClick={() => setStep((s) => (Math.min(4, s + 1) as 0 | 1 | 2 | 3 | 4))}
                className="ink-border inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {step === 3 ? "See my hidden money" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <ResultsView
            findings={findings}
            totalMin={totalMin}
            totalMax={totalMax}
            onEdit={() => setStep(0)}
          />
        )}
      </main>
    </div>
  );
}

/* ============================== UI atoms ============================== */

function Stepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= current ? "bg-foreground" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  Icon,
  children,
}: {
  title: string;
  subtitle: string;
  Icon: typeof Building2;
  children: React.ReactNode;
}) {
  return (
    <section className="ink-border rounded-lg bg-card p-5 md:p-8">
      <div className="mb-5 flex items-start gap-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-xl md:text-2xl">{title}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`ink-border flex w-full items-start justify-between gap-3 rounded-md px-4 py-3 text-left transition-colors ${
        value ? "bg-foreground text-background" : "bg-background hover:bg-secondary"
      }`}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && (
          <p
            className={`mt-0.5 text-[11px] ${
              value ? "text-background/70" : "text-muted-foreground"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
      <span
        className={`mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors ${
          value ? "border-background/40 bg-background/20" : "border-border bg-secondary"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full transition-transform ${
            value ? "translate-x-4 bg-background" : "translate-x-0.5 bg-foreground"
          }`}
        />
      </span>
    </button>
  );
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`ink-border flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
        checked ? "bg-foreground text-background" : "bg-background hover:bg-secondary"
      }`}
    >
      <span
        className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
          checked ? "border-background bg-background text-foreground" : "border-border bg-background"
        }`}
      >
        {checked && <CheckCircle2 className="h-3 w-3" />}
      </span>
      {label}
    </button>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
  );
}

/* ============================== Results ============================== */

function ResultsView({
  findings,
  totalMin,
  totalMax,
  onEdit,
}: {
  findings: Finding[];
  totalMin: number;
  totalMax: number;
  onEdit: () => void;
}) {
  const grouped = findings.reduce<Record<Finding["category"], Finding[]>>((acc, f) => {
    (acc[f.category] ||= []).push(f);
    return acc;
  }, {} as Record<Finding["category"], Finding[]>);
  const order: Finding["category"][] = [
    "Automatic cover",
    "Micro-premium",
    "Card cover",
    "Utility cover",
    "Unclaimed asset",
  ];

  const hasAny = findings.length > 0;

  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Your hidden-money portfolio
        </p>
        <h1 className="font-display text-3xl leading-tight md:text-5xl">
          You already have <span className="font-hand text-trust">{inrRange(totalMin, totalMax)}</span>
          <br />
          of cover most people don't know they have.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Plus unclaimed deposits, matured policies and dormant folios that could be sitting under your name.
        </p>
      </div>

      {!hasAny && (
        <div className="ink-border rounded-lg bg-card p-6 text-center text-sm text-muted-foreground">
          Answer the four steps to see your hidden covers and where to claim them.
        </div>
      )}

      {order.map((cat) => {
        const list = grouped[cat];
        if (!list || list.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-xl md:text-2xl">{cat}s</h2>
              <p className="text-xs text-muted-foreground">
                {list.length} {list.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="grid gap-3">
              {list.map((f) => (
                <FindingCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="ink-border rounded-lg bg-trust/5 p-5 md:p-8">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trust/15 text-trust">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              What to do this week
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>· Verify nominees on EPF, PMSBY, PMJJY and bank accounts — the payout stops there.</li>
              <li>· Use every RuPay card once this month (any ₹10 UPI-linked debit works).</li>
              <li>· Screenshot this page and share with a parent — most unclaimed money is theirs.</li>
              <li>· Run the unclaimed-assets sweep on your own PAN and your parents' names.</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="ink-border rounded-full bg-background px-5 py-2 text-sm text-foreground hover:bg-secondary"
        >
          Edit answers
        </button>
        <Link
          to="/"
          className="ink-border rounded-full bg-foreground px-5 py-2 text-sm text-background hover:-translate-y-0.5"
        >
          Back to NoCap
        </Link>
      </div>
    </div>
  );
}

function FindingCard({ f }: { f: Finding }) {
  const isUnclaimed = f.category === "Unclaimed asset";
  const statusMeta = {
    active: { label: "Active", cls: "border-trust/40 text-trust", Icon: CheckCircle2 },
    conditional: { label: "Conditional", cls: "border-border text-muted-foreground", Icon: Info },
    at_risk: { label: "At risk", cls: "border-warn/40 text-warn", Icon: AlertTriangle },
    needs_check: { label: "Needs check", cls: "border-border text-muted-foreground", Icon: Search },
  }[f.status];
  const StatusIcon = statusMeta.Icon;

  return (
    <article className="ink-border rounded-lg bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {f.category}
          </div>
          <h3 className="mt-0.5 font-display text-lg md:text-xl">{f.title}</h3>
        </div>
        <div className="flex items-center gap-3">
          {!isUnclaimed && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Cover value
              </p>
              <p className="font-display text-lg text-trust">{inrRange(f.valueMin, f.valueMax)}</p>
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${statusMeta.cls}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusMeta.label}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-foreground">{f.summary}</p>
      <p className="mt-2 text-xs text-muted-foreground">{f.triggerHint}</p>
      {f.actionHref && (
        <a
          href={f.actionHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-foreground underline underline-offset-4 hover:text-trust"
        >
          {f.actionLabel ?? "Open portal"}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </article>
  );
}

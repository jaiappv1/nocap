import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Gauge, RotateCcw, ShieldCheck, TrendingUp, Waves, AlertTriangle, Sparkles } from "lucide-react";
import {
  emptyAssessment,
  computeScores,
  buildRecommendations,
  idealEmergencyMonths,
  inr,
  type Assessment,
  type EmploymentType,
  type LiquidityStore,
} from "@/lib/life-score";

export const Route = createFileRoute("/life-score")({
  head: () => ({
    meta: [
      { title: "Life Score — Your Financial Security Snapshot" },
      { name: "description", content: "A 5-minute assessment that scores how protected your family really is, across insurance, emergency, savings, assets and retirement." },
      { property: "og:title", content: "Life Score — Your Financial Security Snapshot" },
      { property: "og:description", content: "Score your financial security across 5 dimensions in 5 minutes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LifeScorePage,
});

const STEPS = [
  "You & family",
  "Protection",
  "Emergency fund",
  "Assets & liabilities",
  "Savings & investing",
  "Retirement",
  "Habits",
] as const;

function LifeScorePage() {
  const [data, setData] = useState<Assessment>(emptyAssessment);
  const [step, setStep] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const set = <K extends keyof Assessment>(k: K, v: Assessment[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const scores = useMemo(() => computeScores(data), [data]);
  const recs = useMemo(() => buildRecommendations(data, scores), [data, scores]);

  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to NoCap
          </Link>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <Gauge className="h-4 w-4" />
            Life Score
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-6 md:py-16">
        {!showResults ? (
          <>
            <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
              <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                A 5-minute financial security assessment
              </p>
              <h1 className="font-display text-3xl leading-tight md:text-5xl">
                How protected is your family, <em className="font-hand not-italic text-trust">really?</em>
              </h1>
              <p className="mt-4 text-sm text-muted-foreground md:text-base">
                Answer honestly — nothing is stored on our servers. You'll get a multi-dimensional Life Score and a plain-English action plan.
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                <span>Step {step + 1} of {totalSteps} · {STEPS[step]}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-trust transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="ink-border rounded-lg bg-card p-6 md:p-8">
              {step === 0 && <StepFamily data={data} set={set} />}
              {step === 1 && <StepProtection data={data} set={set} />}
              {step === 2 && <StepEmergency data={data} set={set} />}
              {step === 3 && <StepAssets data={data} set={set} />}
              {step === 4 && <StepSavings data={data} set={set} />}
              {step === 5 && <StepRetirement data={data} set={set} />}
              {step === 6 && <StepHabits data={data} set={set} />}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="ink-border inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium transition disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {step < totalSteps - 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
                  className="ink-border inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:-translate-y-0.5"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResults(true)}
                  className="ink-border inline-flex items-center gap-2 rounded-full bg-trust px-5 py-2.5 text-sm font-medium text-background transition hover:-translate-y-0.5"
                >
                  See my Life Score <Sparkles className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        ) : (
          <Results
            data={data}
            scores={scores}
            recs={recs}
            idealMonths={idealEmergencyMonths(data)}
            onRestart={() => {
              setShowResults(false);
              setStep(0);
            }}
          />
        )}
      </main>
    </div>
  );
}

/* --------------------------- Field primitives --------------------------- */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  suffix,
  min = 0,
  max,
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={Number.isFinite(value) && value !== 0 ? value : ""}
        onChange={(e) => {
          const n = Number(e.target.value) || 0;
          const clamped = Math.max(min, max !== undefined ? Math.min(max, n) : n);
          onChange(clamped);
        }}
        placeholder={placeholder}
        className="ink-border w-full rounded-md bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-trust/40"
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-widest text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}

type Unit = "K" | "L" | "Cr";
const UNIT_MULT: Record<Unit, number> = { K: 1_000, L: 100_000, Cr: 10_000_000 };

function pickUnit(v: number): Unit {
  if (v >= 10_000_000) return "Cr";
  if (v >= 100_000) return "L";
  return "L"; // default to Lakh for INR inputs
}

function CurrencyInput({
  value,
  onChange,
  placeholder,
  defaultUnit = "L",
}: {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  defaultUnit?: Unit;
}) {
  const [unit, setUnit] = useState<Unit>(value > 0 ? pickUnit(value) : defaultUnit);
  const [text, setText] = useState<string>(value > 0 ? String(+(value / UNIT_MULT[unit]).toFixed(4)) : "");

  // Keep text in sync when the raw value changes externally (e.g. reset)
  useEffect(() => {
    if (value === 0) {
      setText("");
      return;
    }
    const shown = +(value / UNIT_MULT[unit]).toFixed(4);
    if (Number(text) !== shown) setText(String(shown));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (nextText: string, nextUnit: Unit) => {
    // strip leading minus signs — currency values can't be negative
    const clean = nextText.replace(/-/g, "");
    setText(clean);
    setUnit(nextUnit);
    const n = Number(clean);
    const safe = Number.isFinite(n) && n > 0 ? n : 0;
    onChange(Math.round(safe * UNIT_MULT[nextUnit]));
  };

  const units: Unit[] = ["K", "L", "Cr"];
  return (
    <div>
      <div className="ink-border flex items-stretch overflow-hidden rounded-md bg-background">
        <span className="flex items-center px-3 text-sm text-muted-foreground">₹</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          value={text}
          onChange={(e) => commit(e.target.value, unit)}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-2.5 text-sm outline-none"
        />
        <div className="flex items-center gap-1 border-l border-border bg-secondary/40 px-2">
          {units.map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => commit(text, u)}
              className={`rounded px-2 py-1 text-[11px] font-medium uppercase tracking-widest transition ${
                unit === u ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {u === "K" ? "Thousand" : u === "L" ? "Lakh" : "Crore"}
            </button>
          ))}
        </div>
      </div>
      {value > 0 && (
        <p className="mt-1 text-[11px] text-muted-foreground">= {inr(value)}</p>
      )}
    </div>
  );
}

function Chip<T extends string>({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ink-border rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function YesNo({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <Chip active={value} onClick={() => onChange(true)}>Yes</Chip>
      <Chip active={!value} onClick={() => onChange(false)}>No</Chip>
    </div>
  );
}

/* --------------------------- Steps --------------------------- */

function StepFamily({ data, set }: StepProps) {
  const emp: EmploymentType[] = ["salaried", "self-employed", "gig", "business"];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Your age" hint="Years">
        <NumberInput value={data.age} onChange={(v) => set("age", v)} placeholder="e.g. 30" min={0} max={100} />
      </Field>
      <Field label="Annual income" hint="Take-home + variable, per year">
        <CurrencyInput value={data.annualIncome} onChange={(v) => set("annualIncome", v)} placeholder="e.g. 12 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Monthly household expenses" hint="Typical spend per month">
        <CurrencyInput value={data.monthlyExpenses} onChange={(v) => set("monthlyExpenses", v)} placeholder="e.g. 50 (Thousand)" defaultUnit="K" />
      </Field>
      <Field label="Employment type">
        <div className="flex flex-wrap gap-2">
          {emp.map((e) => (
            <Chip key={e} active={data.employmentType === e} onClick={() => set("employmentType", e)}>
              {e}
            </Chip>
          ))}
        </div>
      </Field>
      <Field label="Do you have a spouse?">
        <YesNo value={data.spouse} onChange={(v) => set("spouse", v)} />
      </Field>
      <Field label="Number of children" hint="Financially dependent">
        <NumberInput value={data.children} onChange={(v) => set("children", v)} placeholder="0" min={0} max={20} />
      </Field>
      <Field label="Elderly parents dependent on you" hint="Count of parents">
        <NumberInput value={data.elderlyParents} onChange={(v) => set("elderlyParents", v)} placeholder="0" min={0} max={10} />
      </Field>
    </div>
  );
}

function StepProtection({ data, set }: StepProps) {
  const kinds: Array<Assessment["ciKind"]> = ["none", "rider", "standalone", "both"];
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Term insurance cover" hint="Total sum assured (0 if none)">
          <CurrencyInput value={data.termAmount} onChange={(v) => set("termAmount", v)} placeholder="e.g. 1 (Crore)" defaultUnit="Cr" />
        </Field>
        <Field label="Family basic health cover" hint="Base floater sum insured">
          <CurrencyInput value={data.healthBasic} onChange={(v) => set("healthBasic", v)} placeholder="e.g. 5 (Lakh)" defaultUnit="L" />
        </Field>
        <Field label="Super top-up health cover" hint="Above the base cover (0 if none)">
          <CurrencyInput value={data.healthTopUp} onChange={(v) => set("healthTopUp", v)} placeholder="e.g. 25 (Lakh)" defaultUnit="L" />
        </Field>
        <Field label="Critical illness cover" hint="Lump-sum on diagnosis (0 if none)">
          <CurrencyInput value={data.ciAmount} onChange={(v) => set("ciAmount", v)} placeholder="e.g. 25 (Lakh)" defaultUnit="L" />
        </Field>
      </div>
      <Field label="Critical illness structure">
        <div className="flex flex-wrap gap-2">
          {kinds.map((k) => (
            <Chip key={k} active={data.ciKind === k} onClick={() => set("ciKind", k)}>
              {k}
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StepEmergency({ data, set }: StepProps) {
  const stores: Array<{ v: LiquidityStore; label: string }> = [
    { v: "savings", label: "Savings A/C" },
    { v: "fd", label: "Fixed deposits" },
    { v: "liquid_mf", label: "Liquid mutual funds" },
    { v: "mixed", label: "Mixed" },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Emergency fund balance" hint="Money kept aside only for emergencies">
        <CurrencyInput value={data.emergencyFund} onChange={(v) => set("emergencyFund", v)} placeholder="e.g. 3 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Where is it kept?">
        <div className="flex flex-wrap gap-2">
          {stores.map((s) => (
            <Chip key={s.v} active={data.emergencyStore === s.v} onClick={() => set("emergencyStore", s.v)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </Field>
    </div>
  );
}

function StepAssets({ data, set }: StepProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Property — total market value" hint="Real estate you own today">
        <CurrencyInput value={data.propertyValue} onChange={(v) => set("propertyValue", v)} placeholder="e.g. 1 (Crore)" defaultUnit="Cr" />
      </Field>
      <Field label="Property — outstanding loans" hint="Home-loan principal remaining">
        <CurrencyInput value={data.propertyLoan} onChange={(v) => set("propertyLoan", v)} placeholder="e.g. 40 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Savings account balance" hint="Across all bank accounts">
        <CurrencyInput value={data.savingsBalance} onChange={(v) => set("savingsBalance", v)} placeholder="e.g. 2 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Fixed deposits" hint="Total across banks">
        <CurrencyInput value={data.fixedDeposits} onChange={(v) => set("fixedDeposits", v)} placeholder="e.g. 5 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Mutual funds / equity" hint="MFs + direct stocks market value">
        <CurrencyInput value={data.liquidMF} onChange={(v) => set("liquidMF", v)} placeholder="e.g. 10 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="PPF balance" hint="Latest statement value">
        <CurrencyInput value={data.ppf} onChange={(v) => set("ppf", v)} placeholder="e.g. 3 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="NPS / EPF balance" hint="Retirement corpus so far">
        <CurrencyInput value={data.nps} onChange={(v) => set("nps", v)} placeholder="e.g. 4 (Lakh)" defaultUnit="L" />
      </Field>
      <Field label="Other liabilities" hint="Personal, car, credit-card, business loans">
        <CurrencyInput value={data.otherLiabilities} onChange={(v) => set("otherLiabilities", v)} placeholder="e.g. 2 (Lakh)" defaultUnit="L" />
      </Field>
    </div>
  );
}

function StepSavings({ data, set }: StepProps) {
  const setAlloc = (equity: number) => {
    const e = Math.max(0, Math.min(100, equity));
    set("equityPct", e);
    set("debtPct", 100 - e);
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Average monthly savings" hint="Income minus expenses each month">
          <CurrencyInput value={data.monthlySavings} onChange={(v) => set("monthlySavings", v)} placeholder="e.g. 30 (Thousand)" defaultUnit="K" />
        </Field>
        <Field label="Using SIPs / systematic investing?">
          <YesNo value={data.usingSIP} onChange={(v) => set("usingSIP", v)} />
        </Field>
      </div>
      <Field label={`Equity vs debt allocation — Equity ${data.equityPct}% · Debt ${data.debtPct}%`}>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={data.equityPct}
          onChange={(e) => setAlloc(Number(e.target.value))}
          className="w-full accent-[color:var(--trust)]"
        />
        <div className="mt-2 flex justify-between text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>All debt</span>
          <span>Balanced</span>
          <span>All equity</span>
        </div>
      </Field>
    </div>
  );
}

function StepRetirement({ data, set }: StepProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Contributing to NPS?">
        <YesNo value={data.hasNPS} onChange={(v) => set("hasNPS", v)} />
      </Field>
      <Field label="Have EPF (salaried PF)?">
        <YesNo value={data.hasEPF} onChange={(v) => set("hasEPF", v)} />
      </Field>
      <Field label="Personal retirement investments?">
        <YesNo value={data.hasPersonalRetirement} onChange={(v) => set("hasPersonalRetirement", v)} />
      </Field>
      <Field label="Monthly retirement contribution" hint="NPS + EPF + PPF you add each month">
        <CurrencyInput value={data.monthlyRetContribution} onChange={(v) => set("monthlyRetContribution", v)} placeholder="e.g. 10 (Thousand)" defaultUnit="K" />
      </Field>
    </div>
  );
}

function StepHabits({ data, set }: StepProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label="Do you track monthly expenses?"><YesNo value={data.tracksExpenses} onChange={(v) => set("tracksExpenses", v)} /></Field>
      <Field label="Have a household budget?"><YesNo value={data.hasBudget} onChange={(v) => set("hasBudget", v)} /></Field>
      <Field label="Debt-free except a mortgage?"><YesNo value={data.debtFreeExceptMortgage} onChange={(v) => set("debtFreeExceptMortgage", v)} /></Field>
      <Field label="Insurance reviewed in the last year?"><YesNo value={data.insuranceReviewed} onChange={(v) => set("insuranceReviewed", v)} /></Field>
      <Field label="Know your exact insurance coverage?"><YesNo value={data.knowsCoverAccurately} onChange={(v) => set("knowsCoverAccurately", v)} /></Field>
      <Field label="Have a written financial plan?"><YesNo value={data.hasWrittenPlan} onChange={(v) => set("hasWrittenPlan", v)} /></Field>
    </div>
  );
}

interface StepProps {
  data: Assessment;
  set: <K extends keyof Assessment>(k: K, v: Assessment[K]) => void;
}

/* --------------------------- Results --------------------------- */

function statusMeta(s: string) {
  switch (s) {
    case "financially_secure":
      return { label: "Financially Secure", tone: "text-trust", dot: "bg-trust" };
    case "moderately_secure":
      return { label: "Moderately Secure", tone: "text-foreground", dot: "bg-foreground" };
    case "vulnerable":
      return { label: "Vulnerable", tone: "text-warn", dot: "bg-warn" };
    default:
      return { label: "At Risk", tone: "text-warn", dot: "bg-warn" };
  }
}

function Results({
  data,
  scores,
  recs,
  idealMonths,
  onRestart,
}: {
  data: Assessment;
  scores: ReturnType<typeof computeScores>;
  recs: ReturnType<typeof buildRecommendations>;
  idealMonths: number;
  onRestart: () => void;
}) {
  const meta = statusMeta(scores.overallStatus);
  return (
    <div className="space-y-10 animate-fade-in">
      {/* Hero score */}
      <section className="ink-border rounded-lg bg-card p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <ScoreDial value={scores.overall} />
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Your Life Score</p>
            <h2 className="font-display text-3xl leading-tight md:text-5xl">
              {scores.overall.toFixed(1)}<span className="text-muted-foreground text-2xl">/10</span>
            </h2>
            <p className={`mt-2 inline-flex items-center gap-2 text-sm font-medium ${meta.tone}`}>
              <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} /> {meta.label}
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground">
              A composite of protection, emergency resilience, savings growth, retirement and assets — weighted the way a fiduciary would.
            </p>
            <button
              type="button"
              onClick={onRestart}
              className="ink-border mt-6 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-xs font-medium transition hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Retake assessment
            </button>
          </div>
        </div>
      </section>

      {/* Primary 3 scores */}
      <section>
        <SectionTitle eyebrow="Three perspectives" title="How you look from three angles" />
        <div className="grid gap-5 md:grid-cols-3">
          <PrimaryCard icon={<ShieldCheck className="h-5 w-5" />} label="Operational security" hint="Can you handle a shock today?" value={scores.primary.operationalSecurity} tone="trust" />
          <PrimaryCard icon={<TrendingUp className="h-5 w-5" />} label="Wealth accumulation" hint="Are you building wealth?" value={scores.primary.wealthAccumulation} tone="ink" />
          <PrimaryCard icon={<Waves className="h-5 w-5" />} label="Liquidity & flexibility" hint="Can you access funds?" value={scores.primary.liquidityFlexibility} tone="warn" />
        </div>
      </section>

      {/* Category breakdown */}
      <section>
        <SectionTitle eyebrow="Category breakdown" title="Where each dimension lands" />
        <div className="ink-border overflow-hidden rounded-lg bg-card">
          <BarRow label="Protection & insurance" value={scores.categorical.protection} />
          <BarRow label="Emergency resilience" value={scores.categorical.emergency} />
          <BarRow label="Savings & investing growth" value={scores.categorical.savingsGrowth} />
          <BarRow label="Assets & net worth" value={scores.categorical.assets} />
          <BarRow label="Retirement readiness" value={scores.categorical.retirement} last />
        </div>
      </section>

      {/* Subjective dimensions */}
      <section>
        <SectionTitle eyebrow="Behavioural signals" title="Five dimensions beyond the numbers" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <SubDim label="Discipline" value={scores.subjective.discipline} />
          <SubDim label="Knowledge" value={scores.subjective.knowledge} />
          <SubDim label="Resilience" value={scores.subjective.resilience} />
          <SubDim label="Future readiness" value={scores.subjective.futureReadiness} />
          <SubDim label="Protection robustness" value={scores.subjective.protectionRobustness} />
        </div>
      </section>

      {/* Net worth & metrics */}
      <section className="grid gap-5 md:grid-cols-2">
        <div className="ink-border rounded-lg bg-card p-6">
          <SectionTitle eyebrow="Net worth composition" title="Where your money actually sits" small />
          <p className="mb-4 font-display text-2xl">{inr(scores.metrics.netWorth)}</p>
          <StackedBar
            segments={[
              { label: "Liquid", value: scores.metrics.liquidAssets, color: "bg-trust" },
              { label: "Medium-term", value: scores.metrics.mediumTermAssets, color: "bg-foreground" },
              { label: "Long-term", value: scores.metrics.longTermAssets, color: "bg-warn" },
            ]}
          />
          <ul className="mt-4 space-y-1.5 text-sm">
            <LegendRow color="bg-trust" label="Liquid (savings, FD, MF)" value={scores.metrics.liquidAssets} />
            <LegendRow color="bg-foreground" label="Medium-term (PPF, NPS)" value={scores.metrics.mediumTermAssets} />
            <LegendRow color="bg-warn" label="Long-term (property net)" value={scores.metrics.longTermAssets} />
          </ul>
        </div>
        <div className="ink-border rounded-lg bg-card p-6">
          <SectionTitle eyebrow="Key ratios" title="Health metrics that matter" small />
          <ul className="space-y-3 text-sm">
            <MetricRow label="Months of expenses covered" value={`${scores.metrics.monthsCovered.toFixed(1)} / ${idealMonths}`} good={scores.metrics.monthsCovered >= idealMonths} />
            <MetricRow label="Loan-to-asset ratio" value={`${scores.metrics.loanToAssetRatio.toFixed(0)}%`} good={scores.metrics.loanToAssetRatio < 30} />
            <MetricRow label="Debt service burden" value={`${scores.metrics.debtServiceBurden.toFixed(0)}%`} good={scores.metrics.debtServiceBurden < 25} />
            <MetricRow label="Property-to-liquidity ratio" value={`${scores.metrics.propertyToLiquidityRatio.toFixed(1)}:1`} good={scores.metrics.propertyToLiquidityRatio < 3} />
            <MetricRow label="Liquid asset %" value={`${scores.metrics.liquidAssetPct.toFixed(0)}%`} good={scores.metrics.liquidAssetPct > 20} />
          </ul>
        </div>
      </section>

      {/* Recommendations */}
      <section>
        <SectionTitle eyebrow="Your action plan" title="What to fix, in the right order" />
        <div className="space-y-3">
          {recs.length === 0 && (
            <div className="ink-border flex items-center gap-3 rounded-lg bg-card p-5 text-sm">
              <CheckCircle2 className="h-5 w-5 text-trust" />
              You're in solid shape. Retake this every 6-12 months to catch drift.
            </div>
          )}
          {recs.map((r, i) => (
            <RecCard key={i} rec={r} />
          ))}
        </div>
      </section>

      <div className="ink-border rounded-lg bg-secondary/50 p-6 text-center text-sm text-muted-foreground">
        Nothing here is stored or shared. This is a directional snapshot — not financial advice.
        <br />
        Want a human to walk you through it?{" "}
        <Link to="/" hash="pricing" className="font-medium text-trust underline-offset-4 hover:underline">
          See our fee-only plans →
        </Link>
      </div>
    </div>
  );
}

/* --------------------------- Result primitives --------------------------- */

function ScoreDial({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  const tone = value >= 8 ? "var(--trust)" : value >= 6 ? "var(--ink)" : "var(--warn)";
  return (
    <div className="relative h-32 w-32 md:h-40 md:w-40">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl md:text-4xl">{value.toFixed(1)}</span>
        <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">of 10</span>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, small }: { eyebrow: string; title: string; small?: boolean }) {
  return (
    <div className={small ? "mb-4" : "mb-5"}>
      <p className="mb-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
      <h3 className={`font-display leading-tight ${small ? "text-lg md:text-xl" : "text-2xl md:text-3xl"}`}>{title}</h3>
    </div>
  );
}

function PrimaryCard({
  icon,
  label,
  hint,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  value: number;
  tone: "trust" | "ink" | "warn";
}) {
  const bar = tone === "trust" ? "bg-trust" : tone === "warn" ? "bg-warn" : "bg-foreground";
  return (
    <div className="ink-border group rounded-lg bg-card p-5 transition hover:-translate-y-0.5">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-foreground">
        {icon}
      </div>
      <p className="text-sm font-medium">{label}</p>
      <p className="mb-3 text-xs text-muted-foreground">{hint}</p>
      <p className="font-display text-3xl">{value.toFixed(1)}<span className="text-sm text-muted-foreground">/10</span></p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${bar} transition-all duration-700`} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
    </div>
  );
}

function BarRow({ label, value, last }: { label: string; value: number; last?: boolean }) {
  const tone = value >= 7 ? "bg-trust" : value >= 5 ? "bg-foreground" : "bg-warn";
  return (
    <div className={`px-4 py-4 md:px-6 ${last ? "" : "border-b border-border"}`}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{label}</span>
        <span className="font-display text-base">{value.toFixed(1)}<span className="text-xs text-muted-foreground">/10</span></span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${tone} transition-all duration-700`} style={{ width: `${(value / 10) * 100}%` }} />
      </div>
    </div>
  );
}

function SubDim({ label, value }: { label: string; value: number }) {
  return (
    <div className="ink-border rounded-lg bg-card p-4 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}<span className="text-xs text-muted-foreground">/5</span></p>
      <div className="mt-2 flex justify-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-1.5 w-4 rounded-full ${i < value ? "bg-trust" : "bg-secondary"}`} />
        ))}
      </div>
    </div>
  );
}

function StackedBar({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const total = Math.max(1, segments.reduce((s, x) => s + Math.max(0, x.value), 0));
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
      {segments.map((s) => (
        <div key={s.label} className={s.color} style={{ width: `${(Math.max(0, s.value) / total) * 100}%` }} title={s.label} />
      ))}
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        <span className={`inline-block h-2 w-2 rounded-full ${color}`} /> {label}
      </span>
      <span className="font-medium text-foreground">{inr(value)}</span>
    </li>
  );
}

function MetricRow({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-dashed border-border pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${good ? "text-trust" : "text-warn"}`}>{value}</span>
    </li>
  );
}

function RecCard({ rec }: { rec: { priority: string; title: string; detail: string } }) {
  const map: Record<string, { color: string; ring: string; label: string; Icon: React.ComponentType<{ className?: string }> }> = {
    critical: { color: "text-warn", ring: "border-warn/40 bg-warn/5", label: "Critical", Icon: AlertTriangle },
    high: { color: "text-warn", ring: "border-warn/30 bg-warn/5", label: "High", Icon: AlertTriangle },
    medium: { color: "text-foreground", ring: "border-border bg-card", label: "Medium", Icon: TrendingUp },
    optimize: { color: "text-trust", ring: "border-trust/30 bg-trust/5", label: "Optimize", Icon: Sparkles },
  };
  const m = map[rec.priority] ?? map.medium;
  const Icon = m.Icon;
  return (
    <div className={`ink-border rounded-lg p-5 ${m.ring}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-current px-2 py-0.5 text-[10px] uppercase tracking-widest ${m.color}`}>
          <Icon className="h-3 w-3" /> {m.label}
        </span>
      </div>
      <p className="font-display text-lg leading-tight">{rec.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{rec.detail}</p>
    </div>
  );
}

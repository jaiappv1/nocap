import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, ShieldCheck, Zap, IndianRupee,
  Info, X, Award, TrendingUp, Clock, Building2, AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  screen, INSURERS, PLAN_LABELS, PLATFORM_LABELS,
  PLATFORM_COMMISSION_PCT, PLATFORM_PRICE_FACTOR,
  medianCommissionForPlan, inr, inrExact,
  type Insurer, type Platform, type PlanType, type Quote, type ScreenerInput,
} from "@/lib/screener";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/screener")({
  head: () => ({
    meta: [
      { title: "Life Insurance Screener — NoCap" },
      { name: "description", content: "Compare term, ULIP and endowment quotes across insurers and platforms (Policybazaar, Ditto, Bima Sugam, direct). See real commissions and insurer credentials." },
      { property: "og:title", content: "Life Insurance Screener — NoCap" },
      { property: "og:description", content: "One screener. Every insurer. Every platform. Every commission." },
    ],
  }),
  component: ScreenerPage,
});

function ScreenerPage() {
  const [step, setStep] = useState<"input" | "results">("input");
  const [input, setInput] = useState<ScreenerInput>({
    gender: "male",
    age: 30,
    smoker: "no",
    employment: "salaried",
    annualIncome: 12_00_000,
    cover: 1_00_00_000,
    coverTillAge: 65,
    planType: "term",
    payFrequency: "yearly",
  });
  const [openQuote, setOpenQuote] = useState<Quote | null>(null);
  const [openInsurer, setOpenInsurer] = useState<Insurer | null>(null);

  const quotes = useMemo(() => (step === "results" ? screen(input) : []), [input, step]);

  return (
    <main className="min-h-screen bg-secondary/30 text-foreground">
      <TopBar />
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
          <h1 className="mt-3 font-display text-3xl leading-tight md:text-4xl">
            Life Insurance Screener
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            One search. Every top insurer. Every platform — Policybazaar, Ditto,
            Bima Sugam and direct. And the commission each one takes, in rupees.
          </p>
        </div>

        {step === "input" ? (
          <InputForm
            input={input}
            setInput={setInput}
            onSubmit={() => setStep("results")}
          />
        ) : (
          <ResultsView
            input={input}
            quotes={quotes}
            onEdit={() => setStep("input")}
            onOpenQuote={setOpenQuote}
            onOpenInsurer={setOpenInsurer}
          />
        )}
      </div>

      {openQuote && (
        <MetaSearchModal
          quote={openQuote}
          onClose={() => setOpenQuote(null)}
          onOpenInsurer={() => {
            setOpenInsurer(openQuote.insurer);
            setOpenQuote(null);
          }}
        />
      )}
      {openInsurer && (
        <InsurerCredentialsModal insurer={openInsurer} onClose={() => setOpenInsurer(null)} />
      )}
    </main>
  );
}

// ---------- Top bar ----------
function TopBar() {
  return (
    <div className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          NoCap
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-trust" />
          No sign-up. Nothing sold. Zero commissions.
        </div>
      </div>
    </div>
  );
}

// ---------- Input form ----------
function InputForm({
  input, setInput, onSubmit,
}: {
  input: ScreenerInput;
  setInput: (v: ScreenerInput) => void;
  onSubmit: () => void;
}) {
  const set = <K extends keyof ScreenerInput>(k: K, v: ScreenerInput[K]) =>
    setInput({ ...input, [k]: v });

  const coverOptions = [25, 50, 75, 100, 150, 200, 300, 500].map((cr) => cr * 1_00_000);
  const ageOptions = [55, 60, 65, 70, 75, 80, 85];

  return (
    <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
      <div className="rounded-xl border border-border bg-card p-5 md:p-7">
        <h2 className="font-display text-xl">Tell us about you</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          We don't store this. All calculation happens in your browser.
        </p>

        <div className="mt-6 space-y-6">
          <Field label="I am">
            <Segment
              options={[{ v: "male", l: "Male" }, { v: "female", l: "Female" }]}
              value={input.gender}
              onChange={(v) => set("gender", v as "male" | "female")}
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Age">
              <NumberInput
                min={18} max={70}
                value={input.age}
                onChange={(v) => set("age", v)}
                suffix="yrs"
              />
            </Field>
            <Field label="Tobacco / Smoker?">
              <Segment
                options={[{ v: "no", l: "No" }, { v: "yes", l: "Yes" }]}
                value={input.smoker}
                onChange={(v) => set("smoker", v as "yes" | "no")}
              />
            </Field>
          </div>

          <Field label="Employment">
            <Segment
              options={[
                { v: "salaried", l: "Salaried" },
                { v: "self_employed", l: "Self employed" },
              ]}
              value={input.employment}
              onChange={(v) => set("employment", v as "salaried" | "self_employed")}
            />
          </Field>

          <Field label="Annual income (₹)">
            <NumberInput
              value={input.annualIncome}
              onChange={(v) => set("annualIncome", v)}
              step={1_00_000}
              min={0}
              suffix={inr(input.annualIncome)}
            />
          </Field>

          <Field label="Plan type">
            <select
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              value={input.planType}
              onChange={(e) => set("planType", e.target.value as PlanType)}
            >
              {(Object.keys(PLAN_LABELS) as PlanType[]).map((k) => (
                <option key={k} value={k}>{PLAN_LABELS[k]}</option>
              ))}
            </select>
          </Field>

          <Field label="Life cover">
            <div className="flex flex-wrap gap-2">
              {coverOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => set("cover", c)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    input.cover === c
                      ? "border-trust bg-trust text-trust-foreground"
                      : "border-border bg-background hover:border-foreground/40"
                  }`}
                >
                  {inr(c)}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Cover till age">
              <select
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                value={input.coverTillAge}
                onChange={(e) => set("coverTillAge", Number(e.target.value))}
              >
                {ageOptions.map((a) => (
                  <option key={a} value={a}>{a} yrs</option>
                ))}
              </select>
            </Field>
            <Field label="Pay frequency">
              <Segment
                options={[{ v: "yearly", l: "Yearly" }, { v: "monthly", l: "Monthly" }]}
                value={input.payFrequency}
                onChange={(v) => set("payFrequency", v as "yearly" | "monthly")}
              />
            </Field>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <p className="text-xs text-muted-foreground">
            Illustrative quotes based on public IRDAI ranges — not live insurer quotations.
          </p>
          <Button onClick={onSubmit}>
            Show quotes <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-display text-base">
            <Zap className="h-4 w-4 text-trust" /> What makes this different
          </h3>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li>• Same policy, priced across 6 platforms — see the gap.</li>
            <li>• Every quote discloses the distributor's commission in rupees.</li>
            <li>• Insurer credentials: CSR, grievance, solvency, persistency, TAT — 5-year trends.</li>
            <li>• Zero-cost & return-of-premium variants surfaced.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-display text-base">
            <Building2 className="h-4 w-4 text-trust" /> {INSURERS.length} insurers scanned
          </h3>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {INSURERS.map((i) => (
              <InsurerLogo key={i.id} insurer={i} className="h-10" />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function InsurerLogo({ insurer, className = "" }: { insurer: Insurer; className?: string }) {
  if (insurer.logoUrl) {
    return (
      <div className={`flex items-center justify-center rounded-md border border-border bg-white p-1.5 ${className}`}>
        <img
          src={insurer.logoUrl}
          alt={`${insurer.name} logo`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-md text-xs font-bold tracking-tight ${className}`}
      style={{ backgroundColor: insurer.brandBg, color: insurer.brandFg }}
      title={insurer.name}
    >
      {insurer.short}
    </div>
  );
}

function Segment<T extends string>({
  options, value, onChange,
}: {
  options: { v: T; l: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-border bg-background p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded px-3 py-1.5 text-xs transition-colors ${
            value === o.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function NumberInput({
  value, onChange, min, max, step = 1, suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
  suffix?: string;
}) {
  const [buf, setBuf] = useState(String(value));
  // keep buffer in sync when external value changes
  const bufNum = Number(buf);
  if (!isFinite(bufNum) || bufNum !== value) {
    // only reset when parent changed value from elsewhere
    if (String(value) !== buf && document.activeElement?.tagName !== "INPUT") {
      setBuf(String(value));
    }
  }
  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        inputMode="numeric"
        value={buf}
        onChange={(e) => {
          const s = e.target.value.replace(/[^\d]/g, "");
          setBuf(s);
          const n = Number(s);
          if (isFinite(n)) onChange(n);
        }}
        onBlur={() => {
          let n = Number(buf);
          if (!isFinite(n)) n = min ?? 0;
          if (typeof min === "number") n = Math.max(min, n);
          if (typeof max === "number") n = Math.min(max, n);
          setBuf(String(n));
          onChange(n);
        }}
      />
      {suffix && <span className="whitespace-nowrap text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}

// ---------- Results ----------
function ResultsView({
  input, quotes, onEdit, onOpenQuote, onOpenInsurer,
}: {
  input: ScreenerInput;
  quotes: Quote[];
  onEdit: () => void;
  onOpenQuote: (q: Quote) => void;
  onOpenInsurer: (i: Insurer) => void;
}) {
  const cheapestDirect = quotes[0]?.baseAnnualPremium ?? 0;
  const cheapestSugam = quotes[0]
    ? quotes[0].perPlatform.find((p) => p.platform === "bima_sugam")?.premium ?? 0
    : 0;
  const commRange = medianCommissionForPlan(input.planType);

  return (
    <div className="space-y-5">
      <ContextStrip input={input} onEdit={onEdit} />

      <div className="rounded-xl border border-amber-300/60 bg-amber-50/60 p-4 text-xs text-amber-900 md:text-sm">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Typical <strong>{PLAN_LABELS[input.planType]}</strong> pays a Policybazaar/Ditto-style
            distributor <strong>{commRange.yr1}% of Year-1 premium</strong> and {commRange.renewal}%
            on renewals. Cheapest direct quote below: <strong>{inr(cheapestDirect)}/yr</strong>.
            Same policy on <strong>Bima Sugam</strong> (govt exchange, zero commission):{" "}
            <strong>{inr(cheapestSugam)}/yr</strong>.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {quotes.length === 0 && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No insurers currently offer this combination. Try a different plan type.
          </div>
        )}
        {quotes.map((q) => (
          <QuoteCard
            key={q.insurer.id}
            quote={q}
            payFrequency={input.payFrequency}
            onOpen={() => onOpenQuote(q)}
            onOpenInsurer={() => onOpenInsurer(q.insurer)}
          />
        ))}
      </div>
    </div>
  );
}

function ContextStrip({ input, onEdit }: { input: ScreenerInput; onEdit: () => void }) {
  const pill = "rounded-full bg-secondary px-2.5 py-1 text-[11px] text-foreground";
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
      <span className={pill}>{input.gender === "male" ? "Male" : "Female"} · {input.age}y</span>
      <span className={pill}>{input.smoker === "yes" ? "Smoker" : "Non-smoker"}</span>
      <span className={pill}>{input.employment === "salaried" ? "Salaried" : "Self-employed"}</span>
      <span className={pill}>Cover {inr(input.cover)}</span>
      <span className={pill}>Till age {input.coverTillAge}</span>
      <span className={pill}>{PLAN_LABELS[input.planType]}</span>
      <span className={pill}>{input.payFrequency === "yearly" ? "Yearly" : "Monthly"}</span>
      <button
        onClick={onEdit}
        className="ml-auto rounded-md border border-border px-2.5 py-1 text-[11px] hover:bg-secondary"
      >
        Edit details
      </button>
    </div>
  );
}

function QuoteCard({
  quote, payFrequency, onOpen, onOpenInsurer,
}: {
  quote: Quote;
  payFrequency: "yearly" | "monthly";
  onOpen: () => void;
  onOpenInsurer: () => void;
}) {
  const shown = payFrequency === "yearly"
    ? quote.baseAnnualPremium
    : Math.round(quote.baseAnnualPremium / 12);
  const label = payFrequency === "yearly" ? "/yr" : "/mo";

  const bestPlatform = quote.perPlatform.reduce((m, p) => p.premium < m.premium ? p : m, quote.perPlatform[0]);
  const worstPlatform = quote.perPlatform.reduce((m, p) => p.premium > m.premium ? p : m, quote.perPlatform[0]);
  const spread = worstPlatform.premium - bestPlatform.premium;

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <InsurerLogo insurer={quote.insurer} className="h-14 w-24 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className="font-display text-base">{quote.planName}</p>
            {quote.zeroCost && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                Zero-cost variant
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span>Life cover <strong className="text-foreground">{inr(quote.coverAmount)}</strong></span>
            <span>Cover till <strong className="text-foreground">{quote.coverTillAge} yrs</strong></span>
            <span>CSR <strong className="text-foreground">{quote.insurer.credentials.claimSettlementRatio}%</strong></span>
            <span>Grievance <strong className="text-foreground">{quote.insurer.credentials.grievanceRatio}/10K</strong></span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Direct from insurer</p>
          <p className="font-display text-2xl leading-tight text-trust">
            {inrExact(shown)}<span className="text-sm text-muted-foreground">{label}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">across {quote.perPlatform.length} platforms</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
        {quote.perPlatform.map((p) => {
          const val = payFrequency === "yearly" ? p.premium : Math.round(p.premium / 12);
          const isBest = p.platform === bestPlatform.platform;
          return (
            <div
              key={p.platform}
              className={`rounded-md border p-2 text-[11px] ${
                isBest ? "border-trust bg-trust/5" : "border-border bg-background"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-medium text-foreground">{PLATFORM_LABELS[p.platform]}</span>
                {isBest && <span className="text-[9px] font-semibold uppercase text-trust">Best</span>}
              </div>
              <div className="mt-1 font-display text-sm">{inrExact(val)}<span className="text-[10px] text-muted-foreground">{label}</span></div>
              <div className="mt-0.5 text-[10px] text-muted-foreground">
                Commission {inr(p.commission)} · {PLATFORM_COMMISSION_PCT[p.platform]}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 md:flex-row md:items-center md:justify-between">
        <p className="text-[11px] text-muted-foreground">
          Price spread across platforms: <strong className="text-foreground">{inr(spread)}/yr</strong>.
          Same policy — only the distributor's cut differs.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onOpenInsurer}>
            <Award className="h-4 w-4" /> Insurer credentials
          </Button>
          <Button size="sm" onClick={onOpen}>
            Meta-search all platforms <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Modals ----------
function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card px-5 py-4">
          <h3 className="font-display text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function MetaSearchModal({
  quote, onClose, onOpenInsurer,
}: {
  quote: Quote;
  onClose: () => void;
  onOpenInsurer: () => void;
}) {
  const sorted = [...quote.perPlatform].sort((a, b) => a.premium - b.premium);
  const cheapest = sorted[0];
  return (
    <ModalShell title={`${quote.planName} — priced across the market`} onClose={onClose}>
      <div className="mb-4 flex items-center gap-3">
        <InsurerLogo insurer={quote.insurer} className="h-12 w-20" />
        <div className="text-xs text-muted-foreground">
          <p>Cover {inr(quote.coverAmount)} till age {quote.coverTillAge}</p>
          <p>Cheapest route: <strong className="text-foreground">{PLATFORM_LABELS[cheapest.platform]}</strong> at <strong className="text-foreground">{inrExact(cheapest.premium)}/yr</strong></p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Platform</th>
              <th className="px-3 py-2 text-right font-medium">Annual premium</th>
              <th className="px-3 py-2 text-right font-medium">Vs cheapest</th>
              <th className="px-3 py-2 text-right font-medium">Commission</th>
              <th className="px-3 py-2 text-right font-medium">% of premium</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => {
              const diff = p.premium - cheapest.premium;
              return (
                <tr key={p.platform} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">
                    {PLATFORM_LABELS[p.platform]}
                    {p.platform === "bima_sugam" && (
                      <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-700">GOVT</span>
                    )}
                    {p.platform === "insurer_direct" && (
                      <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">DIRECT</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{inrExact(p.premium)}</td>
                  <td className={`px-3 py-2 text-right text-xs ${diff === 0 ? "text-trust" : "text-muted-foreground"}`}>
                    {diff === 0 ? "— cheapest —" : `+${inr(diff)}`}
                  </td>
                  <td className="px-3 py-2 text-right">{inr(p.commission)}</td>
                  <td className="px-3 py-2 text-right text-xs text-muted-foreground">
                    {PLATFORM_COMMISSION_PCT[p.platform]}%
                    <span className="ml-1 text-[10px]">
                      (price ×{PLATFORM_PRICE_FACTOR[p.platform].toFixed(2)})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
        <p>
          <strong>Why prices differ:</strong> IRDAI mandates same-price-across-channels, but displayed
          premiums vary via exclusive discount codes, GST bundling, first-year offers, and bank/agent
          markups. Commission stays with whoever brought you.
        </p>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={onOpenInsurer}>
          <Award className="h-4 w-4" /> See insurer credentials
        </Button>
      </div>
    </ModalShell>
  );
}

function InsurerCredentialsModal({ insurer, onClose }: { insurer: Insurer; onClose: () => void }) {
  const c = insurer.credentials;
  const csrDelta = c.csrTrend[c.csrTrend.length - 1] - c.csrTrend[0];
  const bizDelta = ((c.businessTrend[c.businessTrend.length - 1] / c.businessTrend[0]) - 1) * 100;

  return (
    <ModalShell title={insurer.name} onClose={onClose}>
      <div className="mb-5 flex items-center gap-3">
        <InsurerLogo insurer={insurer} className="h-14 w-24" />
        <div className="text-xs text-muted-foreground">
          <p>Founded {insurer.founded} · {new Date().getFullYear() - insurer.founded} years old</p>
          <p>Annual new-business premium: <strong className="text-foreground">₹{c.annualBusinessCr.toLocaleString("en-IN")} Cr</strong></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Claim Settlement Ratio" value={`${c.claimSettlementRatio}%`} hint="by policy count" />
        <Stat label="Amount Settlement Ratio" value={`${c.claimAmountRatio}%`} hint="₹ paid vs ₹ claimed" />
        <Stat label="Grievance Ratio" value={`${c.grievanceRatio}`} hint="per 10,000 policies" invert />
        <Stat label="Solvency Ratio" value={`${c.solvencyRatio}x`} hint="regulatory min 1.5x" />
        <Stat label="13-month Persistency" value={`${c.persistency13m}%`} hint="renewed after yr 1" />
        <Stat label="61-month Persistency" value={`${c.persistency61m}%`} hint="still active in yr 5" />
        <Stat label="Avg Claim TAT" value={`${c.avgClaimTatDays} days`} hint="approval turnaround" />
        <Stat label="Age" value={`${new Date().getFullYear() - insurer.founded} yrs`} hint={`since ${insurer.founded}`} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <TrendCard
          title="Claim Settlement — last 5 yrs"
          values={c.csrTrend}
          format={(v) => `${v}%`}
          delta={csrDelta}
          deltaLabel={`${csrDelta >= 0 ? "+" : ""}${csrDelta.toFixed(2)}pp`}
        />
        <TrendCard
          title="Annual Business — last 5 yrs (₹ Cr)"
          values={c.businessTrend}
          format={(v) => `${(v / 1000).toFixed(1)}K`}
          delta={bizDelta}
          deltaLabel={`${bizDelta >= 0 ? "+" : ""}${bizDelta.toFixed(0)}%`}
        />
      </div>

      <div className="mt-5 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
        Data compiled from IRDAI Annual Reports, Handbook of Indian Insurance Statistics, and public
        disclosures. Figures are indicative for comparison, not official quotations.
      </div>
    </ModalShell>
  );
}

function Stat({ label, value, hint, invert }: { label: string; value: string; hint: string; invert?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-xl ${invert ? "text-amber-700" : "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function TrendCard({
  title, values, format, delta, deltaLabel,
}: {
  title: string;
  values: number[];
  format: (v: number) => string;
  delta: number;
  deltaLabel: string;
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{title}</p>
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${delta >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          <TrendingUp className="h-3 w-3" />
          {deltaLabel}
        </span>
      </div>
      <div className="mt-3 flex h-20 items-end gap-1.5">
        {values.map((v, i) => {
          const h = 20 + ((v - min) / range) * 60;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-trust/70"
                style={{ height: `${h}%` }}
                title={format(v)}
              />
              <span className="text-[9px] text-muted-foreground">Y{i + 1}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{format(values[0])}</span>
        <span>→ {format(values[values.length - 1])}</span>
      </div>
    </div>
  );
}
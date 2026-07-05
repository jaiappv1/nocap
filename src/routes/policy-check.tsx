import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileSearch,
  Plus,
  Trash2,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Upload,
  Link2,
  Pencil,
  TrendingUp,
  Shield,
  LineChart,
} from "lucide-react";
import {
  analyzePortfolio,
  newPolicy,
  inr,
  PRODUCT_LABELS,
  INTERMEDIARIES,
  providerListForType,
  type Policy,
  type ProductType,
  type CommissionResult,
  type MutualFundBreakdown,
} from "@/lib/policy-check";

export const Route = createFileRoute("/policy-check")({
  head: () => ({
    meta: [
      { title: "Policy Fact-check — See the commission your agent actually earned" },
      {
        name: "description",
        content:
          "A transparent commission calculator for term, endowment, ULIP, health, critical illness, annuity and mutual fund plans in India.",
      },
      { property: "og:title", content: "Policy Fact-check — Commission Transparency" },
      {
        property: "og:description",
        content: "You paid ₹X. Your agent earned ₹Y. Here's exactly how much.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PolicyCheckPage,
});

function PolicyCheckPage() {
  const [mode, setMode] = useState<"insurance" | "mf">("insurance");
  const [policies, setPolicies] = useState<Policy[]>([newPolicy("term")]);
  const [showResults, setShowResults] = useState(false);
  const [aaNotice, setAaNotice] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  const summary = useMemo(() => analyzePortfolio({ policies }), [policies]);

  const update = (id: string, patch: Partial<Policy>) =>
    setPolicies((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id: string) =>
    setPolicies((ps) => (ps.length > 1 ? ps.filter((p) => p.id !== id) : ps));
  const add = () =>
    setPolicies((ps) => [...ps, newPolicy(mode === "mf" ? "mutual_fund" : "term")]);

  const switchMode = (next: "insurance" | "mf") => {
    if (next === mode) return;
    setMode(next);
    setPolicies([newPolicy(next === "mf" ? "mutual_fund" : "term")]);
    setShowResults(false);
  };

  const canRun = policies.every((p) => p.premium > 0 && p.years > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to NoCap
          </Link>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <FileSearch className="h-4 w-4" />
            Policy Fact-check
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-6 md:py-16">
        {!showResults ? (
          <>
            <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
              <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Commission transparency, in rupees
              </p>
              <h1 className="font-display text-3xl leading-tight md:text-5xl">
                You contributed <em className="font-hand not-italic text-trust">₹X</em>.<br />
                Your agent earned <em className="font-hand not-italic text-warn">₹Y</em>.
              </h1>
              <p className="mt-4 text-sm text-muted-foreground md:text-base">
                Add each policy or fund you hold. We estimate agent commission, entry loads and
                fund charges using industry-typical rates — the numbers most brochures leave out.
              </p>
            </div>

            <IntakeOptions
              onUpload={(name) =>
                setUploadNotice(
                  `${name} received. We're not extracting policy data automatically yet — please fill the details below and we'll compute the commission for you.`,
                )
              }
              onAA={() =>
                setAaNotice(
                  "Account Aggregator (Sahamati) fetch is coming soon. For now, add each policy manually below — takes under a minute per policy.",
                )
              }
            />
            {uploadNotice && (
              <p className="mb-4 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground">
                {uploadNotice}
              </p>
            )}
            {aaNotice && (
              <p className="mb-4 rounded-md border border-border bg-secondary/50 px-3 py-2 text-xs text-foreground">
                {aaNotice}
              </p>
            )}

            <ModeSwitcher mode={mode} onChange={switchMode} />

            <div className="space-y-5">
              {policies.map((p, idx) => (
                <PolicyForm
                  key={p.id}
                  index={idx + 1}
                  policy={p}
                  mode={mode}
                  onChange={(patch) => update(p.id, patch)}
                  onRemove={() => remove(p.id)}
                  canRemove={policies.length > 1}
                />
              ))}
            </div>

            <div className="mt-6 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <button
                type="button"
                onClick={add}
                className="ink-border inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
              >
                <Plus className="h-4 w-4" />
                {mode === "mf" ? "Add another fund" : "Add another policy"}
              </button>
              <button
                type="button"
                disabled={!canRun}
                onClick={() => setShowResults(true)}
                className="ink-border inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                Show me the truth
              </button>
            </div>

            <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Estimates use IRDAI-disclosed commission bands and public expense-ratio data. Actual
              commission on your specific policy may vary by ±20% — you can always request the
              exact figure in writing from your agent.
            </p>
          </>
        ) : (
          <ResultsView
            summary={summary}
            onEdit={() => setShowResults(false)}
          />
        )}
      </main>
    </div>
  );
}

/* ---------------- Intake options ---------------- */

function IntakeOptions({
  onUpload,
  onAA,
}: {
  onUpload: (fileName: string) => void;
  onAA: () => void;
}) {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <label className="ink-border group flex cursor-pointer flex-col rounded-lg bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <p className="font-display text-base">Upload policy document</p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, image or spreadsheet of your policy schedule / CAS. We'll pre-fill what we can.
        </p>
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUpload(f.name);
            e.currentTarget.value = "";
          }}
        />
        <span className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
          Choose file →
        </span>
      </label>

      <button
        type="button"
        onClick={onAA}
        className="ink-border group flex flex-col rounded-lg bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground">
          <Link2 className="h-5 w-5" />
        </div>
        <p className="font-display text-base">Fetch via Account Aggregator</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Consent-based pull from Sahamati AA — pulls policies & folios automatically. (Beta)
        </p>
        <span className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
          Connect →
        </span>
      </button>

      <a
        href="#manual"
        className="ink-border group flex flex-col rounded-lg bg-foreground p-5 text-background transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/10 text-background">
          <Pencil className="h-5 w-5" />
        </div>
        <p className="font-display text-base">Enter manually</p>
        <p className="mt-1 text-xs text-background/70">
          Fastest right now — add each policy in ~30 seconds. Fully private, runs in your browser.
        </p>
        <span className="mt-3 text-[11px] uppercase tracking-widest text-background/70 group-hover:text-background">
          Add policy →
        </span>
      </a>
    </div>
  );
}

/* ---------------- Form ---------------- */

function PolicyForm({
  index,
  policy,
  mode,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number;
  policy: Policy;
  mode: "insurance" | "mf";
  onChange: (patch: Partial<Policy>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const isULIP = policy.type === "ulip";
  const isMF = policy.type === "mutual_fund";
  const isAnnuity = policy.type === "annuity";
  const providerList = providerListForType(policy.type);
  const providerLabel = isMF ? "AMC (fund house)" : "Insurer";

  const premiumLabel = isAnnuity
    ? "One-time premium (₹)"
    : isMF
      ? "Annual invested amount (₹)"
      : "Annual premium (₹)";

  return (
    <section id={index === 1 ? "manual" : undefined} className="ink-border rounded-lg bg-card p-5 md:p-6 scroll-mt-24">
      <div className="mb-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          <span className="rounded-sm bg-foreground px-1.5 py-0.5 text-[10px] text-background">
            #{index}
          </span>
          {PRODUCT_LABELS[policy.type]}
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-warn"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nickname (optional)" hint="e.g. 'ICICI Term 2019'">
          <input
            type="text"
            value={policy.nickname}
            onChange={(e) => onChange({ nickname: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
            placeholder="Policy nickname"
          />
        </Field>

        <Field label="Product type" hint="Pick the closest match">
          <select
            value={policy.type}
            onChange={(e) => {
              const t = e.target.value as ProductType;
              onChange({
                type: t,
                expenseRatio: t === "ulip" ? 1.25 : t === "mutual_fund" ? 1.75 : undefined,
                assumedReturn: t === "mutual_fund" ? 10 : t === "ulip" ? 8 : undefined,
                isDirect: t === "mutual_fund" ? false : undefined,
              });
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          >
            {(Object.keys(PRODUCT_LABELS) as ProductType[])
              .filter((k) => (mode === "mf" ? k === "mutual_fund" : k !== "mutual_fund"))
              .map((k) => (
                <option key={k} value={k}>
                  {PRODUCT_LABELS[k]}
                </option>
              ))}
          </select>
        </Field>

        <Field label={providerLabel} hint="Pick from the list, or choose Other">
          <select
            value={providerList.includes(policy.insurer) ? policy.insurer : policy.insurer ? "Other" : ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "Other") {
                if (providerList.includes(policy.insurer)) onChange({ insurer: "" });
              } else {
                onChange({ insurer: v });
              }
            }}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          >
            <option value="">Select {providerLabel.toLowerCase()}…</option>
            {providerList.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="Other">Other</option>
          </select>
          {(policy.insurer === "" || !providerList.includes(policy.insurer) || policy.insurer === "Other") && (
            <input
              type="text"
              value={providerList.includes(policy.insurer) ? "" : policy.insurer}
              onChange={(e) => onChange({ insurer: e.target.value })}
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              placeholder={`Type ${providerLabel.toLowerCase()} name`}
            />
          )}
        </Field>

        <Field label="Bought through (intermediary)" hint="Who sold you this policy?">
          <select
            value={policy.intermediary ?? ""}
            onChange={(e) => onChange({ intermediary: e.target.value })}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
          >
            <option value="">Select intermediary…</option>
            {INTERMEDIARIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>

        <Field
          label={premiumLabel}
          hint={isAnnuity ? "e.g. 50 Lakh lump sum" : "e.g. 15 Thousand"}
        >
          <AmountInput
            value={policy.premium}
            onChange={(v) => onChange({ premium: v })}
          />
        </Field>

        <Field
          label={isAnnuity ? "Expected payout period (years)" : "Years held / planned"}
          hint="How long you've held it (or intend to)"
        >
          <YearsInput value={policy.years} onChange={(y) => onChange({ years: y })} />
        </Field>

        {(isULIP || isMF) && (
          <Field
            label="Expense ratio (% p.a.)"
            hint={isMF ? "Regular plan: 1.5–2.5%. Direct: 0.3–1.0%." : "ULIPs typically 1.0–1.5%"}
          >
            <input
              type="number"
              min={0}
              step="0.05"
              value={policy.expenseRatio ?? ""}
              onChange={(e) => onChange({ expenseRatio: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              placeholder="e.g. 1.75"
            />
          </Field>
        )}

        {isMF && (
          <Field label="Plan type" hint="Direct = no distributor commission">
            <div className="flex gap-2">
              {[
                { v: false, label: "Regular" },
                { v: true, label: "Direct" },
              ].map((o) => (
                <button
                  key={String(o.v)}
                  type="button"
                  onClick={() =>
                    onChange({ isDirect: o.v, expenseRatio: o.v ? 0.75 : 1.75 })
                  }
                  className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                    !!policy.isDirect === o.v
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-secondary"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>
        )}
      </div>
    </section>
  );
}

/* ---------------- Amount input with Thousand / Lakh toggle ---------------- */

type AmountUnit = "K" | "L";
const AMT_MULT: Record<AmountUnit, number> = { K: 1_000, L: 1_00_000 };

function pickAmountUnit(raw: number): AmountUnit {
  if (raw >= 1_00_000) return "L";
  return "K";
}

function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [unit, setUnit] = useState<AmountUnit>(pickAmountUnit(value || 0));
  const [text, setText] = useState<string>(
    value ? String(+(value / AMT_MULT[pickAmountUnit(value)]).toFixed(3)) : "",
  );

  useEffect(() => {
    // if value changes externally, resync
    if (!value) return;
    const u = pickAmountUnit(value);
    setUnit(u);
    setText(String(+(value / AMT_MULT[u]).toFixed(3)));
  }, [value]);

  const commit = (t: string, u: AmountUnit) => {
    setText(t);
    setUnit(u);
    const n = parseFloat(t);
    onChange(Number.isFinite(n) ? Math.max(0, n) * AMT_MULT[u] : 0);
  };

  return (
    <div>
      <div className="flex overflow-hidden rounded-md border border-border bg-background">
        <input
          type="number"
          min={0}
          step="any"
          value={text}
          onChange={(e) => commit(e.target.value, unit)}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none"
          placeholder="e.g. 15"
        />
        <div className="flex shrink-0 border-l border-border">
          {(["K", "L"] as AmountUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => commit(text, u)}
              className={`px-3 text-xs font-medium transition-colors ${
                unit === u
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {u === "K" ? "Thousand" : "Lakh"}
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

/* ---------------- Years input (clamp on blur, not on keystroke) ---------------- */

function YearsInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (y: number) => void;
}) {
  const [text, setText] = useState<string>(value ? String(value) : "");

  useEffect(() => {
    setText(value ? String(value) : "");
  }, [value]);

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={60}
      value={text}
      onChange={(e) => {
        // Free typing: no clamp on every keystroke (that was turning "2" → "25" pain).
        const raw = e.target.value;
        setText(raw);
        const n = parseInt(raw, 10);
        if (Number.isFinite(n)) onChange(Math.max(1, Math.min(60, n)));
      }}
      onBlur={() => {
        const n = parseInt(text, 10);
        const clamped = Number.isFinite(n) ? Math.max(1, Math.min(60, n)) : 1;
        setText(String(clamped));
        onChange(clamped);
      }}
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
      placeholder="e.g. 20"
    />
  );
}

/* ---------------- Mode switcher: Insurance vs Mutual Fund ---------------- */

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: "insurance" | "mf";
  onChange: (m: "insurance" | "mf") => void;
}) {
  const options: Array<{
    key: "insurance" | "mf";
    label: string;
    hint: string;
    Icon: typeof Shield;
  }> = [
    {
      key: "insurance",
      label: "Insurance policies",
      hint: "Term, endowment, ULIP, health, annuity — commission-heavy sales channel.",
      Icon: Shield,
    },
    {
      key: "mf",
      label: "Mutual funds",
      hint: "Regular vs Direct plans. See MFD trail commission + AMC charges separately.",
      Icon: LineChart,
    },
  ];
  return (
    <div className="mb-6">
      <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        What are you fact-checking?
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {options.map(({ key, label, hint, Icon }) => {
          const active = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`ink-border flex items-start gap-3 rounded-lg p-4 text-left transition-all ${
                active
                  ? "bg-foreground text-background"
                  : "bg-card text-foreground hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              <div
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  active ? "bg-background/15 text-background" : "bg-secondary text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="font-display text-base">{label}</p>
                <p
                  className={`mt-0.5 text-xs ${
                    active ? "text-background/70" : "text-muted-foreground"
                  }`}
                >
                  {hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-foreground">{label}</span>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </label>
  );
}

/* ---------------- Results ---------------- */

function ResultsView({
  summary,
  onEdit,
}: {
  summary: ReturnType<typeof analyzePortfolio>;
  onEdit: () => void;
}) {
  const growthPct = Math.round(summary.growthRate * 100);
  return (
    <div className="space-y-10">
      <div className="text-center">
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          Your commission fact-check
        </p>
        <h1 className="font-display text-3xl leading-tight md:text-5xl">
          You paid <span className="font-hand text-trust">{inr(summary.totalPremium)}</span>.
          <br />
          About <span className="font-hand text-warn">{inr(summary.totalCost)}</span> never worked for you.
        </h1>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          That's ₹{Math.round(summary.costPct)} out of every ₹100 you paid — leaked to agent commissions and product charges.
        </p>
      </div>

      {/* Portfolio breakdown card (actual commissions first) */}
      <section className="ink-border rounded-lg bg-card p-5 md:p-8">
        <h2 className="font-display text-xl md:text-2xl">Where your money went</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Across all {summary.results.length} {summary.results.length === 1 ? "policy" : "policies"} you added.
        </p>
        <div className="mt-5 space-y-3">
          <CostRow
            label="Went into your policy / fund"
            hint="The part that actually works for you"
            value={summary.totalPremium - summary.totalCost}
            total={summary.totalPremium}
            tone="trust"
          />
          <CostRow
            label="Paid to your agent / distributor"
            hint="Upfront + trail commission"
            value={summary.explicitCommission}
            total={summary.totalPremium}
            tone="warn"
          />
          {summary.embeddedCost > 0 && (
            <CostRow
              label="Insurer / fund-house charges"
              hint="Fund management, allocation & admin fees baked into the product"
              value={summary.embeddedCost}
              total={summary.totalPremium}
              tone="warn"
            />
          )}
        </div>
      </section>

      {/* Per-policy cards */}
      <div className="space-y-6">
        {summary.results.map(({ policy, result }, i) => (
          <PolicyResultCard key={policy.id} index={i + 1} policy={policy} result={result} />
        ))}
      </div>

      {/* Opportunity-cost / savings card — below actual numbers */}
      {summary.opportunityCost > 0 && (
        <section className="ink-border rounded-lg bg-trust/5 p-5 md:p-8">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-trust/15 text-trust">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                What you could have saved
              </p>
              <p className="mt-1 font-display text-3xl text-trust md:text-4xl">
                Up to {inr(summary.opportunityCost)}
              </p>
              <p className="mt-2 text-sm text-foreground">
                If you'd bought these products <strong>directly</strong> from the insurer / AMC —
                or through <strong>NoCap</strong> — that {inr(summary.totalCost)} in commissions & charges
                could instead have compounded for you at {growthPct}% p.a.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Estimate assumes the leaked amount is spread evenly across the years held and reinvested at {growthPct}% p.a. — a
                long-term equity-style return. Actual savings vary by product and time horizon.
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="ink-border rounded-full bg-background px-5 py-2 text-sm text-foreground hover:bg-secondary"
        >
          Edit inputs
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

function CostRow({
  label,
  hint,
  value,
  total,
  tone,
}: {
  label: string;
  hint?: string;
  value: number;
  total: number;
  tone: "warn" | "trust";
}) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (value / total) * 100)) : 0;
  const barColor = tone === "warn" ? "bg-warn" : "bg-trust";
  const textColor = tone === "warn" ? "text-warn" : "text-trust";
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        <div className="text-right">
          <p className={`font-display text-lg ${textColor}`}>{inr(value)}</p>
          <p className="text-[11px] text-muted-foreground">{pct.toFixed(1)}% of what you paid</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PolicyResultCard({
  index,
  policy,
  result,
}: {
  index: number;
  policy: Policy;
  result: CommissionResult;
}) {
  const [open, setOpen] = useState(false);
  const title = policy.nickname || `${PRODUCT_LABELS[policy.type]}${policy.insurer ? " · " + policy.insurer : ""}`;

  const scoreTone =
    result.transparencyBand === "transparent"
      ? "text-trust"
      : result.transparencyBand === "somewhat"
        ? "text-foreground"
        : "text-warn";

  return (
    <section className="ink-border overflow-hidden rounded-lg bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Policy #{index} · {PRODUCT_LABELS[policy.type]}
          </div>
          <h3 className="mt-0.5 font-display text-lg md:text-xl">{title}</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Transparency
            </p>
            <p className={`font-display text-xl ${scoreTone}`}>
              {result.transparencyScore}/10
            </p>
          </div>
          <span
            className={`hidden rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest md:inline-flex ${
              result.transparencyBand === "transparent"
                ? "border-trust/40 text-trust"
                : result.transparencyBand === "somewhat"
                  ? "border-border text-muted-foreground"
                  : "border-warn/40 text-warn"
            }`}
          >
            {result.transparencyBand === "transparent"
              ? "Transparent"
              : result.transparencyBand === "somewhat"
                ? "Partly transparent"
                : "Opaque"}
          </span>
        </div>
      </header>

      <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
        <Metric label="You paid in total" value={inr(result.totalPremium)} />
        {result.mfDetails ? (
          <Metric
            label={result.mfDetails.isDirect ? "Your corpus at maturity" : "Extra you'd have in Direct"}
            value={inr(result.mfDetails.isDirect ? result.mfDetails.yourCorpus : result.mfDetails.corpusDelta)}
            tone="trust"
            hint={
              result.mfDetails.isDirect
                ? `At ${result.mfDetails.assumedReturnPct}% p.a. assumed return`
                : `Same fund, same manager — just no MFD in the middle`
            }
          />
        ) : (
          <Metric
            label="Could have saved (direct / NoCap route)"
            value={inr(result.opportunityCost)}
            tone="trust"
            hint={`Costs re-compounded at ${Math.round(result.growthRate * 100)}% p.a.`}
          />
        )}
      </div>

      {result.mfDetails && <MutualFundBlock d={result.mfDetails} />}

      <div className="border-t border-border bg-secondary/30 px-5 py-5 md:px-6">
        <p className="mb-3 text-[11px] uppercase tracking-widest text-muted-foreground">
          Cost breakdown
        </p>
        <div className="space-y-3">
          {result.agentCommission > 0 && (
            <CostRow
              label={result.mfDetails ? "MFD (distributor) trail commission" : "Agent / distributor commission"}
              hint={
                result.mfDetails
                  ? `~${result.mfDetails.mfdSharePct}% of the expense ratio — paid to your MFD every year you stay invested`
                  : "What your agent earned from this policy"
              }
              value={result.agentCommission}
              total={result.totalPremium}
              tone="warn"
            />
          )}
          {result.entryLoads > 0 && (
            <CostRow
              label="Allocation & admin charges"
              hint="Deducted before your premium is invested"
              value={result.entryLoads}
              total={result.totalPremium}
              tone="warn"
            />
          )}
          {result.amcCharges > 0 && (
            <CostRow
              label={result.mfDetails ? "AMC (fund-house) charges" : "Fund management charges"}
              hint={
                result.mfDetails
                  ? `~${result.mfDetails.amcSharePct}% of the expense ratio — retained by the AMC to run the fund`
                  : `Ongoing fee deducted from NAV daily, over ${result.yearBreakdown.length} years`
              }
              value={result.amcCharges}
              total={result.totalPremium}
              tone="warn"
            />
          )}
          <div className="border-t border-border pt-3">
            <CostRow
              label={result.mfDetails ? "Total expense-ratio drag" : "Total cost"}
              hint={`${result.costPct.toFixed(1)}% of every rupee`}
              value={result.totalCost}
              total={result.totalPremium}
              tone="warn"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 border-t border-border px-5 py-5 md:grid-cols-2 md:px-6">
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-trust">
            <CheckCircle2 className="h-3.5 w-3.5" />
            What you know
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            {result.whatYouKnow.map((s) => (
              <li key={s} className="leading-relaxed">
                · {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-warn">
            <AlertTriangle className="h-3.5 w-3.5" />
            What you probably weren't told
          </p>
          <ul className="space-y-1.5 text-sm text-foreground">
            {result.whatYouDont.map((s) => (
              <li key={s} className="leading-relaxed">
                · {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {result.vsDirect && (
        <div className="border-t border-dashed border-border bg-trust/5 px-5 py-4 text-sm text-foreground md:px-6">
          <span className="font-hand text-trust">Direct-plan comparison:</span> the same fund in the
          Direct plan would have cost roughly {inr(result.vsDirect.directCost)}. You paid about{" "}
          <strong>{inr(result.vsDirect.extraPaid)}</strong> extra.
        </div>
      )}

      <div className="border-t border-border bg-foreground px-5 py-4 text-sm text-background md:px-6">
        <p className="mb-1 font-hand text-base text-warn">Recommendation</p>
        <p className="leading-relaxed">{result.recommendation}</p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-2 border-t border-border bg-secondary/60 py-2.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
      >
        {open ? "Hide" : "Show"} year-by-year breakdown
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="animate-fade-in overflow-x-auto border-t border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">You paid / invested</th>
                <th className="px-4 py-2">Commission %</th>
                <th className="px-4 py-2 text-right">Went to agent / charges</th>
              </tr>
            </thead>
            <tbody>
              {result.yearBreakdown.map((r) => (
                <tr key={r.year} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{r.year}</td>
                  <td className="px-4 py-2">{inr(r.premium)}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {(r.rate * 100).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2 text-right text-warn">{inr(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "warn" | "trust";
  hint?: string;
}) {
  const color = tone === "warn" ? "text-warn" : tone === "trust" ? "text-trust" : "text-foreground";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ---------------- Mutual-fund detail block ---------------- */

function MutualFundBlock({ d }: { d: MutualFundBreakdown }) {
  const rows: Array<{ label: string; corpus: number; er: number; tone: "trust" | "warn" | "muted" }> = [
    {
      label: `Your plan · ${d.isDirect ? "Direct" : "Regular"} · ${d.effectiveErPct}% ER`,
      corpus: d.yourCorpus,
      er: d.totalErCharged,
      tone: d.isDirect ? "trust" : "warn",
    },
    {
      label: `Direct plan baseline · ${d.directErPct}% ER`,
      corpus: d.directCorpus,
      er: 0,
      tone: "trust",
    },
    {
      label: `Regular plan baseline · ${d.regularErPct}% ER`,
      corpus: d.regularCorpus,
      er: 0,
      tone: "muted",
    },
  ];
  const maxCorpus = Math.max(...rows.map((r) => r.corpus), 1);
  return (
    <div className="border-t border-border bg-secondary/20 px-5 py-5 md:px-6">
      <p className="mb-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        Total AUM at end of {d.years} years
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        SIP of {inr(d.totalInvested / d.years)}/yr for {d.years} yrs at {d.assumedReturnPct}% p.a. assumed return, ER deducted from NAV.
      </p>
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = (r.corpus / maxCorpus) * 100;
          const bar =
            r.tone === "trust" ? "bg-trust" : r.tone === "warn" ? "bg-warn" : "bg-muted-foreground/40";
          const text =
            r.tone === "trust" ? "text-trust" : r.tone === "warn" ? "text-warn" : "text-foreground";
          return (
            <div key={r.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm text-foreground">{r.label}</p>
                <p className={`font-display text-lg ${text}`}>{inr(r.corpus)}</p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {!d.isDirect && d.corpusDelta > 0 && (
        <div className="mt-4 rounded-md border border-trust/30 bg-trust/5 px-3 py-2 text-sm">
          <span className="font-hand text-trust">Direct-plan gap: </span>
          you'd have <strong>{inr(d.corpusDelta)}</strong> more at the end — same fund, same manager, just no MFD in the middle. The {inr(d.totalErCharged)} charged as ER on your Regular plan splits roughly {d.mfdSharePct}% to the distributor ({inr(d.mfdCommission)}) and {d.amcSharePct}% to the AMC ({inr(d.amcRetained)}).
        </div>
      )}
    </div>
  );
}
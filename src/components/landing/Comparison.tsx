import { useState } from "react";
import { ChevronDown } from "lucide-react";
import commissionModel from "@/assets/commission-model.png";
import nocapModel from "@/assets/nocap-model.png";

type Row = {
  scenario: string;
  nocap: string;
  other: string;
  why: string;
};

const rows: Row[] = [
  {
    scenario: "You don't need a policy at all, or just need smaller cover",
    nocap: "We say so!\u00a0 basis your real need.",
    other: "Mostly persuade you to buy, and to buy a bigger cover (fear-first pitch).",
    why: "Zero revenue for a 'don't buy' recommendation. Commission is a % of premium, so a larger cover directly increases their payout.",
  },
  {
    scenario: "The price you actually pay",
    nocap: "Lowest for same product (often ~15% low) as you purchase directly without any commission intermediary via Insurer Site, Bima Sugam (Govt. Portal)",
    other: "Sold through their own channel, not optimised to be your cheapest route.",
    why: "They only earn if the sale is routed through their own platform.",
  },
  {
    scenario: "Which insurer you end up with",
    nocap: "Whichever fits you, full stop.",
    other: "Recommendations can lean toward insurers with stronger partnerships.",
    why: "Commission rates and partner terms vary by insurer.",
  },
  {
    scenario: "Beyond insurance: NPS, EPF, PPF, Bonds, Index Funds",
    nocap: "Recommended whenever they're genuinely better for you.",
    other: "No commission on these; you may just get sold ULIPs and private retirement plans instead.",
    why: "No revenue mechanism exists for recommending non-insurance government / retirement products.",
  },
  {
    scenario: "Staying or switching a plan later",
    nocap: "We tell you what's best for you, either way.",
    other: "Depends on the commission incentives on offer.",
    why: "Trail / renewal commission continues only while the policy stays active.",
  },
  {
    scenario: "Fighting a claim on your behalf",
    nocap: "Zero financial ties to any insurer — nothing holds back an escalation.",
    other: "Paid by the very insurer they'd be escalating against.",
    why: "Structural conflict exists even when an individual advisor personally tries to help.",
  },
  {
    scenario: "How many insurers can actually be picked from",
    nocap: "The whole market.",
    other: "Limited to onboarded insurers & products.",
    why: "The panel is defined by which insurers they've partnered with / registered on.",
  },
  {
    scenario: "Checking in as your life changes",
    nocap: "Ongoing reviews, built into the relationship.",
    other: "Contact usually ends once you've bought.",
    why: "No revenue trigger tied to periodic re-planning.",
  },
];

const INITIAL_ROWS = 4;

export function Comparison() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const visibleRows = expanded ? rows : rows.slice(0, INITIAL_ROWS);

  const toggleButton = rows.length > INITIAL_ROWS && (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      className="ink-border inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {expanded ? "Show less" : "Show more"}
      <ChevronDown
        className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
      />
    </button>
  );

  return (
    <section id="compare" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center md:mb-14">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Where the money actually flows
          </p>
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            One is paid by <em className="font-hand not-italic text-trust">you</em>.
            <br />
            The other is paid by <em className="font-hand not-italic text-warn">insurers</em>.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            How an advisor gets paid quietly decides what they recommend. Not a claim of dishonesty,
            a structural fact about incentives.
          </p>
        </div>

        {/* Money-flow diagram — single unified minimalist SVG */}
        <MoneyFlowDiagram />

        {/* Table heading */}
        <div className="mx-auto mb-6 max-w-2xl text-center md:mb-8">
          <p className="mb-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Scenario-by-scenario
          </p>
          <h3 className="font-display text-2xl leading-tight text-foreground md:text-3xl">
            How the two models play out{" "}
            <span className="font-hand text-trust">in real life</span>.
          </h3>
        </div>

        {/* Comparison table — desktop */}
        <div className="ink-border hidden overflow-hidden rounded-lg bg-card md:block">
          <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr] border-b border-border bg-foreground text-background">
            <div className="px-4 py-3 text-[11px] uppercase tracking-[0.18em]">Scenario</div>
            <div className="px-4 py-3">
              <span className="rounded-sm bg-trust/90 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-background">
                NoCap
              </span>
              <p className="mt-1.5 text-[11px] font-normal normal-case tracking-normal text-background/70">
                Fee-only · paid by you · fiduciary duty
              </p>
            </div>
            <div className="px-4 py-3">
              <span className="text-[11px] uppercase tracking-[0.18em]">Other platforms</span>
              <p className="mt-1.5 text-[11px] font-normal normal-case tracking-normal text-background/70">
                Commission-based · paid by insurers · sales extension
              </p>
            </div>
          </div>
          {visibleRows.map((r, i) => {
            const open = openIdx === i;
            return (
              <div key={r.scenario} className="border-b border-border last:border-b-0">
                <div className="grid grid-cols-[1.2fr_1.4fr_1.4fr] items-start">
                  <div className="px-4 py-4 text-sm font-medium text-foreground">{r.scenario}</div>
                  <div className="bg-trust/5 px-4 py-4 text-sm text-foreground">
                    {r.nocap}
                  </div>
                  <div className="flex items-start gap-3 px-4 py-4 text-sm text-muted-foreground">
                    <span className="flex-1">{r.other}</span>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      aria-expanded={open}
                      className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors ${
                        open
                          ? "border-warn bg-warn text-background"
                          : "border-border text-muted-foreground hover:border-warn hover:text-warn"
                      }`}
                    >
                      Why
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="animate-fade-in border-t border-dashed border-border bg-secondary/60 px-4 py-3">
                    <p className="flex gap-2 text-xs leading-relaxed text-foreground/80">
                      <span className="font-hand text-sm text-warn">Why it happens</span>
                      <span className="text-border">·</span>
                      <span className="flex-1">{r.why}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison — mobile stacked cards */}
        <div className="space-y-4 md:hidden">
          {visibleRows.map((r, i) => {
            const open = openIdx === i;
            return (
              <div key={r.scenario} className="ink-border overflow-hidden rounded-lg bg-card">
                <div className="border-b border-border bg-foreground px-4 py-3 text-sm font-medium text-background">
                  {r.scenario}
                </div>
                <div className="bg-trust/5 px-4 py-3 text-sm text-foreground">
                  <div>
                    <p className="mb-0.5 text-[10px] uppercase tracking-[0.18em] text-trust">NoCap</p>
                    <p>{r.nocap}</p>
                  </div>
                </div>
                <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-warn">
                      Other platforms
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpenIdx(open ? null : i)}
                      aria-expanded={open}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest transition-colors ${
                        open
                          ? "border-warn bg-warn text-background"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      Why
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  <p>{r.other}</p>
                </div>
                {open && (
                  <div className="animate-fade-in border-t border-dashed border-border bg-secondary/60 px-4 py-3">
                    <p className="mb-1 font-hand text-sm text-warn">Why it happens</p>
                    <p className="text-xs leading-relaxed text-foreground/80">{r.why}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Show more/less — below table (mobile + desktop) */}
        {rows.length > INITIAL_ROWS && (
          <div className="mt-6 flex justify-center">{toggleButton}</div>
        )}
      </div>
    </section>
  );
}

function MoneyFlowDiagram() {
  return (
    <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-2 md:gap-8">
      <figure className="group animate-fade-in p-2 md:p-4">
        <figcaption className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-warn">
            The commission model
          </span>
          <span className="rounded-full border border-warn/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-warn">
            Paid by insurers
          </span>
        </figcaption>
        <img
          src={commissionModel}
          alt="Commission model: you pay premium to intermediaries (Policybazaar, Ditto, banks, agents) who earn commission from insurance providers. The more you buy, the bigger their commission."
          className="mx-auto block h-auto w-full transition-transform duration-500 ease-out group-hover:-translate-y-1"
          loading="lazy"
        />
      </figure>
      <figure className="group animate-fade-in p-2 md:p-4">
        <figcaption className="mb-4 flex items-center justify-between gap-3">
          <span className="text-[11px] uppercase tracking-[0.18em] text-trust">
            The NoCap fiduciary model
          </span>
          <span className="rounded-full border border-trust/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-trust">
            Paid by you
          </span>
        </figcaption>
        <img
          src={nocapModel}
          alt="NoCap Fiduciary model: you pay a small fee directly to NoCap, get unbiased advice, and buy the policy directly from the insurer. No commission flows from insurers to NoCap."
          className="mx-auto block h-auto w-full transition-transform duration-500 ease-out group-hover:-translate-y-1"
          loading="lazy"
        />
      </figure>
    </div>
  );
}
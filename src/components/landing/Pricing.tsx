import { Link } from "@tanstack/react-router";

const paths = [
  {
    step: "Path 01",
    name: "The Old Way",
    price: "₹0",
    cadence: "The product pays, not you",
    tagline: "Free advice, commissions embedded into what you buy.\u00a0",
    features: [
      "We get paid commission like others by Insurers, AMCs and Brokers",
      "No fee,\u00a0 biased incentives by design",
    ],
    cta: "Stay default",
    accent: "warn" as const,
  },
  {
    step: "Path 02",
    name: "Protection",
    price: "₹1,000",
    cadence: "EVERY YEAR | ₹2,000 FOR 1ST YEAR",
    tagline: "Fee-only cover so a bad times doesn't wreck your family. Free Intro Call, NoCap",
    features: [
      "Current policy's review",
      "Term Life & Health super top-up\u00a0",
      "NPS · EPF\u00a0·\u00a0Portfolio\u00a0review",
    ],
    cta: "Let's Talk",
    accent: "trust" as const,
    featured: true,
  },
  {
    step: "Path 03",
    name: "Comprehensive Way",
    price: "₹2,000",
    cadence: "EVERY YEAR | ₹4,000 FOR 1ST YEAR",
    tagline: "Everything in Protection + Long Term Investing.\nFree Intro Call",
    features: [
      "Full protection included",
      "Index Funds, Bonds, PPF, SSY, NSC",
      "·\u00a0Employer Cover",
      "Ongoing reviews as life changes",
    ],
    cta: "Let's Talk",
    accent: "ink" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            Three ways forward
          </p>
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            Three ways to think about your money.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            &nbsp;Pick who you want paying us.
          </p>
        </div>

        {/* animated horizontal path */}
        <div className="relative mx-auto mb-10 hidden max-w-5xl md:block" aria-hidden>
          <svg viewBox="0 0 1000 40" className="h-10 w-full">
            <path
              d="M 20 20 Q 250 -10 500 20 T 980 20"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              className="opacity-40"
            />
            {[80, 500, 920].map((cx, i) => (
              <circle
                key={cx}
                cx={cx}
                cy={20}
                r={i === 1 ? 8 : 5}
                fill={i === 0 ? "var(--warn)" : i === 1 ? "var(--trust)" : "var(--ink)"}
                className="animate-float"
                style={{ animationDelay: `${i * 0.6}s` }}
              />
            ))}
          </svg>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {paths.map((t, idx) => {
            const accentText =
              t.accent === "warn"
                ? "text-warn"
                : t.accent === "trust"
                  ? "text-trust"
                  : "text-foreground";
            return (
              <article
                key={t.name}
                className={`ink-border group relative flex flex-col rounded-lg bg-card p-6 transition-all duration-300 hover:-translate-y-1 ${
                  t.featured ? "md:-translate-y-3 md:shadow-[6px_6px_0_0_var(--ink)]" : ""
                }`}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                {t.featured && (
                  <span className="absolute -top-3 left-6 rounded-full border border-trust/50 bg-background px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-trust">
                    Start here
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {t.step}
                </p>
                <p className={`mt-1 font-hand text-3xl ${accentText}`}>{t.name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="font-display text-4xl text-foreground">{t.price}</span>
                </div>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {t.cadence}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-foreground/75">
                  {t.tagline}
                </p>
                <ul className="mt-6 space-y-2 text-sm text-foreground/85">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className={`font-hand ${accentText}`}></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/talk"
                  className={`ink-border mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5 ${
                    t.featured
                      ? "bg-foreground text-background"
                      : "bg-background text-foreground"
                  }`}
                >
                  {t.cta}
                  <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
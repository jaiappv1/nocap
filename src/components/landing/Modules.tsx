import { Filter, Gauge, FileSearch, Coins, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

const modules = [
  {
    name: "Insurance Screener",
    body: "Meta Search across platforms\u00a0 + Insurer performance insights",
    cta: "Screen policies",
    Icon: Filter,
    tint: "#1F6E5E",
    tintBg: "rgba(31,110,94,0.12)",
    href: "/screener",
  },
  {
    name: "Life Score",
    body: "How protected is your family, really? Get the score.",
    cta: "Get my score",
    Icon: Gauge,
    tint: "#274060",
    tintBg: "rgba(39,64,96,0.12)",
    href: "/life-score",
  },
  {
    name: "Policy Fact-check",
    body: "Upload a policy. See the commission your agent pocketed.",
    cta: "Audit my policy",
    Icon: FileSearch,
    tint: "#B23A48",
    tintBg: "rgba(178,58,72,0.12)",
    href: "/policy-check",
  },
  {
    name: "Hidden Money",
    body: "Find forgotten EPF, card policies and pensions in your name.",
    cta: "Find it",
    Icon: Coins,
    tint: "#8A5A00",
    tintBg: "rgba(138,90,0,0.12)",
    href: "/hidden-money",
  },
];

export function Modules() {
  return (
    <section id="tools" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-24">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            See the <span className="font-hand text-trust">truth</span> about your money.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Cut through the noise. Get the facts about your finances.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {modules.map((m) => {
            const { Icon } = m;
            const inner = (
              <>
                <span
                  className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg"
                  style={{ backgroundColor: m.tintBg, color: m.tint }}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="font-display text-lg leading-tight text-foreground md:text-xl">
                  {m.name}
                </h3>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground md:text-sm">
                  {m.body}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
                  {m.cta}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </>
            );
            const className =
              "ink-border group relative flex flex-col rounded-lg bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_var(--ink)]";
            if (m.href.startsWith("/")) {
              return (
                <Link key={m.name} to={m.href} className={className}>
                  {inner}
                </Link>
              );
            }
            return (
              <a key={m.name} href={m.href} className={className}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
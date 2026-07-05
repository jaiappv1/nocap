import commissionImg from "@/assets/contrast-commission.png";
import feeImg from "@/assets/contrast-fee.png";

export function AdviceContrast() {
  return (
    <section id="approach" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            The approach
          </p>
          <h2 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
            When advice is free,{" "}
            <span className="text-warn">you are the product</span>.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <article className="ink-border group relative overflow-hidden rounded-lg bg-card p-6 transition-transform duration-500 hover:-translate-y-1">
            <span className="absolute right-6 top-6 rounded-full border border-warn/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-warn">
              The old way
            </span>
            <img
              src={commissionImg}
              alt="Sketch of commission-driven agents whispering advice while holding commission cards behind a client."
              width={1024}
              height={768}
              loading="lazy"
              className="mx-auto h-56 w-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <h3 className="mt-4 font-display text-2xl text-foreground">
              Commission Agents / Online Platforms
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>· Recommendations follow the biggest commission&nbsp;</li>
              <li>· Sales targets over your financial goals</li>
            </ul>
          </article>
          <article className="ink-border group relative overflow-hidden rounded-lg bg-card p-6 transition-transform duration-500 hover:-translate-y-1">
            <span className="absolute right-6 top-6 rounded-full border border-trust/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-trust">
              THE NEW WAY
            </span>
            <img
              src={feeImg}
              alt="Sketch of a fee-only advisor receiving a small fee from a client, with a sign reading 'No commissions. No sales targets.'"
              width={1024}
              height={768}
              loading="lazy"
              className="mx-auto h-56 w-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <h3 className="mt-4 font-display text-2xl text-foreground">
              Fee-only fiduciary
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>· Zero commissions from Insurers, AMCs or brokers</li>
              <li>· You pay a small, transparent fee, and only you</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
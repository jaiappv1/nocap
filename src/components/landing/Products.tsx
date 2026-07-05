import twoPillarsImg from "@/assets/two-pillars.png.asset.json";

export function Products() {
  return (
    <section id="products" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-20 md:px-6 md:py-24">
        <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            The products we advise on,&nbsp;
            <span className="font-hand text-trust">and why</span>.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            <span className="text-foreground">Protect</span> the downside.{" "}
            <span className="text-foreground">Build</span> the upside.
          </p>
        </div>

        <div className="animate-fade-in">
          <img
            src={twoPillarsImg.url}
            alt="Two pillars of financial security. Pillar one — when tough times come, a safety net: Term Life Insurance, Health Super Top-up, Emergency Fund, Pension & Retirement (NPS), Employee Provident Fund (EPF). Pillar two — for life goals, long-term low-cost low-risk investing: Government Saving Schemes (PPF, SSY, NSC), Index Funds (Indian & Global), ELSS tax-saving mutual funds, Gold & Silver ETFs, Debt Instruments (Govt. and Corporate Bonds)."
            className="mx-auto block h-auto w-full max-w-3xl animate-float"
            loading="lazy"
          />
        </div>

        <p className="mt-10 text-center font-hand text-lg text-trust md:text-xl">
          Live life on your terms.
        </p>
      </div>
    </section>
  );
}
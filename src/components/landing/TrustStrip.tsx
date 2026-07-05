const nos = ["Commissions", "Sales targets", "Product pushing"];

export function TrustStrip() {
  return (
    <section className="border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-[auto_1fr_auto] md:gap-12">
        <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
          {nos.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-2 rounded-full border border-background/25 px-3 py-1.5 text-xs tracking-[0.14em] text-background/85"
            >
              <span aria-hidden className="font-hand text-lg leading-none text-warn">
                ✗
              </span>
              <span className="uppercase">No {t}</span>
            </span>
          ))}
        </div>
        <span aria-hidden className="hidden h-px w-full bg-background/20 md:block" />
        <p className="text-center font-hand text-xl text-warn md:text-right md:text-2xl">
          Just what's right for you.
        </p>
      </div>
    </section>
  );
}
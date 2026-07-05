import heroBuilding from "@/assets/hero-building.png";
import { Link } from "@tanstack/react-router";
import { AppStoreBadge, GooglePlayBadge } from "./StoreBadges";

export function Hero() {

  return (
    <section className="relative overflow-hidden">
      <div className="paper-grain absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.15fr_1fr] md:gap-8 md:pt-24">
        <div className="flex flex-col justify-center">
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-trust" />
            Fee-only · Fiduciary
          </span>
          <h1 className="font-display text-5xl leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Financial security
            <br />
            for <em className="font-hand not-italic text-warn">young India</em>.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            As a fiduciary, we are legally bound to put you first. We earn only when you pay us, never from hidden kickbacks or commissions.
            <br /><br />
            <div className="text-trust font-medium">Securing your financial journey from day one to forever..</div>
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/talk"
              className="ink-border rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
            >
              Let's Talk
            </Link>
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>

        </div>
        <div className="relative flex items-center justify-center">
          <img
            src={heroBuilding}
            alt="Sketch of a five-storey building — Marriage, Children, Home, Travel, Retirement — resting on four labeled pillars: Insurance, Savings, Emergency Funds, Pension. Base reads 'Built on strong financial security.'"
            width={1024}
            height={1024}
            className="relative max-h-[600px] w-auto object-contain animate-float"
          />
        </div>
      </div>
    </section>
  );
}
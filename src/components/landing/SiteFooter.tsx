import { AppStoreBadge, GooglePlayBadge } from "./StoreBadges";

export function SiteFooter() {
  return (

    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold text-foreground">
              NoCap
            </span>
            <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              Fiduciary
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Fee-only, fiduciary, AI-native financial advisory built for young India.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
        </div>

        <FooterCol
          title="Product"
          links={["Approach", "AI Advisor", "Pricing", "Security"]}
        />
        <FooterCol
          title="Company"
          links={["About", "Careers", "Press", "Contact"]}
        />
        <FooterCol
          title="Legal"
          links={["Terms", "Privacy", "SEBI Disclosure", "Grievance"]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} NoCap Fiduciary. All rights reserved.</p>
          <p>SEBI Registered Investment Adviser · Registration under process</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map((l) => (
          <li key={l}>
            <a
              href="#"
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
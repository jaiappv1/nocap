import { Link } from "@tanstack/react-router";

export function NavBar() {
  const links = [
    { label: "Approach", href: "#approach" },
    { label: "Tools", href: "#tools" },
    { label: "AI", href: "#ai" },
    { label: "Pricing", href: "#pricing" },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-foreground">
            NoCap
          </span>
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            Fiduciary
          </span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <a
            href="#login"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Login
          </a>
          <Link
            to="/talk"
            className="ink-border rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
          >
            Talk to us
          </Link>
        </div>
      </div>
    </header>
  );
}
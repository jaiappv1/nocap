import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { NavBar } from "@/components/landing/NavBar";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/talk")({
  head: () => ({
    meta: [
      { title: "Book a Call — NoCap Fiduciary" },
      {
        name: "description",
        content:
          "Book a free 30-minute intro call with NoCap — fee-only, fiduciary advisory for young India.",
      },
      { property: "og:title", content: "Book a Call — NoCap Fiduciary" },
      {
        property: "og:description",
        content: "Free 30-minute intro call. Fee-only, no commissions, no sales targets.",
      },
    ],
  }),
  component: TalkPage,
});

function TalkPage() {
  useEffect(() => {
    const src = "https://assets.calendly.com/assets/external/widget.js";
    if (document.querySelector(`script[src="${src}"]`)) return;
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6 md:py-16">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-trust" />
            Free 30-min intro call
          </span>
          <h1 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
            Let's talk about your <span className="font-hand text-trust">money</span>.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            Pick a time that works. No prep needed, no obligation, no sales pitch.
          </p>
        </div>
        <div
          className="calendly-inline-widget ink-border rounded-lg bg-card"
          data-url="https://calendly.com/nocapfi/30min?hide_gdpr_banner=1&text_color=000000"
          style={{ minWidth: 320, height: 700 }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
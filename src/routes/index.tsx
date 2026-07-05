import { createFileRoute } from "@tanstack/react-router";
import { NavBar } from "@/components/landing/NavBar";
import { Hero } from "@/components/landing/Hero";
import { Comparison } from "@/components/landing/Comparison";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { AiNative } from "@/components/landing/AiNative";
import { Pricing } from "@/components/landing/Pricing";
import { Modules } from "@/components/landing/Modules";
import { Products } from "@/components/landing/Products";
import { AdviceContrast } from "@/components/landing/AdviceContrast";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavBar />
      <main>
        <Hero />
        <Products />
        <AdviceContrast />
        <Comparison />
        <TrustStrip />
        <Modules />
        <AiNative />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
}

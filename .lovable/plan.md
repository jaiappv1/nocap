# NoCap Fiduciary — Landing Page (Initial Segment)

A high-trust, minimalist landing page with a hand-drawn sketch aesthetic inspired by the three reference illustrations. Muted palette (off-white paper, deep navy ink, sage green for "good/trust", muted red for "warning/commission"). Editorial serif display + clean sans body. No gradients, no glassmorphism — think ink-on-paper, thin strokes, subtle textures.

## Sections to build now

1. **Top nav** — wordmark "NoCap" with small "Fiduciary" tag, minimal links (Products, Approach, AI, Pricing, Login), a single ghost CTA "Talk to us".
2. **Hero**
   - Eyebrow: "SEBI-aligned · Fee-only · Fiduciary"
   - H1: "Financial Security for Young India."
   - Sub: One line on fee-only, no-commission, unbiased advisory.
   - Primary CTA "Start your plan" + secondary "How we're different".
   - Right side: sketch-style illustration (generated) echoing the "building of life goals on financial pillars" reference.
3. **The problem vs. the promise** — two side-by-side sketch cards inspired by the two advisor images:
   - Left (muted red accent): "When advice is free, you are the product." Commission-driven agents, hidden incentives.
   - Right (sage green accent): "Fee-only. No commissions. No sales targets." What a true fiduciary looks like.
4. **What we help you build** — the 5 life-goal floors from the building sketch: Marriage, Children, Home, Travel, Retirement. Each a small sketch icon + one line.
5. **Built on a strong financial foundation** — 4 pillars row: Insurance, Savings, Emergency Funds, Pension. Under each, chip list of instruments we advise on: Life Insurance, NPS, PPF, EPF, ELSS, Index Funds, Bonds, Sukanya Samriddhi, NSC.
6. **Fee-only, fiduciary by design** — trust strip: "No commissions · No sales targets · No product pushing · Just what's right for you." Small badge row.
7. **AI-native advisory** (new segment per your notes)
   - Section H2: "Why people open up to AI, not agents."
   - Intro line on judgment-free, incentive-aligned advice.
   - Grid of 8–10 sketch cards, each one point from your list:
     - No human bias on personal questions
     - Comfortable saying "this policy is too expensive"
     - Not built to sell — built to advise
     - Direct and right incentives
     - Unlimited memory of your specifics
     - Available 24/7 when you forget a detail
     - Private — no third person in the room
     - Proprietary access: insurer APIs, AMFI, Account Aggregator
     - Solid information, no misrepresentation
     - Self-learning, gets sharper with you
   - Closing line + CTA "Try the AI advisor".
8. **Footer** — minimal: wordmark, one-liner, columns for Product / Company / Legal, SEBI RIA disclosure placeholder, copyright.

Placeholder copy where specifics (SEBI RIA number, pricing, founder info) aren't known yet — clearly marked so you can fill them in the next prompt.

## Design system (technical)

- Tokens in `src/styles.css` (`@theme` / `:root`, oklch):
  - `--background` warm paper off-white
  - `--foreground` deep ink navy
  - `--primary` deep ink navy
  - `--accent-trust` muted sage green (for fee/fiduciary highlights)
  - `--accent-warn` muted brick red (for commission/warning highlights)
  - `--muted` soft pencil gray
  - `--border` thin ink line
- Typography via `<link>` in `src/routes/__root.tsx`:
  - Display: **Fraunces** (serif, editorial, slight sketch feel)
  - Body: **Inter Tight** or **Geist** (clean, neutral)
  - Register in `@theme` as `--font-display` / `--font-sans`.
- Sketchy feel via: 1px hairline borders, dashed arrows (SVG), subtle paper-grain background (CSS repeating gradient, very low opacity), rounded-but-imperfect card corners, generous whitespace.
- No stock photos. All hero/section illustrations are generated as sketch-style line art (single ink color + one accent), saved to `src/assets/` and imported.

## Technical structure

- Update `src/routes/__root.tsx`: real head metadata (title "NoCap — Fee-only Fiduciary Advisory for Young India", description, og:title/description, twitter card), add Google Fonts `<link>` for Fraunces + Inter Tight.
- Update `src/styles.css`: new light palette (kept dark tokens intact), font-family tokens, sketch utility (`@utility paper-grain`, hairline border variables).
- Replace `src/routes/index.tsx` placeholder with the landing page composition.
- Create small components under `src/components/landing/`:
  - `NavBar.tsx`, `Hero.tsx`, `AdviceContrast.tsx`, `LifeGoals.tsx`, `Foundation.tsx`, `TrustStrip.tsx`, `AiNative.tsx`, `SiteFooter.tsx`.
- Generate 3–4 sketch illustrations (hero, contrast pair, AI section) via `imagegen` in a consistent hand-drawn ink style, saved to `src/assets/`.
- Add `public/llms.txt` and basic SEO tags. No routing beyond `/` for this pass.
- No backend, no forms wired up yet — CTAs are visual only until you specify auth/lead capture in the next prompt.

## Out of scope (for the next prompt)

Pricing page, product deep-dives, onboarding flow, auth, dashboard, AI chat itself, blog, SEBI disclosure copy, team page.

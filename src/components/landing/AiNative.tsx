import aiImg from "@/assets/ai-conversation.png";

const reasons = [
  {
    title: "No judgment\u00a0on the awkward stuff",
    body: "Ask what you'd never ask a person, about income, family, health and get a straight answer.",
  },
  {
    title: "Say 'this feels too expensive'",
    body: "No sales pressure on other side. You can push back honestly and get a cheaper, better option.",
  },
  {
    title: "Actually private",
    body: "No agent, no RM in the middle. Your money story stays yours.\u00a0\u00a0",
  },
  {
    title: "There at 1am & remembers everything",
    body: "Premium due tomorrow? Answer now, not Monday, 10 to 6.\u00a0\nYou never have to re-explain.",
  },
];

export function AiNative() {
  return (
    <section id="ai" className="relative border-t border-border">
      <div className="paper-grain absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
          <div>
            <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              AI-native advisory
            </p>
            <h2 className="font-display text-3xl leading-tight text-foreground md:text-5xl">
              AI first. <span className="font-hand text-trust">Human whenever you want.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              An AI with no sales targets and no memory limits.&nbsp;
              <br />
              A SEBI-registered human, one tap away.&nbsp;
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a
                href="#ai-try"
                className="ink-border rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform hover:-translate-y-0.5"
              >
                Talk to the AI
              </a>
              <span className="font-hand text-base text-muted-foreground md:text-lg">
                private · always on
              </span>
            </div>
          </div>
          <div className="relative">
            <img
              src={aiImg}
              alt="Sketch of a person having a calm, private conversation with an AI orb across a small table."
              width={1024}
              height={768}
              loading="lazy"
              className="relative w-full object-contain animate-float"
            />
          </div>
        </div>

        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <li
              key={r.title}
              className="ink-border relative rounded-lg bg-card p-5 transition-transform hover:-translate-y-1"
            >
              <h3 className="font-display text-lg leading-tight text-foreground">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
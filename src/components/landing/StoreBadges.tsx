export function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://apps.apple.com/in/app/quik-advice/id6755586022"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Download on the App Store"
      className={`ink-border inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M16.365 1.43c0 1.14-.42 2.23-1.24 3.05-.87.91-2.22 1.61-3.34 1.52-.14-1.13.44-2.27 1.2-3.03.86-.9 2.31-1.55 3.38-1.54zM20.5 17.36c-.55 1.27-.82 1.84-1.53 2.96-.99 1.57-2.39 3.53-4.12 3.55-1.54.02-1.94-1-4.03-.99-2.09.01-2.53 1.01-4.07.99-1.73-.03-3.06-1.79-4.05-3.36C.02 16.05-.28 10.9 1.96 8.14c1.32-1.63 3.4-2.59 5.36-2.59 2 0 3.26 1.1 4.91 1.1 1.6 0 2.58-1.1 4.9-1.1 1.74 0 3.58.95 4.9 2.59-4.31 2.36-3.6 8.51-1.53 9.22z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Download on</span>
        <span className="text-xs font-semibold">App Store</span>
      </span>
    </a>
  );
}

export function GooglePlayBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href="https://play.google.com/store/apps/details?id=com.anonymous.jaiai"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Get it on Google Play"
      className={`ink-border inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.25.92-.63 1.19l-2.86 1.66-2.93-2.93 2.93-2.93 2.86 1.66zm-3.35-6.08L6.05 2.66l10.76 6.22-2.27 2.27z" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Get it on</span>
        <span className="text-xs font-semibold">Google Play</span>
      </span>
    </a>
  );
}

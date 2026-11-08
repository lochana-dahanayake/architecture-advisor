import { cn } from "@/lib/utils";

/**
 * The brand mark: a top block resting on two columns, like a building plan seen from the front.
 * Same drawing as `src/app/icon.svg` (the favicon); keep them in sync.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7 shrink-0", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <g className="fill-primary-foreground">
        <rect x="7" y="7" width="18" height="6" rx="1.5" />
        <rect x="7" y="15" width="8" height="10" rx="1.5" />
        <rect x="17" y="15" width="8" height="10" rx="1.5" opacity="0.7" />
      </g>
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <LogoMark />
      Architecture Advisor
    </span>
  );
}

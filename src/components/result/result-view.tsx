"use client";

import {
  ArrowDownUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CompassIcon,
  DownloadIcon,
  FileTextIcon,
  LayersIcon,
  LinkIcon,
  PencilIcon,
  PrinterIcon,
  RotateCcwIcon,
  Share2Icon,
  TriangleAlertIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { kb } from "@/modules/knowledge-base";
import { plainReasons, topPickChange, type AdvisorResult } from "@/modules/recommendation";
import { fitFor } from "@/modules/scoring";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { encodeShareHash } from "@/components/form/share-link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AiPanel, aiAnnouncement } from "./ai-panel";
import { FitBadge } from "./fit";
import { fmt, signed, styleName } from "./format";
import { resultToMarkdown } from "./markdown";
import { RankedList } from "./ranked-list";
import { Adjustments, Excluded, Heads, HowCalculated, Mentions, Patterns } from "./result-details";
import { Section } from "./section";
import { TradeoffTable } from "./tradeoff-table";

function download(text: string, type: string, ext: string, result: AdvisorResult) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `architecture-advice-${result.createdAt.slice(0, 10)}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

const downloadJson = (result: AdvisorResult) =>
  download(JSON.stringify(result, null, 2), "application/json", "json", result);

const downloadMarkdown = (result: AdvisorResult) =>
  download(
    resultToMarkdown(
      result,
      kb,
      `${window.location.origin}${window.location.pathname}${encodeShareHash(result.input)}`,
    ),
    "text/markdown",
    "md",
    result,
  );

/** "Copy link" (FR-37): copies a URL that reopens this rule result; shows the link to copy by hand if the clipboard is blocked. */
function CopyLink({ result }: { result: AdvisorResult }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const url = () => `${window.location.origin}${window.location.pathname}${encodeShareHash(result.input)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url());
      setState("copied");
    } catch {
      setState("failed");
    }
  };
  const hasNotes = result.input.notes.trim() !== "";
  return (
    <>
      <Button variant="ghost" onClick={() => void copy()}>
        <LinkIcon aria-hidden /> {state === "copied" ? "Link copied" : "Copy link"}
      </Button>
      <p className="sr-only" aria-live="polite">
        {state === "copied" ? "Link copied." : ""}
      </p>
      {state !== "idle" && (
        <div className="order-last basis-full space-y-1 text-sm text-muted-foreground">
          {state === "failed" && (
            <label className="block space-y-1">
              <span>Your browser blocked copying. Copy this link instead:</span>
              <input
                readOnly
                value={url()}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-md border bg-background px-2 py-1 font-mono text-xs text-foreground"
              />
            </label>
          )}
          <p>
            Anyone with the link sees this rule-based result; the AI explanation is fetched again.
            {hasNotes && " Your notes are not included in the link."}
          </p>
        </div>
      )}
    </>
  );
}

/**
 * Less-used actions (copy link, JSON, print) behind one toggle, opened inline below the header buttons like the
 * ⓘ tips, so the header leads with the next step and no positioning library is shipped for a menu.
 */
function ShareAndSave({ result }: { result: AdvisorResult }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <Button
        variant="outline"
        className="group"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <Share2Icon aria-hidden /> Share &amp; save
        <ChevronDownIcon className="transition-transform group-aria-expanded:rotate-180" aria-hidden />
      </Button>
      <div id={id} hidden={!open} className="basis-full">
        <div className="flex flex-wrap gap-2 rounded-lg bg-muted/50 p-2">
          <CopyLink result={result} />
          <Button variant="ghost" onClick={() => downloadMarkdown(result)}>
            <FileTextIcon aria-hidden /> Download Markdown
          </Button>
          <Button variant="ghost" onClick={() => downloadJson(result)}>
            <DownloadIcon aria-hidden /> Download JSON
          </Button>
          <Button variant="ghost" onClick={() => window.print()}>
            <PrinterIcon aria-hidden /> Print
          </Button>
        </div>
      </div>
    </>
  );
}

/** "Next best": the #2 and #3 styles right under the top pick, so a close race is visible without scrolling. */
function RunnersUp({ result }: { result: AdvisorResult }) {
  const next = result.final.slice(1, 3);
  if (next.length === 0) return null;
  return (
    <p className="text-sm text-muted-foreground">
      Next best:{" "}
      {next.map((f, i) => (
        <span key={f.styleId}>
          {i > 0 && " · "}#{f.rank} <span className="text-foreground">{styleName(result, f.styleId)}</span>{" "}
          <span className="tabular-nums">{fmt(f.finalScore)}</span>
        </span>
      ))}
      {" · "}
      <a href="#ranked-heading" className="no-print underline underline-offset-4 hover:text-foreground">
        All styles
      </a>
    </p>
  );
}

/** The top pick's final score as a ring in its fit colour, with the number in the middle. */
function ScoreDial({ score }: { score: number }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-28 shrink-0" role="img" aria-label={`Score ${fmt(score)} out of 100`}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className={FIT_STROKE[fitFor(score)]}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className="text-2xl font-semibold tabular-nums">{fmt(score)}</span>
        <span className="text-xs text-muted-foreground">out of 100</span>
      </span>
    </div>
  );
}

const FIT_STROKE = {
  strong: "stroke-fit-strong",
  good: "stroke-fit-good",
  possible: "stroke-fit-possible",
  weak: "stroke-fit-weak",
} as const;

/** "Why this fits": the rule engine's reasons in plain words, shown with or without AI. */
function WhyItFits({ result }: { result: AdvisorResult }) {
  const r = plainReasons(result, kb);
  const name = styleName(result, result.final[0]!.styleId);
  return (
    <Section id="why-heading" title={`Why ${name} fits your project`}>
      <div className="grid gap-4 text-sm lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <ul className="space-y-2.5">
            {r.top.map((t) => (
              <li key={t} className="flex gap-2.5">
                <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-fit-strong" aria-hidden />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          {r.tradeOff && (
            <p className="flex gap-2.5 rounded-lg bg-warning-muted p-3">
              <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
              <span>
                <span className="font-medium">Trade-off: </span>
                {r.tradeOff}
              </span>
            </p>
          )}
        </div>
        {(r.runnerUp || r.ruledOut.length > 0) && (
          <div className="space-y-4 rounded-xl border bg-card p-5">
            {r.runnerUp && (
              <p>
                <span className="font-medium">Why not {styleName(result, r.runnerUp.styleId)} (#2): </span>
                {r.runnerUp.why}
              </p>
            )}
            {r.ruledOut.map((g) => (
              <div key={g.styleIds.join()} className="space-y-2">
                <p className="font-medium">
                  Ruled out:{" "}
                  <span className="sr-only">{g.styleIds.map((id) => styleName(result, id)).join(", ")}.</span>
                </p>
                <ul className="flex flex-wrap gap-1.5" aria-hidden>
                  {g.styleIds.map((id) => (
                    <li
                      key={id}
                      className="rounded-full border border-dashed px-2.5 py-0.5 text-xs text-muted-foreground line-through decoration-muted-foreground/50"
                    >
                      {styleName(result, id)}
                    </li>
                  ))}
                </ul>
                <p className="text-muted-foreground">{g.why}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

/** The companion app (Q2): it takes this result's style as `/advisor?style=<id>` (same style ids as our KB). */
export const TECH_STACK_ADVISOR_URL = "https://tech-stack-advisor-one.vercel.app";

/** "Next step": open Tech Stack Advisor with the recommended style, to pick a language, frameworks, database and host. */
function NextStep({ styleId, name }: { styleId: string; name: string }) {
  return (
    <section
      aria-labelledby="next-step-heading"
      className="no-print flex flex-col gap-4 rounded-2xl border bg-card p-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="space-y-1">
        <h2 id="next-step-heading" className="text-lg font-semibold tracking-tight">
          Next step: choose the tools
        </h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          Tech Stack Advisor, our companion app, recommends a language, frontend, backend, database and hosting that
          work together. It starts with {name} as your architecture style.
        </p>
      </div>
      <Button asChild>
        <a href={`${TECH_STACK_ADVISOR_URL}/advisor?style=${encodeURIComponent(styleId)}`}>
          <LayersIcon aria-hidden /> Open Tech Stack Advisor
        </a>
      </Button>
    </section>
  );
}

export function ResultView({
  result,
  aiPending,
  example,
  onEdit,
  onStartOver,
  onRetryAi,
}: {
  result: AdvisorResult;
  aiPending: boolean;
  /** Set when this result is one of the home page's examples. */
  example?: string;
  onEdit: () => void;
  onStartOver: () => void;
  onRetryAi: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const top = result.final[0]!;
  const topStyle = kb.styles.find((s) => s.id === top.styleId);
  const name = result.snapshot.styles[top.styleId]!.name;
  const change = aiPending ? undefined : topPickChange(result);

  return (
    <article aria-labelledby="result-heading" className="space-y-10">
      {example && (
        <Alert variant="info" className="no-print">
          <CompassIcon aria-hidden />
          <AlertTitle>Example: {example}</AlertTitle>
          <AlertDescription>
            <p>This result comes from ready-made answers. Change them to fit your project, or start from scratch.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={onStartOver}>
                Start my own
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Edit these answers
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      <header className="space-y-5 rounded-2xl border bg-gradient-to-br from-brand-muted via-card to-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col-reverse gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-primary">Top recommendation</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1
                id="result-heading"
                ref={headingRef}
                tabIndex={-1}
                className="text-3xl font-semibold tracking-tight outline-none sm:text-4xl"
              >
                {name}
              </h1>
              <FitBadge fit={fitFor(top.finalScore)} className="bg-background/60" />
            </div>
            {topStyle && <p className="max-w-prose text-muted-foreground">{topStyle.summary}</p>}
            {top.aiDelta !== 0 && (
              <p className="text-sm text-muted-foreground">
                Rule score {fmt(top.ruleScore)} · AI adjustment {signed(top.aiDelta)} · Final {fmt(top.finalScore)}
              </p>
            )}
          </div>
          <ScoreDial score={top.finalScore} />
        </div>
        <RunnersUp result={result} />
        <div className="no-print flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEdit}>
            <PencilIcon aria-hidden /> Edit answers
          </Button>
          <Button variant="outline" onClick={onStartOver}>
            <RotateCcwIcon aria-hidden /> Start over
          </Button>
          <ShareAndSave result={result} />
        </div>
      </header>

      <p className="sr-only" aria-live="polite">
        {aiPending ? "" : [aiAnnouncement(result.ai), change && "AI changed the order."].filter(Boolean).join(" ")}
      </p>

      {change && (
        <Alert variant="info">
          <ArrowDownUpIcon aria-hidden />
          <AlertTitle>AI changed the order</AlertTitle>
          <AlertDescription>
            Our rule engine ranked {styleName(result, change.ruleTop)} first. The AI&apos;s small adjustments (at most 5
            points per style) moved {styleName(result, change.finalTop)} to the top. Both scores are shown below, and
            the AI explanation says why.
          </AlertDescription>
        </Alert>
      )}

      <WhyItFits result={result} />
      <Heads result={result} />

      <Section
        id="ai-heading"
        title="In plain words (AI)"
        description="An optional AI explanation of the ranking. The ranking itself comes from the rules."
      >
        <AiPanel ai={result.ai} pending={aiPending} onRetry={onRetryAi} nameOf={(id) => styleName(result, id)} />
      </Section>

      <Section id="ranked-heading" title="All styles, ranked" description="Bars show the final score out of 100.">
        <RankedList result={result} />
      </Section>

      <Section
        id="tradeoff-heading"
        title="Trade-off comparison"
        description="Straight from our knowledge base: how the leading styles compare on what you said matters."
      >
        <TradeoffTable result={result} />
      </Section>

      <NextStep styleId={top.styleId} name={name} />

      <Patterns result={result} />
      <Mentions result={result} />

      <Collapsible>
        <CollapsibleTrigger className="group flex items-center gap-1 text-lg font-semibold tracking-tight outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <ChevronRightIcon className="size-5 transition-transform group-data-[state=open]:rotate-90" aria-hidden />
          Full scoring details
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-10 pt-3">
          <Adjustments result={result} />
          <Excluded result={result} />
          <HowCalculated result={result} />
        </CollapsibleContent>
      </Collapsible>
    </article>
  );
}

import Link from "next/link";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CircleCheckIcon,
  ListOrderedIcon,
  MessageSquareTextIcon,
  ScaleIcon,
} from "lucide-react";
import { kb } from "@/modules/knowledge-base";
import { fitFor, score } from "@/modules/scoring";
import { presets } from "@/components/form/presets";
import { FIT_BG, FitBadge } from "@/components/result/fit";
import { fmt } from "@/components/result/format";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: MessageSquareTextIcon,
    title: "Describe your project",
    body: "What you're building, your team and budget, and which qualities (like speed, cost or security) matter most. Every question has a “Not sure” option.",
  },
  {
    icon: ListOrderedIcon,
    title: "Get a ranked list",
    body: `All ${kb.styles.length} architecture styles are scored from published ratings and clear rules, with the reasons in plain words.`,
  },
  {
    icon: ScaleIcon,
    title: "Compare the trade-offs",
    body: "A side-by-side table of the top styles on your priorities, plus the patterns that usually go with them.",
  },
];

const stats = [
  { value: kb.styles.length, label: "architecture styles" },
  { value: kb.attributes.length, label: "quality attributes" },
  { value: kb.meta.references.length, label: "published sources" },
  { value: `v${kb.meta.kbVersion}`, label: "knowledge base" },
];

const promises = ["Free, no account", "Same answers, same result", "Works with AI turned off"];

/** A real result for the "Growing SaaS" example, computed at build time by the same engine the advisor uses. */
function ResultPreview() {
  const preset = presets.find((p) => p.id === "saas") ?? presets[0]!;
  const top3 = score(preset.input, kb).ranked.slice(0, 3);
  const name = (id: string) => kb.styles.find((s) => s.id === id)?.name ?? id;
  return (
    <Link
      href={`/advisor?example=${preset.id}`}
      className="group block rounded-2xl border bg-card p-5 shadow-lg shadow-primary/5 outline-none transition-colors hover:border-primary/40 focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <p className="text-xs font-medium text-muted-foreground">
        Example result · <span className="text-foreground">{preset.title}</span>
      </p>
      <ol className="mt-4 space-y-3">
        {top3.map((s, i) => (
          <li key={s.styleId} className="space-y-1.5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className={i === 0 ? "font-semibold" : "text-muted-foreground"}>
                {i + 1}. {name(s.styleId)}
              </span>
              <span className="font-medium tabular-nums">{fmt(s.final)}</span>
            </div>
            <span className="block h-2 rounded-full bg-muted" aria-hidden>
              <span className={`block h-2 rounded-full ${FIT_BG[fitFor(s.final)]}`} style={{ width: `${s.final}%` }} />
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex items-center justify-between gap-3 border-t pt-4">
        <FitBadge fit={fitFor(top3[0]!.final)} />
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          See the full result
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border bg-brand-muted px-3 py-1 text-xs font-medium text-primary">
            <BookOpenIcon className="size-3.5" aria-hidden /> Based on published architecture books
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Which software architecture fits your project?
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Answer a few short questions and get architecture styles, such as modular monolith, microkernel or
            microservices, ranked for your project, with the reasons explained.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              {/* ?new always opens a blank form, even if this tab has answers from earlier. */}
              <Link href="/advisor?new">
                Start a new recommendation <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/methodology">How it works</Link>
            </Button>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {promises.map((p) => (
              <li key={p} className="inline-flex items-center gap-1.5">
                <CircleCheckIcon className="size-4 text-fit-strong" aria-hidden /> {p}
              </li>
            ))}
          </ul>
        </div>
        <ResultPreview />
      </section>

      <section aria-label="What the advice is built on" className="rounded-2xl border bg-muted/30">
        <dl className="grid grid-cols-2 sm:grid-cols-4 sm:divide-x">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center gap-1 px-4 py-5 text-center">
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="text-2xl font-semibold tracking-tight tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="examples" aria-labelledby="examples-heading" className="scroll-mt-6 space-y-5">
        <div className="space-y-1">
          <h2 id="examples-heading" className="text-2xl font-semibold tracking-tight">
            Or explore an example
          </h2>
          <p className="text-muted-foreground">
            Each one opens a finished recommendation. You can change any answer to make it your own.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((p) => (
            <li key={p.id}>
              <Link
                href={`/advisor?example=${p.id}`}
                className="group flex h-full flex-col gap-1.5 rounded-xl border bg-card px-5 py-4 outline-none transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-reduce:hover:translate-y-0"
              >
                <span className="flex items-center justify-between gap-2 font-medium leading-tight">
                  {p.title}
                  <ArrowRightIcon
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </span>
                <span className="text-sm text-muted-foreground">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="space-y-5">
        <h2 id="how-heading" className="text-2xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="space-y-3 rounded-xl border bg-card p-5">
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-muted text-primary">
                  <s.icon className="size-5" aria-hidden />
                </span>
                <span className="text-sm font-medium text-muted-foreground">Step {i + 1}</span>
              </span>
              <h3 className="font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="flex flex-col items-start gap-5 rounded-2xl border bg-gradient-to-br from-brand-muted via-card to-card p-8 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1.5">
          <h2 id="cta-heading" className="text-2xl font-semibold tracking-tight">
            Ready to choose an architecture?
          </h2>
          <p className="text-muted-foreground">
            A few minutes, no account. See{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">
              what is sent where
            </Link>
            .
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/advisor?new">
            Start now <ArrowRightIcon aria-hidden />
          </Link>
        </Button>
      </section>
    </div>
  );
}

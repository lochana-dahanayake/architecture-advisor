import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "What's new",
  description: "Release notes for Architecture Advisor: what changed in each version and why.",
};

/** Release notes in plain words. Keep in step with docs/ROADMAP.md (the v1.x sections). */
const releases = [
  {
    version: "1.5",
    date: "2026-11-09",
    title: "From architecture to tools",
    items: [
      "The result ends with a next step: open Tech Stack Advisor, our companion app, with your recommended style already set, to pick a language, frameworks, database and hosting that work together.",
    ],
  },
  {
    version: "1.4",
    date: "2026-11-08",
    title: "A cleaner, clearer look",
    items: [
      "New logo and colours, a header that stays in view, and a full footer with the app and knowledge-base versions.",
      "The result opens with a summary card: the top style, how well it fits, and its score on a ring.",
      "Reasons, the main trade-off and the ruled-out styles are easier to scan; score bars are coloured by fit.",
      "The home page shows a real example result and what the advice is built on.",
      "Download a result as Markdown to paste into a design document, ADR or pull request.",
    ],
  },
  {
    version: "1.3",
    date: "2026-10-22",
    title: "Easier to use",
    items: [
      "Fewer buttons on the result: Edit answers, Start over, and one Share & save menu.",
      "The #2 and #3 styles are shown right under the top pick.",
      "Step 1 counts your answers and moves you to the next unanswered question.",
    ],
  },
  {
    version: "1.2",
    date: "2026-10-21",
    title: "Clearer first questions",
    items: [
      "“Where will your software run?” now has an example under every option, so a web app isn't mistaken for an installed app.",
      "A warning when an app that runs only on the user's device also has parts with very different needs.",
      "A small team without fast growth whose parts have different needs gets service-based architecture rather than microservices.",
    ],
  },
  {
    version: "1.1",
    date: "2026-10-21",
    title: "Better first steps and plainer reasons",
    items: [
      "Styles are chosen in the order Richards and Ford suggest: what you're building first, then the details.",
      "The advisor opens on a blank form; examples are on the home page.",
      "A plain-language “Why this fits” section comes straight from the rules, with or without AI.",
    ],
  },
  {
    version: "1.0",
    date: "2026-10-21",
    title: "First public release",
    items: [
      "13 architecture styles ranked from published ratings and clear rules, with the reasons shown.",
      "A trade-off table, matching patterns, and an optional AI explanation that can only nudge scores slightly.",
      "Shareable links, JSON download and print.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">What&apos;s new</h1>
        <p className="text-muted-foreground">What changed in each version of Architecture Advisor.</p>
      </header>
      <ol className="relative space-y-10 border-l pl-6">
        {releases.map((r, i) => (
          <li key={r.version} className="relative space-y-3">
            <span
              className={`absolute top-1.5 -left-[31px] size-3 rounded-full border-2 border-background ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`}
              aria-hidden
            />
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                v{r.version}: {r.title}
              </h2>
              {i === 0 && <Badge variant="info">Latest</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">
              <time dateTime={r.date}>{r.date}</time>
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              {r.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

import type { KnowledgeBase } from "@/modules/knowledge-base/schema";
import { plainReasons, type AdvisorResult } from "@/modules/recommendation";
import { fitFor } from "@/modules/scoring";
import { FIT_LABELS, fmt, styleName } from "./format";

/** Table cells can't hold a raw "|" or a line break. */
const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

/**
 * A result as Markdown, for pasting into a design doc, ADR or pull request. Pure: the same result always gives the
 * same text. Like the share link (Q29), it leaves out the free-text notes, since it is made to be passed around.
 */
export function resultToMarkdown(result: AdvisorResult, kb: KnowledgeBase, link?: string): string {
  const top = result.final[0]!;
  const name = (id: string) => styleName(result, id);
  const r = plainReasons(result, kb);
  const summary = kb.styles.find((s) => s.id === top.styleId)?.summary;
  const attrName = (id: string) => kb.attributes.find((a) => a.id === id)?.name ?? id;
  const lines: string[] = [];
  const push = (...l: string[]) => lines.push(...l);

  push(`# Architecture recommendation: ${name(top.styleId)}`, "");
  push(
    `_Architecture Advisor, ${result.createdAt.slice(0, 10)} · app v${result.versions.app} · knowledge base v${result.versions.kb}_`,
    "",
  );
  push(`**${FIT_LABELS[fitFor(top.finalScore)]}, ${fmt(top.finalScore)} out of 100.**`);
  if (summary) push("", summary);
  if (link) push("", `[Open this result](${link})`);

  push("", "## Why it fits", "");
  for (const t of r.top) push(`- ${t}`);
  if (r.tradeOff) push("", `**Trade-off:** ${r.tradeOff}`);
  if (r.runnerUp) push("", `**Why not ${name(r.runnerUp.styleId)} (#2):** ${r.runnerUp.why}`);
  for (const g of r.ruledOut) push("", `**Ruled out:** ${g.styleIds.map(name).join(", ")}. ${g.why}`);

  const ex = result.ai.explanation;
  if (ex) {
    push("", "## In plain words (AI)", "", ex.summary);
    if (ex.cautions.length > 0) {
      push("", "Watch out for:", "");
      for (const c of ex.cautions) push(`- ${c}`);
    }
    if (result.ai.provider)
      push("", `_Explanation by ${result.ai.provider}. The ranking itself comes from the rules._`);
  }

  push("", "## Ranking", "", "| # | Style | Score | Fit |", "|---|---|---|---|");
  for (const f of result.final) {
    push(`| ${f.rank} | ${cell(name(f.styleId))} | ${fmt(f.finalScore)} | ${FIT_LABELS[fitFor(f.finalScore)]} |`);
  }

  const leaders = result.final.slice(0, 3).map((f) => f.styleId);
  if (result.rules.topAttributes.length > 0) {
    push("", "## Trade-offs on your priorities", "", "Ratings from 1 (worst) to 5 (best).", "");
    push(`| Quality | ${leaders.map((id) => cell(name(id))).join(" | ")} |`);
    push(`|---|${leaders.map(() => "---").join("|")}|`);
    for (const a of result.rules.topAttributes) {
      const scores = leaders.map((id) => {
        const s = result.snapshot.styles[id];
        const v = s?.scores[a];
        return v === undefined ? "–" : `${v}/5${s!.estimated.includes(a) ? " (est.)" : ""}`;
      });
      push(`| ${cell(attrName(a))} | ${scores.join(" | ")} |`);
    }
  }

  push(
    "",
    "---",
    "",
    "_Rule-based scores from published architecture books. A starting point for your own judgement, not a substitute for it._",
    "",
  );
  return lines.join("\n");
}

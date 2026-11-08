import { describe, expect, it } from "vitest";
import { kb } from "@/modules/knowledge-base";
import { buildResult, type AiBlock } from "@/modules/recommendation";
import { presets } from "@/components/form/presets";
import { resultToMarkdown } from "@/components/result/markdown";

const ctx = { id: "00000000-0000-4000-8000-000000000000", createdAt: "2026-11-08T00:00:00.000Z", appVersion: "1.4.0" };
const disabled: AiBlock = { status: "disabled", adjustments: [] };
const resultFor = (id: string, notes = "") =>
  buildResult({ ...presets.find((p) => p.id === id)!.input, notes }, kb, ctx, disabled);

describe("resultToMarkdown", () => {
  it("leads with the top pick, its fit and score, and the versions", () => {
    const r = resultFor("saas");
    const md = resultToMarkdown(r, kb);
    const top = r.snapshot.styles[r.final[0]!.styleId]!.name;
    expect(md.startsWith(`# Architecture recommendation: ${top}\n`)).toBe(true);
    expect(md).toContain(`app v1.4.0 · knowledge base v${kb.meta.kbVersion}`);
    expect(md).toMatch(/\*\*(Strong|Good|Possible|Weak) fit, \d+\.\d out of 100\.\*\*/);
  });

  it("lists every ranked style once in the ranking table", () => {
    const r = resultFor("ide");
    const rows = resultToMarkdown(r, kb)
      .split("\n")
      .filter((l) => /^\| \d+ \|/.test(l));
    expect(rows).toHaveLength(r.final.length);
  });

  it("names the ruled-out styles", () => {
    const md = resultToMarkdown(resultFor("ide"), kb);
    expect(md).toMatch(/\*\*Ruled out:\*\* .*Microservices/);
  });

  it("never includes the free-text notes", () => {
    const md = resultToMarkdown(resultFor("student", "secret client name ACME"), kb);
    expect(md).not.toContain("ACME");
  });

  it("adds the link when given, and is deterministic", () => {
    const r = resultFor("ticketing");
    expect(resultToMarkdown(r, kb, "https://example.test/advisor#a=x")).toContain(
      "[Open this result](https://example.test/advisor#a=x)",
    );
    expect(resultToMarkdown(r, kb)).toBe(resultToMarkdown(r, kb));
  });
});

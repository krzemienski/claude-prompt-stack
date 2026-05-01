/**
 * Exercises the SessionStart preloader against the sample skills directory.
 * Confirms always_loaded filtering, alphabetical ordering, bundle rendering,
 * and break-even economics calculations.
 */

import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import {
  approxTokens,
  buildPreloadManifest,
  parseSkillFile,
  preloadStats,
  renderPreloadBundle,
} from "../src/preloader.ts";

const SKILLS = resolve(import.meta.dir, "..", "samples", "skills");

describe("approxTokens", () => {
  it("approximates ~4 chars per token", () => {
    expect(approxTokens("abcd")).toBe(1);
    expect(approxTokens("abcdefgh")).toBe(2);
  });
  it("rounds up partial token", () => {
    expect(approxTokens("abc")).toBe(1);
  });
});

describe("parseSkillFile", () => {
  const skill = parseSkillFile(resolve(SKILLS, "git-master.md"));
  it("extracts name from frontmatter", () => {
    expect(skill.name).toBe("git-master");
  });
  it("marks always_loaded true when frontmatter says true", () => {
    expect(skill.alwaysLoaded).toBe(true);
  });
  it("strips frontmatter from body", () => {
    expect(skill.body.startsWith("# git-master")).toBe(true);
    expect(skill.body.includes("---")).toBe(false);
  });
});

describe("buildPreloadManifest", () => {
  const manifest = buildPreloadManifest(SKILLS);
  it("filters to only always_loaded skills", () => {
    expect(manifest.skills.length).toBe(3);
    const names = manifest.skills.map((s) => s.name);
    expect(names).toContain("functional-validation");
    expect(names).toContain("git-master");
    expect(names).toContain("agent-browser");
    expect(names).not.toContain("evidence-gate");
  });
  it("orders alphabetically for cache prefix stability", () => {
    const names = manifest.skills.map((s) => s.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });
  it("totalTokensApprox matches sum of skill bodies", () => {
    const sum = manifest.skills.reduce((a, s) => a + s.bodyTokensApprox, 0);
    expect(manifest.totalTokensApprox).toBe(sum);
  });
});

describe("buildPreloadManifest (missing dir)", () => {
  const manifest = buildPreloadManifest("/tmp/does-not-exist-cps");
  it("returns empty manifest", () => {
    expect(manifest.skills.length).toBe(0);
    expect(manifest.totalTokensApprox).toBe(0);
  });
});

describe("renderPreloadBundle", () => {
  const manifest = buildPreloadManifest(SKILLS);
  const bundle = renderPreloadBundle(manifest);
  it("includes header with skill count", () => {
    expect(bundle).toContain("preload-bundle: 3 skills");
  });
  it("includes a section per skill", () => {
    expect(bundle).toContain("## Skill: functional-validation");
    expect(bundle).toContain("## Skill: git-master");
    expect(bundle).toContain("## Skill: agent-browser");
  });
});

describe("preloadStats", () => {
  const manifest = buildPreloadManifest(SKILLS);
  const stats = preloadStats(manifest);
  it("returns 3 always-loaded skills", () => {
    expect(stats.skillCount).toBe(3);
  });
  it("estimated creation tokens is 1.25x body tokens", () => {
    expect(stats.estimatedCreationTokens).toBe(Math.ceil(manifest.totalTokensApprox * 1.25));
  });
  it("break-even turns is 2 or 3 (per blog post math)", () => {
    expect(stats.breakEvenTurns).toBeGreaterThanOrEqual(2);
    expect(stats.breakEvenTurns).toBeLessThanOrEqual(3);
  });
});

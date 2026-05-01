/**
 * Exercises the CLI by spawning the bun process with subcommands. Confirms
 * `stack analyze <jsonl>` emits a parseable JSON report on the healthy
 * sample, and `stack init` scaffolds CLAUDE.md + skills + hook into a tmp dir.
 */

import { describe, expect, it } from "bun:test";
import { resolve, join } from "node:path";
import { existsSync, mkdtempSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";

const REPO = resolve(import.meta.dir, "..");
const CLI = resolve(REPO, "src", "cli.ts");
const HEALTHY = resolve(REPO, "samples", "sessions", "healthy-session.jsonl");
const SKILLS = resolve(REPO, "samples", "skills");

async function runCli(args: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  const proc = Bun.spawn(["bun", "run", CLI, ...args], {
    cwd: REPO,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  const code = await proc.exited;
  return { code, stdout, stderr };
}

describe("stack help", () => {
  it("prints usage and exits 0", async () => {
    const r = await runCli(["help"]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain("Usage:");
    expect(r.stdout).toContain("stack analyze");
  });
});

describe("stack analyze (healthy session)", () => {
  it("emits parseable JSON with sessions array", async () => {
    const r = await runCli(["analyze", HEALTHY, "--pretty"]);
    expect(r.code).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(Array.isArray(parsed.sessions)).toBe(true);
    expect(parsed.sessions.length).toBe(1);
    expect(parsed.sessions[0].health).toBe("healthy");
    expect(parsed.sessions[0].turns).toBe(8);
  });
});

describe("stack analyze (corpus dir)", () => {
  it("aggregates all 3 sample sessions", async () => {
    const dir = resolve(REPO, "samples", "sessions");
    const r = await runCli(["analyze", dir]);
    expect(r.code).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.sessions.length).toBe(3);
    expect(parsed.aggregate.sessions).toBe(3);
  });
});

describe("stack analyze (missing path)", () => {
  it("exits non-zero", async () => {
    const r = await runCli(["analyze", "/tmp/does-not-exist-cps-xyz.jsonl"]);
    expect(r.code).not.toBe(0);
    expect(r.stderr).toContain("path not found");
  });
});

describe("stack analyze (missing arg)", () => {
  it("exits 2 with usage error", async () => {
    const r = await runCli(["analyze"]);
    expect(r.code).toBe(2);
  });
});

describe("stack preload", () => {
  it("emits preload stats JSON", async () => {
    const r = await runCli(["preload", SKILLS]);
    expect(r.code).toBe(0);
    const parsed = JSON.parse(r.stdout);
    expect(parsed.stats.skillCount).toBe(3);
    expect(parsed.bundleBytes).toBeGreaterThan(0);
  });
});

describe("stack init", () => {
  it("scaffolds CLAUDE.md + skills + hook into target dir", async () => {
    const tmp = mkdtempSync(join(tmpdir(), "cps-init-"));
    const r = await runCli(["init", "--target", tmp]);
    expect(r.code).toBe(0);
    expect(existsSync(join(tmp, "CLAUDE.md"))).toBe(true);
    expect(existsSync(join(tmp, ".claude", "hooks", "session-start-preload.sh"))).toBe(true);
    expect(existsSync(join(tmp, ".claude", "skills", "functional-validation.md"))).toBe(true);
    expect(existsSync(join(tmp, ".claude", "skills", "git-master.md"))).toBe(true);
    expect(existsSync(join(tmp, ".claude", "skills", "agent-browser.md"))).toBe(true);
    const claudeMd = readFileSync(join(tmp, "CLAUDE.md"), "utf8");
    expect(claudeMd).toContain("cache-stable prefix");
  });
});

describe("stack unknown command", () => {
  it("exits 2 and prints help", async () => {
    const r = await runCli(["nonexistent-subcommand"]);
    expect(r.code).toBe(2);
    expect(r.stderr).toContain("unknown command");
  });
});

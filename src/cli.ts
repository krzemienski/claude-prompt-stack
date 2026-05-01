#!/usr/bin/env bun
/**
 * Bun-based CLI for claude-prompt-stack. Two subcommands: `stack init` (scaffold
 * a CLAUDE.md + skills dir + SessionStart hook into a target project) and
 * `stack analyze` (walk a JSONL session/dir and print a JSON cache-health report).
 */

import { existsSync, mkdirSync, copyFileSync, writeFileSync, statSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeCorpus, analyzeSession } from "./cache-health.ts";
import { buildPreloadManifest, renderPreloadBundle, preloadStats } from "./preloader.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..");

interface Args {
  command: string;
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): Args {
  const [command = "help", ...rest] = argv;
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < rest.length; i++) {
    const tok = rest[i];
    if (tok.startsWith("--")) {
      const eq = tok.indexOf("=");
      if (eq !== -1) {
        flags[tok.slice(2, eq)] = tok.slice(eq + 1);
      } else {
        const next = rest[i + 1];
        if (next && !next.startsWith("--")) {
          flags[tok.slice(2)] = next;
          i++;
        } else {
          flags[tok.slice(2)] = true;
        }
      }
    } else {
      positional.push(tok);
    }
  }
  return { command, positional, flags };
}

export function helpText(): string {
  return [
    "claude-prompt-stack — keep your prompt prefix stable across sessions.",
    "",
    "Usage:",
    "  stack init   [--target <dir>]                Scaffold CLAUDE.md + skills + hook",
    "  stack analyze <jsonl-or-dir> [--pretty]      Print cache-health JSON report",
    "  stack preload <skills-dir> [--out <file>]    Render preload bundle from skills dir",
    "  stack help                                   Show this help",
    "",
  ].join("\n");
}

export function runInit(targetDir: string): { written: string[] } {
  const target = resolve(targetDir);
  if (!existsSync(target)) {
    mkdirSync(target, { recursive: true });
  }
  const skillsTarget = join(target, ".claude", "skills");
  const hooksTarget = join(target, ".claude", "hooks");
  mkdirSync(skillsTarget, { recursive: true });
  mkdirSync(hooksTarget, { recursive: true });

  const templateClaudeMd = join(REPO_ROOT, "templates", "CLAUDE.md");
  const templateHook = join(REPO_ROOT, "hooks", "session-start-preload.sh");
  const fixturesSkillsDir = join(REPO_ROOT, "samples", "skills");

  const written: string[] = [];

  const claudeMdOut = join(target, "CLAUDE.md");
  copyFileSync(templateClaudeMd, claudeMdOut);
  written.push(claudeMdOut);

  const hookOut = join(hooksTarget, "session-start-preload.sh");
  copyFileSync(templateHook, hookOut);
  written.push(hookOut);

  if (existsSync(fixturesSkillsDir)) {
    for (const file of ["functional-validation.md", "git-master.md", "agent-browser.md"]) {
      const src = join(fixturesSkillsDir, file);
      if (existsSync(src)) {
        const dst = join(skillsTarget, file);
        copyFileSync(src, dst);
        written.push(dst);
      }
    }
  }

  return { written };
}

export function runAnalyze(targetPath: string, pretty: boolean): string {
  const resolved = resolve(targetPath);
  if (!existsSync(resolved)) {
    throw new Error(`path not found: ${resolved}`);
  }
  const stat = statSync(resolved);
  const report = stat.isFile()
    ? { sessions: [analyzeSession(resolved)] }
    : analyzeCorpus(resolved);
  return JSON.stringify(report, null, pretty ? 2 : 0);
}

export function runPreload(skillsDir: string, outPath?: string): string {
  const manifest = buildPreloadManifest(resolve(skillsDir));
  const bundle = renderPreloadBundle(manifest);
  const stats = preloadStats(manifest);
  if (outPath) {
    writeFileSync(resolve(outPath), bundle, "utf8");
  }
  return JSON.stringify(
    { stats, bundleBytes: bundle.length, outPath: outPath ?? null },
    null,
    2,
  );
}

export async function main(argv: string[]): Promise<number> {
  const { command, positional, flags } = parseArgs(argv);

  switch (command) {
    case "init": {
      const target = (flags.target as string) ?? positional[0] ?? ".";
      const result = runInit(target);
      console.log(
        JSON.stringify(
          { command: "init", target: resolve(target), written: result.written },
          null,
          2,
        ),
      );
      return 0;
    }
    case "analyze": {
      const target = positional[0];
      if (!target) {
        console.error("error: stack analyze requires a path argument");
        return 2;
      }
      const pretty = flags.pretty === true || flags.pretty === "true";
      try {
        console.log(runAnalyze(target, pretty));
        return 0;
      } catch (err) {
        console.error(`error: ${(err as Error).message}`);
        return 1;
      }
    }
    case "preload": {
      const target = positional[0];
      if (!target) {
        console.error("error: stack preload requires a skills dir argument");
        return 2;
      }
      const outPath = flags.out as string | undefined;
      console.log(runPreload(target, outPath));
      return 0;
    }
    case "help":
    case "--help":
    case "-h":
      console.log(helpText());
      return 0;
    default:
      console.error(`unknown command: ${command}`);
      console.error(helpText());
      return 2;
  }
}

if (import.meta.main) {
  const code = await main(process.argv.slice(2));
  process.exit(code);
}

/**
 * SessionStart preloader. Reads a manifest of "always loaded" skills from a
 * skills directory, concatenates their bodies in stable order, and emits a
 * single preload bundle that gets injected into the prefix on turn 1.
 */

import { readFileSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";

export interface SkillEntry {
  name: string;
  path: string;
  body: string;
  bodyTokensApprox: number;
  alwaysLoaded: boolean;
}

export interface PreloadManifest {
  skills: SkillEntry[];
  totalTokensApprox: number;
  generatedAt: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

export function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function parseSkillFile(path: string): SkillEntry {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(FRONTMATTER_RE);
  let frontmatter = "";
  let body = raw;
  if (match) {
    frontmatter = match[1];
    body = match[2];
  }
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const alwaysMatch = frontmatter.match(/^always_loaded:\s*(true|false)\s*$/im);
  const name = nameMatch ? nameMatch[1].trim() : basename(path, ".md");
  const alwaysLoaded = alwaysMatch ? alwaysMatch[1].toLowerCase() === "true" : false;
  return {
    name,
    path,
    body: body.trim(),
    bodyTokensApprox: approxTokens(body),
    alwaysLoaded,
  };
}

export function buildPreloadManifest(skillsDir: string): PreloadManifest {
  if (!existsSync(skillsDir)) {
    return { skills: [], totalTokensApprox: 0, generatedAt: new Date().toISOString() };
  }
  const entries = readdirSync(skillsDir, { withFileTypes: true });
  const skills: SkillEntry[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const skill = parseSkillFile(join(skillsDir, entry.name));
    if (skill.alwaysLoaded) skills.push(skill);
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  const totalTokensApprox = skills.reduce((a, s) => a + s.bodyTokensApprox, 0);
  return {
    skills,
    totalTokensApprox,
    generatedAt: new Date().toISOString(),
  };
}

export function renderPreloadBundle(manifest: PreloadManifest): string {
  if (manifest.skills.length === 0) {
    return `<!-- preload-bundle: empty (no always_loaded skills) -->\n`;
  }
  const sections = manifest.skills.map((s) => {
    return [
      `<!-- preload:${s.name} (~${s.bodyTokensApprox} tokens) -->`,
      `## Skill: ${s.name}`,
      "",
      s.body,
    ].join("\n");
  });
  const header = [
    `<!-- preload-bundle: ${manifest.skills.length} skills, ~${manifest.totalTokensApprox} tokens -->`,
    `<!-- generated: ${manifest.generatedAt} -->`,
    `<!-- order: stable alphabetical for cache prefix consistency -->`,
  ].join("\n");
  return `${header}\n\n${sections.join("\n\n")}\n`;
}

export function writePreloadBundle(manifest: PreloadManifest, outPath: string): void {
  const bundle = renderPreloadBundle(manifest);
  writeFileSync(outPath, bundle, "utf8");
}

export function preloadStats(manifest: PreloadManifest): {
  skillCount: number;
  alwaysLoaded: string[];
  estimatedCreationTokens: number;
  breakEvenTurns: number;
} {
  const alwaysLoaded = manifest.skills.map((s) => s.name);
  const estimatedCreationTokens = Math.ceil(manifest.totalTokensApprox * 1.25);
  const savingsPerRead = manifest.totalTokensApprox * 0.9;
  const breakEvenTurns = savingsPerRead > 0
    ? Math.ceil(estimatedCreationTokens / savingsPerRead) + 1
    : 0;
  return {
    skillCount: manifest.skills.length,
    alwaysLoaded,
    estimatedCreationTokens,
    breakEvenTurns,
  };
}

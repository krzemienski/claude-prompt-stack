/**
 * Walks a Claude Code JSONL session file and computes cache read ratios.
 * Reads the `usage` block on every assistant turn, sums creation vs read
 * tokens, and emits a per-session report identifying healthy/unhealthy sessions.
 */

import { readFileSync, statSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";

export interface TurnUsage {
  inputTokens: number;
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  outputTokens: number;
}

export interface SessionReport {
  sessionFile: string;
  turns: number;
  creationTotal: number;
  readsTotal: number;
  freshInputTotal: number;
  outputTotal: number;
  readRatio: number;
  medianCreationPerTurn: number;
  health: "healthy" | "mediocre" | "unhealthy" | "empty";
}

export interface CorpusReport {
  sessions: SessionReport[];
  aggregate: {
    sessions: number;
    turns: number;
    creationTotal: number;
    readsTotal: number;
    overallReadRatio: number;
    medianSessionReadRatio: number;
  };
}

const HEALTHY_THRESHOLD = 0.85;
const MEDIOCRE_THRESHOLD = 0.5;

export function parseJsonlLine(line: string): TurnUsage | null {
  if (!line.trim()) return null;
  let msg: any;
  try {
    msg = JSON.parse(line);
  } catch {
    return null;
  }
  if (msg?.type !== "assistant") return null;
  const usage = msg?.message?.usage;
  if (!usage) return null;
  return {
    inputTokens: usage.input_tokens ?? 0,
    cacheCreationInputTokens: usage.cache_creation_input_tokens ?? 0,
    cacheReadInputTokens: usage.cache_read_input_tokens ?? 0,
    outputTokens: usage.output_tokens ?? 0,
  };
}

export function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

export function classifyHealth(readRatio: number, turns: number): SessionReport["health"] {
  if (turns === 0) return "empty";
  if (readRatio >= HEALTHY_THRESHOLD) return "healthy";
  if (readRatio >= MEDIOCRE_THRESHOLD) return "mediocre";
  return "unhealthy";
}

export function analyzeSession(jsonlPath: string): SessionReport {
  const raw = readFileSync(jsonlPath, "utf8");
  const lines = raw.split(/\r?\n/);
  const creation: number[] = [];
  const reads: number[] = [];
  const fresh: number[] = [];
  const output: number[] = [];

  for (const line of lines) {
    const usage = parseJsonlLine(line);
    if (!usage) continue;
    creation.push(usage.cacheCreationInputTokens);
    reads.push(usage.cacheReadInputTokens);
    fresh.push(usage.inputTokens);
    output.push(usage.outputTokens);
  }

  const creationTotal = creation.reduce((a, b) => a + b, 0);
  const readsTotal = reads.reduce((a, b) => a + b, 0);
  const freshInputTotal = fresh.reduce((a, b) => a + b, 0);
  const outputTotal = output.reduce((a, b) => a + b, 0);
  const denom = creationTotal + readsTotal + 1;
  const readRatio = readsTotal / denom;

  return {
    sessionFile: basename(jsonlPath),
    turns: creation.length,
    creationTotal,
    readsTotal,
    freshInputTotal,
    outputTotal,
    readRatio: Number(readRatio.toFixed(4)),
    medianCreationPerTurn: median(creation),
    health: classifyHealth(readRatio, creation.length),
  };
}

export function analyzeCorpus(rootPath: string): CorpusReport {
  const sessions: SessionReport[] = [];
  const stat = statSync(rootPath);

  if (stat.isFile()) {
    sessions.push(analyzeSession(rootPath));
  } else {
    const files = collectJsonl(rootPath);
    for (const file of files) {
      sessions.push(analyzeSession(file));
    }
  }

  const turns = sessions.reduce((a, s) => a + s.turns, 0);
  const creationTotal = sessions.reduce((a, s) => a + s.creationTotal, 0);
  const readsTotal = sessions.reduce((a, s) => a + s.readsTotal, 0);
  const overallReadRatio = readsTotal / (creationTotal + readsTotal + 1);
  const medianSessionReadRatio = median(sessions.map((s) => s.readRatio));

  return {
    sessions,
    aggregate: {
      sessions: sessions.length,
      turns,
      creationTotal,
      readsTotal,
      overallReadRatio: Number(overallReadRatio.toFixed(4)),
      medianSessionReadRatio: Number(medianSessionReadRatio.toFixed(4)),
    },
  };
}

function collectJsonl(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectJsonl(full));
    } else if (entry.isFile() && entry.name.endsWith(".jsonl")) {
      out.push(full);
    }
  }
  return out.sort();
}

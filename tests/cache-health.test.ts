/**
 * Exercises the JSONL cache-health parser against the three sample sessions
 * (healthy, mediocre, unhealthy). Asserts ratios, classifications, and
 * aggregate corpus reports against fully real reads of the sample files.
 */

import { describe, expect, it } from "bun:test";
import { resolve } from "node:path";
import {
  analyzeCorpus,
  analyzeSession,
  classifyHealth,
  median,
  parseJsonlLine,
} from "../src/cache-health.ts";

const SAMPLES = resolve(import.meta.dir, "..", "samples", "sessions");

describe("median", () => {
  it("returns 0 on empty", () => {
    expect(median([])).toBe(0);
  });
  it("returns middle value on odd length", () => {
    expect(median([3, 1, 2])).toBe(2);
  });
  it("averages middle pair on even length", () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe("classifyHealth", () => {
  it("classifies empty as empty", () => {
    expect(classifyHealth(0, 0)).toBe("empty");
  });
  it("classifies >=0.85 as healthy", () => {
    expect(classifyHealth(0.91, 5)).toBe("healthy");
  });
  it("classifies >=0.5 as mediocre", () => {
    expect(classifyHealth(0.62, 5)).toBe("mediocre");
  });
  it("classifies <0.5 as unhealthy", () => {
    expect(classifyHealth(0.1, 5)).toBe("unhealthy");
  });
});

describe("parseJsonlLine", () => {
  it("returns null on blank line", () => {
    expect(parseJsonlLine("   ")).toBeNull();
  });
  it("returns null on malformed JSON", () => {
    expect(parseJsonlLine("not json")).toBeNull();
  });
  it("returns null on user-typed messages", () => {
    expect(parseJsonlLine(JSON.stringify({ type: "user" }))).toBeNull();
  });
  it("extracts usage on assistant turn", () => {
    const line = JSON.stringify({
      type: "assistant",
      message: {
        usage: {
          input_tokens: 10,
          cache_creation_input_tokens: 100,
          cache_read_input_tokens: 200,
          output_tokens: 50,
        },
      },
    });
    const usage = parseJsonlLine(line);
    expect(usage).not.toBeNull();
    expect(usage!.cacheReadInputTokens).toBe(200);
  });
});

describe("analyzeSession (healthy)", () => {
  const report = analyzeSession(resolve(SAMPLES, "healthy-session.jsonl"));
  it("counts 6 turns", () => {
    expect(report.turns).toBe(8);
  });
  it("classifies as healthy", () => {
    expect(report.health).toBe("healthy");
  });
  it("read ratio above 0.85", () => {
    expect(report.readRatio).toBeGreaterThan(0.85);
  });
  it("creation total matches turn 1", () => {
    expect(report.creationTotal).toBe(18394);
  });
});

describe("analyzeSession (unhealthy)", () => {
  const report = analyzeSession(resolve(SAMPLES, "unhealthy-session.jsonl"));
  it("classifies as unhealthy", () => {
    expect(report.health).toBe("unhealthy");
  });
  it("read ratio is 0", () => {
    expect(report.readRatio).toBe(0);
  });
});

describe("analyzeSession (mediocre)", () => {
  const report = analyzeSession(resolve(SAMPLES, "mediocre-session.jsonl"));
  it("classifies as mediocre", () => {
    expect(report.health).toBe("mediocre");
  });
  it("read ratio in 0.5-0.85 band", () => {
    expect(report.readRatio).toBeGreaterThan(0.5);
    expect(report.readRatio).toBeLessThan(0.85);
  });
});

describe("analyzeCorpus", () => {
  const corpus = analyzeCorpus(SAMPLES);
  it("includes all 3 sample sessions", () => {
    expect(corpus.sessions.length).toBe(3);
  });
  it("aggregate has positive reads and creation", () => {
    expect(corpus.aggregate.creationTotal).toBeGreaterThan(0);
    expect(corpus.aggregate.readsTotal).toBeGreaterThan(0);
  });
  it("median session read ratio is finite", () => {
    expect(Number.isFinite(corpus.aggregate.medianSessionReadRatio)).toBe(true);
  });
});

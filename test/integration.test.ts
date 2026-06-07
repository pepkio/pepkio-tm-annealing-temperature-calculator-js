/** Integration tests against live Pepkio Tools API. */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { describe, expect, it } from "vitest";

import { PepkioClient } from "../src/client.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load monorepo .env for local integration runs (never log keys).
const monorepoEnv = resolve(__dirname, "../../../.env");
if (existsSync(monorepoEnv)) {
  loadEnv({ path: monorepoEnv });
}

const packageEnv = resolve(__dirname, "../.env");
if (existsSync(packageEnv)) {
  loadEnv({ path: packageEnv });
}

const ALL_ENVIRONMENTS = [
  { name: "local", baseUrl: "https://tools.localtest.me" },
  { name: "production", baseUrl: "https://tools.pepkio.com" },
] as const;

function environmentsToTest(): (typeof ALL_ENVIRONMENTS)[number][] {
  const override = process.env.PEPKIO_API_BASE_URL?.replace(/\/$/, "");
  if (override) {
    const match = ALL_ENVIRONMENTS.find((env) => env.baseUrl === override);
    if (match) {
      return [match];
    }
    return [{ name: "override" as const, baseUrl: override }];
  }
  return [...ALL_ENVIRONMENTS];
}

function apiKeyFor(baseUrl: string): string | undefined {
  if (baseUrl.includes("localtest.me")) {
    return process.env.LOCAL_PEPKIO_API_KEY ?? process.env.PEPKIO_API_KEY;
  }
  return process.env.PEPKIO_API_KEY;
}

function clientFor(env: { baseUrl: string }): PepkioClient | null {
  const apiKey = apiKeyFor(env.baseUrl);
  if (!apiKey) {
    return null;
  }
  return new PepkioClient({ apiKey, baseUrl: env.baseUrl });
}

describe.each(environmentsToTest())("$name integration", (env) => {
  const client = clientFor(env);
  const maybeIt = client ? it : it.skip;

  maybeIt("fetches manifest", async () => {
    const manifest = await client!.getManifest({ refresh: true });
    expect(manifest.tool_id).toBe("tm-annealing-temperature-calculator");
    const names = await client!.listExamples();
    expect(names).toContain("single_q5_pair");
    expect(names).toContain("batch_multiplex");
    expect(names).toContain("invalid_base_row");
  });

  maybeIt("runs single_q5_pair example", async () => {
    const input = await client!.getExampleInput("single_q5_pair");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.run_id).toBeTruthy();
    expect(result.permalink).toBeTruthy();
    expect(result.result).toBeTruthy();
    expect(result.error).toBeNull();

    const output = result.result as Record<string, unknown>;
    const single = output.single as Record<string, unknown>;
    expect(single.status).toBeDefined();
    expect(typeof single.tm_fwd).toBe("number");
    expect((single.tm_fwd as number)).toBeGreaterThan(50);
  });

  maybeIt("runs batch_multiplex example", async () => {
    const input = await client!.getExampleInput("batch_multiplex");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result).toBeTruthy();

    const output = result.result as Record<string, unknown>;
    const batch = output.batch as Record<string, unknown>[];
    expect(batch.length).toBe(2);
    expect(typeof batch[0].tm_fwd).toBe("number");
    expect((batch[0].tm_fwd as number)).toBeGreaterThan(50);
  });

  maybeIt("runs invalid_base_row example", async () => {
    const input = await client!.getExampleInput("invalid_base_row");
    const result = await client!.run(input);
    expect(result.status).toBe("completed");
    expect(result.result).toBeTruthy();

    const output = result.result as Record<string, unknown>;
    const batch = output.batch as Record<string, unknown>[];
    expect(typeof batch[0].error).toBe("string");
    expect(batch[0].error).toContain("Invalid");
  });
});

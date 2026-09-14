import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read = (rel) => readFileSync(resolve(process.cwd(), rel), "utf8");

const authStoreSrc = read("src/store/authStore.js");
const apiSrc = read("src/services/api.js");

describe("SEC-04 static: no auth token in JS-accessible state", () => {
  it("authStore never stores or reads a refresh token", () => {
    expect(authStoreSrc).not.toMatch(/refreshToken/);
    expect(authStoreSrc).not.toMatch(/accessToken/);
  });

  it("zustand persist partialize excludes any token fields", () => {
    const partialize =
      authStoreSrc.match(/partialize:\s*\(state\)\s*=>\s*\(([^)]*)\)/)?.[1] || "";
    expect(partialize).toMatch(/user/);
    expect(partialize).toMatch(/sessionExpiry/);
    expect(partialize).not.toMatch(/token/);
  });

  it("axios relies on cookies only and never posts a token", () => {
    expect(apiSrc).toMatch(/withCredentials:\s*true/);
    expect(apiSrc).not.toMatch(
      /api\.post\(\s*["']\/api\/v1\/auth\/refresh["']\s*,\s*\{\s*refreshToken/,
    );
    expect(apiSrc).not.toMatch(/getState\(\)\.refreshToken/);
    expect(apiSrc).not.toMatch(/config\.headers\.?\[?["']?Authorization/);
  });

  it("401 -> refresh -> retry race-condition guard is retained", () => {
    expect(apiSrc).toMatch(/_pendingRefresh/);
    expect(apiSrc).toMatch(/originalRequest\._retry = true/);
    expect(apiSrc).toMatch(/api\(originalRequest\)/);
  });
});
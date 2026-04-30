import { describe, it, expect } from "vitest";
import { assertNever, PRIMARY_LANGUAGE_CODE, PRIMARY_SCRIPT } from "../index.js";
import type { ScriptCode } from "../index.js";

describe("ScriptCode constants", () => {
  it("PRIMARY_LANGUAGE_CODE is 'ky'", () => {
    expect(PRIMARY_LANGUAGE_CODE).toBe("ky");
  });

  it("PRIMARY_SCRIPT is 'cyrl'", () => {
    expect(PRIMARY_SCRIPT).toBe("cyrl");
  });

  it("valid ScriptCode values are cyrl, latn, arab", () => {
    const scripts: ScriptCode[] = ["cyrl", "latn", "arab"];
    expect(scripts).toContain("cyrl");
    expect(scripts).toContain("latn");
    expect(scripts).toContain("arab");
  });
});

describe("assertNever", () => {
  it("throws when called with an unhandled value", () => {
    expect(() => assertNever("unexpected" as never)).toThrow("Unhandled value: unexpected");
  });

  it("is useful in switch exhaustiveness — compile-time check", () => {
    // This test just verifies the function exists and throws as designed
    const fn = () => assertNever("test" as never);
    expect(fn).toThrow();
  });
});

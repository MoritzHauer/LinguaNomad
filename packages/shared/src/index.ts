export type ScriptCode = "cyrl" | "latn" | "arab";

export const PRIMARY_LANGUAGE_CODE = "ky";

export const PRIMARY_SCRIPT: ScriptCode = "cyrl";

export function assertNever(value: never): never {
  throw new Error(`Unhandled value: ${String(value)}`);
}
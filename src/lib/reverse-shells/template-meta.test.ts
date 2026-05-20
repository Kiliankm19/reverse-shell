import { describe, expect, it } from "vitest";
import {
  getConnectionModeById,
  supportsStageFile,
  supportsHttpServerNotes,
  usesBindPortOnly,
  usesCallbackHost,
  usesShellInput,
} from "./template-meta";

describe("getConnectionModeById", () => {
  it("classifies reverse shells", () => {
    expect(getConnectionModeById("bash-dev-tcp")).toBe("reverse");
    expect(usesCallbackHost("reverse")).toBe(true);
  });

  it("classifies bind shells", () => {
    expect(getConnectionModeById("nc-bind-e")).toBe("bind");
    expect(usesBindPortOnly("bind")).toBe(true);
  });

  it("classifies staged payloads", () => {
    expect(getConnectionModeById("bash-curl-staged")).toBe("staged");
    expect(supportsStageFile("staged")).toBe(true);
  });

  it("classifies HoaxShell-style HTTP callbacks", () => {
    expect(getConnectionModeById("powershell-hoaxshell-style")).toBe(
      "http-callback",
    );
    expect(supportsHttpServerNotes("http-callback")).toBe(true);
  });

  it("detects templates that ignore the shell field", () => {
    expect(usesShellInput("ruby-socket")).toBe(false);
    expect(usesShellInput("powershell-tcp-client")).toBe(false);
    expect(usesShellInput("bash-dev-tcp")).toBe(true);
  });
});

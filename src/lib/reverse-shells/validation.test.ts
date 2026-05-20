import { describe, expect, it } from "vitest";
import {
  normalizeHost,
  normalizePort,
  normalizeShell,
  safeParseReverseShellConfig,
} from "./validation";

describe("normalizeHost", () => {
  it("accepts IPv4 and hostnames", () => {
    expect(normalizeHost("10.0.0.5")).toBe("10.0.0.5");
    expect(normalizeHost("attacker.example.com")).toBe("attacker.example.com");
  });

  it("rejects shell metacharacters", () => {
    expect(normalizeHost("127.0.0.1;id")).toBe("127.0.0.1");
  });
});

describe("normalizePort", () => {
  it("clamps invalid values to fallback", () => {
    expect(normalizePort(0)).toBe(4444);
    expect(normalizePort(70000)).toBe(4444);
    expect(normalizePort("8080")).toBe(8080);
  });
});

describe("normalizeShell", () => {
  it("accepts common shell paths", () => {
    expect(normalizeShell("/bin/bash")).toBe("/bin/bash");
    expect(normalizeShell("cmd.exe")).toBe("cmd.exe");
  });

  it("rejects spaces", () => {
    expect(normalizeShell("/bin/sh -i")).toBe("/bin/sh");
  });
});

describe("safeParseReverseShellConfig", () => {
  it("returns null for invalid payloads", () => {
    expect(safeParseReverseShellConfig({ lhost: "bad host" })).toBeNull();
  });

  it("normalizes unknown template ids", () => {
    const config = safeParseReverseShellConfig({
      templateId: "unknown-template",
      lhost: "10.0.0.1",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "none",
    });
    expect(config?.templateId).toBe("bash-dev-tcp");
  });
});

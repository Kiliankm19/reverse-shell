import { describe, expect, it } from "vitest";
import { getTemplate } from "./catalog";
import {
  compatibleObfuscationModes,
  isObfuscationCompatible,
  safeObfuscationForTemplate,
} from "./obfuscation";

describe("obfuscation compatibility", () => {
  it("allows bash wrappers for bash payloads", () => {
    const template = getTemplate("bash-dev-tcp");
    expect(compatibleObfuscationModes(template)).toContain("bash-base64");
    expect(isObfuscationCompatible(template, "bash-ifs")).toBe(true);
  });

  it("allows only powershell modes for powershell payloads", () => {
    const template = getTemplate("powershell-tcp-client");
    expect(compatibleObfuscationModes(template)).toContain(
      "powershell-encoded",
    );
    expect(isObfuscationCompatible(template, "bash-base64")).toBe(false);
  });

  it("falls back to none for incompatible selections", () => {
    expect(
      safeObfuscationForTemplate("bash-dev-tcp", "powershell-encoded"),
    ).toBe("none");
  });

  it("does not offer bash wrappers for quoted web payloads", () => {
    const template = getTemplate("php-proc-open");
    expect(compatibleObfuscationModes(template)).toEqual([
      "none",
      "url",
      "url-double",
      "base64",
      "hex",
    ]);
  });

  it("offers chr rebuild for Python payloads without bash wrappers", () => {
    const template = getTemplate("python3-socket");
    expect(compatibleObfuscationModes(template)).toEqual([
      "none",
      "url",
      "url-double",
      "base64",
      "hex",
      "python-chr",
    ]);
  });
});

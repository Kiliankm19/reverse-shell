import { describe, expect, it } from "vitest";
import { matchesVictimTools } from "./constants";

describe("matchesVictimTools", () => {
  it("allows all templates when no target tools are selected", () => {
    expect(
      matchesVictimTools({ id: "bash-curl-staged", family: "staged" }, []),
    ).toBe(true);
  });

  it("requires every detected tool for multi-tool payloads", () => {
    const template = { id: "bash-curl-staged", family: "staged" } as const;

    expect(matchesVictimTools(template, ["bash"])).toBe(false);
    expect(matchesVictimTools(template, ["bash", "curl"])).toBe(true);
  });

  it("does not treat ncat payloads as generic nc payloads", () => {
    const template = { id: "ncat-ssl-exec", family: "nc" } as const;

    expect(matchesVictimTools(template, ["nc"])).toBe(false);
    expect(matchesVictimTools(template, ["ncat"])).toBe(true);
  });

  it("does not require the openssl binary for language SSL libraries", () => {
    const template = { id: "python3-ssl-socket", family: "python" } as const;

    expect(matchesVictimTools(template, ["python3"])).toBe(true);
  });

  it("does not match unknown tool requirements when target tools are selected", () => {
    const template = { id: "java-runtime", family: "java" } as const;

    expect(matchesVictimTools(template, ["bash"])).toBe(false);
  });
});

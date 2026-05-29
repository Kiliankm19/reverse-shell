import { describe, expect, it } from "vitest";
import { createEngagementCard } from "./engagement-card";
import { generateReverseShell } from "./generate";
import type { ReverseShellConfig } from "./types";

const config: ReverseShellConfig = {
  templateId: "bash-dev-tcp",
  lhost: "10.0.0.5",
  lport: 4444,
  shell: "/bin/bash",
  obfuscation: "none",
};

describe("createEngagementCard", () => {
  it("uses the selected listener when provided", () => {
    const generated = generateReverseShell(config);
    const card = createEngagementCard(
      config,
      generated,
      undefined,
      undefined,
      undefined,
      "nc",
    );

    expect(card).toContain("nc -lvnp 4444");
    expect(card).not.toContain("rlwrap -cAr nc -lvnp 4444");
  });
});

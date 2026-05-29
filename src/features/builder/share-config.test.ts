import { describe, expect, it } from "vitest";
import {
  buildShareSearchParams,
  configFromSearchParams,
  uiFromSearchParams,
} from "./share-config";
import { defaultConfig } from "@/lib/reverse-shells";

describe("share-config", () => {
  it("round-trips config and builder UI state through search params", () => {
    const query = buildShareSearchParams(
      { ...defaultConfig(), templateId: "bash-curl-staged", httpPort: 8080 },
      {
        platformFilter: "linux",
        architectureFilter: "x64",
        victimToolFilters: ["bash", "curl"],
        networkEgressFilter: "http",
        familyFilter: "staged",
        techniqueTypeFilter: "assembled",
        selectedListenerId: "nc",
        stageTemplateId: "bash-dev-tcp",
        selectedUpgradeRecipeId: "python-pty",
        selectedCleanupRecipeId: "terminal-env",
      },
    );

    expect(configFromSearchParams(query)).toMatchObject({
      templateId: "bash-curl-staged",
      httpPort: 8080,
    });
    expect(uiFromSearchParams(query)).toMatchObject({
      platformFilter: "linux",
      architectureFilter: "x64",
      victimToolFilters: ["bash", "curl"],
      networkEgressFilter: "http",
      familyFilter: "staged",
      techniqueTypeFilter: "assembled",
      selectedListenerId: "nc",
      stageTemplateId: "bash-dev-tcp",
      selectedUpgradeRecipeId: "python-pty",
      selectedCleanupRecipeId: "terminal-env",
    });
  });

  it("keeps legacy config-only URLs valid", () => {
    expect(
      uiFromSearchParams(
        "?template=python3-socket&lhost=10.0.0.1&lport=9001&shell=%2Fbin%2Fbash&obfuscation=none",
      ),
    ).toBeNull();
  });
});

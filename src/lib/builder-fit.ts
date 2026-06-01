import type { ReverseShellConfig } from "@/lib/reverse-shells";
import { getTemplate } from "@/lib/reverse-shells";
import type { ArchitectureFilter } from "@/features/builder/constants";
import type { Platform } from "@/lib/reverse-shells";

export type FitLevel = "high" | "medium" | "low";

export interface FitAssessment {
  level: FitLevel;
  score: number;
  reasons: string[];
}

export function assessTechniqueFit(
  config: ReverseShellConfig,
  filters: {
    platform: "all" | Platform;
    architecture: ArchitectureFilter;
  },
): FitAssessment {
  const template = getTemplate(config.templateId);
  const reasons: string[] = [];
  let score = 70;

  if (filters.platform !== "all") {
    if (
      template.platform === filters.platform ||
      template.platform === "multi"
    ) {
      score += 15;
      reasons.push("platform_match");
    } else {
      score -= 25;
      reasons.push("platform_mismatch");
    }
  } else {
    score += 5;
    reasons.push("platform_open");
  }

  if (config.lhost && config.lport >= 1 && config.lport <= 65535) {
    score += 10;
    reasons.push("endpoint_ready");
  } else {
    score -= 20;
    reasons.push("endpoint_incomplete");
  }

  if (config.obfuscation !== "none") {
    score += 5;
    reasons.push("obfuscation_applied");
  }

  const level: FitLevel = score >= 85 ? "high" : score >= 65 ? "medium" : "low";

  return { level, score: Math.min(100, Math.max(0, score)), reasons };
}

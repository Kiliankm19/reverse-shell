"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { assessTechniqueFit, type FitLevel } from "@/lib/builder-fit";
import type { BuilderState } from "@/features/builder/use-builder";

type TechniqueFitBadgeProps = Pick<
  BuilderState,
  "safeConfig" | "platformFilter" | "architectureFilter"
>;

function toneForLevel(level: FitLevel): "default" | "secondary" | "outline" {
  if (level === "high") return "default";
  if (level === "medium") return "secondary";
  return "outline";
}

export function TechniqueFitBadge({
  safeConfig,
  platformFilter,
  architectureFilter,
}: TechniqueFitBadgeProps) {
  const t = useTranslations("builder");

  if (!safeConfig) return null;

  const fit = assessTechniqueFit(safeConfig, {
    platform: platformFilter,
    architecture: architectureFilter,
  });

  const primaryReason = fit.reasons[0] ?? "platform_open";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={toneForLevel(fit.level)} className="font-mono text-xs">
        {t(`fit_level_${fit.level}`, { score: fit.score })}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {t(`fit_reason_${primaryReason}`)}
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODE_KEY = "reverseshell:builder-mode";

export type BuilderMode = "guided" | "expert";

export function readBuilderMode(): BuilderMode {
  if (typeof window === "undefined") return "guided";
  const raw = localStorage.getItem(MODE_KEY);
  return raw === "expert" ? "expert" : "guided";
}

export function persistBuilderMode(mode: BuilderMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODE_KEY, mode);
}

interface BuilderModeToggleProps {
  mode: BuilderMode;
  onModeChange: (mode: BuilderMode) => void;
  className?: string;
}

export function BuilderModeToggle({
  mode,
  onModeChange,
  className,
}: BuilderModeToggleProps) {
  const t = useTranslations("builder");

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border bg-muted/30 p-0.5",
        className,
      )}
      role="group"
      aria-label={t("mode_toggle_label")}
    >
      {(["guided", "expert"] as const).map((value) => (
        <Button
          key={value}
          type="button"
          size="sm"
          variant={mode === value ? "default" : "ghost"}
          className="h-7 px-3 text-xs"
          onClick={() => onModeChange(value)}
        >
          {t(`mode_${value}`)}
        </Button>
      ))}
    </div>
  );
}

export function useBuilderMode(): [BuilderMode, (mode: BuilderMode) => void] {
  const [mode, setMode] = useState<BuilderMode>(() => readBuilderMode());

  const update = (next: BuilderMode) => {
    setMode(next);
    persistBuilderMode(next);
  };

  return [mode, update];
}

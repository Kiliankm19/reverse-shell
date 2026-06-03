"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  HardDrive,
  Lock,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBanner({
  compact = false,
  collapsibleOnMobile = false,
}: {
  compact?: boolean;
  collapsibleOnMobile?: boolean;
}) {
  const t = useTranslations("trust");
  const [expanded, setExpanded] = useState(!collapsibleOnMobile);

  const items = [
    { icon: WifiOff, label: t("local_only") },
    { icon: Lock, label: t("no_upload") },
    { icon: ShieldCheck, label: t("authorized") },
    { icon: HardDrive, label: t("storage") },
  ];

  const showAll = !collapsibleOnMobile || expanded;

  return (
    <div
      className={cn(
        "border-b border-border/50 backdrop-blur-sm",
        compact ? "bg-muted/10 px-4 py-2" : "bg-card/30 px-4 py-3 sm:px-6",
      )}
    >
      <div className="mx-auto max-w-7xl">
        {collapsibleOnMobile && (
          <button
            type="button"
            className="mb-2 flex w-full items-center justify-between gap-2 text-left text-xs font-medium text-foreground sm:hidden"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              {t("banner_toggle")}
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
        <ul
          className={cn(
            "flex flex-wrap items-center justify-center gap-x-6 gap-y-2",
            compact ? "text-xs" : "text-xs",
            collapsibleOnMobile && !showAll && "hidden sm:flex",
            collapsibleOnMobile && showAll && "sm:flex",
          )}
        >
          {items.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full border border-border/30 bg-muted/20 px-3 py-1"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span className="text-muted-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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
      className={
        compact
          ? "border-b bg-muted/30 px-4 py-2"
          : "border-b bg-muted/20 px-4 py-3 sm:px-6"
      }
    >
      <div className="mx-auto max-w-7xl">
        {collapsibleOnMobile && (
          <button
            type="button"
            className="mb-1 flex w-full items-center justify-between gap-2 text-left text-xs font-medium text-foreground sm:hidden"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <span>{t("banner_toggle")}</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                expanded && "rotate-180",
              )}
            />
          </button>
        )}
        <ul
          className={cn(
            compact
              ? "flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground"
              : "grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground md:flex md:flex-wrap md:items-center md:justify-center md:gap-x-6",
            collapsibleOnMobile && !showAll && "hidden sm:grid md:flex",
            collapsibleOnMobile && showAll && "sm:grid md:flex",
          )}
        >
          {items.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

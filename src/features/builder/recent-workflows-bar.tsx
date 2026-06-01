"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearRecentWorkflows,
  readRecentWorkflows,
  type RecentWorkflow,
} from "@/lib/recent-workflows";

export function RecentWorkflowsBar() {
  const t = useTranslations("builder");
  const [recents, setRecents] = useState<RecentWorkflow[]>(() =>
    readRecentWorkflows(),
  );

  if (recents.length === 0) return null;

  function handleClear() {
    clearRecentWorkflows();
    setRecents([]);
  }

  return (
    <section
      className="mb-4 rounded-lg border bg-muted/20 px-3 py-2"
      aria-label={t("recents_title")}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {t("recents_title")}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 px-2 text-xs"
          onClick={handleClear}
        >
          <X className="h-3.5 w-3.5" />
          {t("recents_clear")}
        </Button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {recents.map((item) => (
          <li key={`${item.id}-${item.at}`}>
            <Link
              href={item.href}
              className="inline-flex rounded-md border bg-background px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  clearPersistedConfig,
  readPersistedConfig,
  saveActiveConfig,
} from "@/features/builder/store";
import { getTemplate } from "@/lib/reverse-shells";
import { pushRecentWorkflow } from "@/lib/recent-workflows";

export function ResumeLastLab() {
  const t = useTranslations("builder");

  const [snapshot, setSnapshot] = useState(() => readPersistedConfig());

  if (!snapshot) return null;

  const templateName = getTemplate(snapshot.templateId).name;

  function handleResume() {
    if (!snapshot) return;
    saveActiveConfig(snapshot);
    pushRecentWorkflow({
      id: "resume-last-lab",
      label: t("resume_last_label"),
      href: "/builder",
      kind: "builder",
    });
    window.location.assign("/");
  }

  function handleClear() {
    clearPersistedConfig();
    setSnapshot(null);
  }

  return (
    <section className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{t("resume_last_title")}</p>
        <p className="text-xs text-muted-foreground">
          {t("resume_last_hint", {
            template: templateName,
            endpoint: `${snapshot.lhost}:${snapshot.lport}`,
          })}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={handleClear}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("resume_last_clear")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          onClick={handleResume}
        >
          <Play className="h-3.5 w-3.5" />
          {t("resume_last_cta")}
        </Button>
      </div>
    </section>
  );
}

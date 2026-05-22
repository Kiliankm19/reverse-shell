"use client";

import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RecommendedListenerCard } from "@/features/builder/recommended-listener-card";
import type { BuilderState } from "@/features/builder/use-builder";

type CommandSidebarProps = Pick<
  BuilderState,
  "config" | "connectionMode" | "copy" | "generated" | "safeConfig"
>;

export function CommandSidebar({
  config,
  connectionMode,
  copy,
  generated,
  safeConfig,
}: CommandSidebarProps) {
  const t = useTranslations("builder");

  return (
    <div className="space-y-6">
      <RecommendedListenerCard
        config={config}
        connectionMode={connectionMode}
        onCopy={(value) => void copy(value)}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t("generated_command_title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={generated?.command ?? t("invalid_input")}
            readOnly
            className="min-h-48 font-mono text-xs"
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => generated && void copy(generated.command)}
            disabled={!generated}
          >
            <Copy className="h-4 w-4" />
            {t("copy_command_button")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t("raw_command_title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={generated?.rawCommand ?? ""}
            readOnly
            className="min-h-32 font-mono text-xs"
          />
          <ul className="space-y-1 text-xs text-muted-foreground">
            {generated && (
              <>
                <li>- {t(`templates.${generated.template.id}.description`)}</li>
                <li>
                  -{" "}
                  {t(`obfuscation_notes.${safeConfig?.obfuscation ?? "none"}`)}
                </li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

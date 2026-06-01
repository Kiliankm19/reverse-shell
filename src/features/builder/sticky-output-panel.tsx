"use client";

import { Download, Headphones, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandOutput } from "@/components/ui/command-output";
import {
  buildListenerCommand,
  getRecommendedListenerCommand,
} from "@/lib/reverse-shells/listener-command";
import type { useBuilder } from "@/features/builder/use-builder";

type Builder = ReturnType<typeof useBuilder>;

interface StickyOutputPanelProps {
  builder: Builder;
}

export function StickyOutputPanel({ builder }: StickyOutputPanelProps) {
  const { t } = builder;
  const recommendation = builder.safeConfig
    ? getRecommendedListenerCommand(
        builder.safeConfig.templateId,
        builder.safeConfig.lhost,
        builder.safeConfig.lport,
      )
    : null;
  const listenerId =
    builder.selectedListenerId ?? recommendation?.listenerId ?? null;
  const listenerCommand =
    builder.safeConfig && listenerId
      ? buildListenerCommand(
          listenerId,
          builder.safeConfig.lhost,
          builder.safeConfig.lport,
        )
      : "";

  return (
    <aside className="space-y-4 md:sticky md:top-[7.5rem] md:self-start">
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <RadioTower className="h-4 w-4 text-primary" />
            {t("output_panel_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("generated_command_intro")}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {listenerCommand ? (
            <div className="space-y-2 rounded-md border bg-muted/20 p-3">
              <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Headphones className="h-3.5 w-3.5" />
                {t("output_listener_first")}
              </p>
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed">
                {listenerCommand}
              </pre>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => void builder.copy(listenerCommand)}
              >
                {t("copy_listener_button")}
              </Button>
            </div>
          ) : null}
          <CommandOutput
            value={builder.generated?.command ?? t("invalid_input")}
            copyLabel={t("copy_command_button")}
            copiedLabel={t("copied_inline")}
            onCopy={() =>
              builder.generated && void builder.copy(builder.generated.command)
            }
            minHeight="min-h-36"
          />
          {builder.lastCopiedAt && builder.generated && (
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-sm font-medium">{t("copy_receipt_title")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("copy_receipt_body")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  onClick={() => builder.setSaveDialogOpen(true)}
                >
                  {t("copy_receipt_save")}
                </button>
                <button
                  type="button"
                  className="rounded-md border bg-background px-3 py-1.5 text-xs font-medium"
                  onClick={builder.handleExportCard}
                >
                  {t("copy_receipt_export")}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {builder.generated && (
        <details className="rounded-lg border bg-card p-3 text-sm">
          <summary className="cursor-pointer font-medium">
            {t("raw_command_title")}
          </summary>
          <div className="mt-3">
            <CommandOutput
              value={builder.generated.rawCommand}
              copyLabel={t("copy_command_button")}
              copiedLabel={t("copied_inline")}
              onCopy={() => void builder.copy(builder.generated!.rawCommand)}
              minHeight="min-h-24"
            />
          </div>
        </details>
      )}

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Download className="h-3.5 w-3.5 shrink-0" />
        {t("output_panel_hint")}
      </p>
    </aside>
  );
}

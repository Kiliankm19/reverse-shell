"use client";

import { RadioTower } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandOutput } from "@/components/ui/command-output";
import type { useBuilder } from "@/features/builder/use-builder";

type Builder = ReturnType<typeof useBuilder>;

interface StickyOutputPanelProps {
  builder: Builder;
}

export function StickyOutputPanel({ builder }: StickyOutputPanelProps) {
  const { t } = builder;

  return (
    <Card className="transition-colors hover:border-primary/40 focus-within:border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <RadioTower className="h-4 w-4 text-primary" />
          {t("output_panel_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("generated_command_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {builder.generated ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium">
                {t("generated_command_title")}
              </p>
              <CommandOutput
                value={builder.generated.command}
                copyLabel={t("copy_command_button")}
                copiedLabel={t("copied_inline")}
                onCopy={() => void builder.copy(builder.generated!.command)}
                minHeight="min-h-0"
              />
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <p className="text-sm font-medium text-muted-foreground">
                {t("raw_command_title")}
              </p>
              <CommandOutput
                value={builder.generated.rawCommand}
                copyLabel={t("copy_command_button")}
                copiedLabel={t("copied_inline")}
                onCopy={() => void builder.copy(builder.generated!.rawCommand)}
                minHeight="min-h-0"
              />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-sm text-muted-foreground">
            {t("invalid_input")}
          </div>
        )}
        {builder.lastCopiedAt && builder.generated && (
          <div className="rounded-lg border bg-muted/30 p-3">
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
  );
}

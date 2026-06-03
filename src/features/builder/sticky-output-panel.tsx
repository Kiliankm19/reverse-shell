"use client";

import { Terminal, Save, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandOutput } from "@/components/ui/command-output";
import { Button } from "@/components/ui/button";
import type { useBuilder } from "@/features/builder/use-builder";

type Builder = ReturnType<typeof useBuilder>;

interface StickyOutputPanelProps {
  builder: Builder;
}

export function StickyOutputPanel({ builder }: StickyOutputPanelProps) {
  const { t } = builder;

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Terminal className="h-4 w-4 text-primary" />
          </div>
          {t("output_panel_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("generated_command_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {builder.generated ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  {t("generated_command_title")}
                </p>
              </div>
              <CommandOutput
                value={builder.generated.command}
                copyLabel={t("copy_command_button")}
                copiedLabel={t("copied_inline")}
                onCopy={() => void builder.copy(builder.generated!.command)}
                minHeight="min-h-0"
              />
            </div>

            <div className="space-y-2 rounded-lg border border-border/50 bg-muted/10 p-4">
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
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-muted/10 p-8 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
              <Terminal className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("invalid_input")}
            </p>
          </div>
        )}

        {builder.lastCopiedAt && builder.generated && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{t("copy_receipt_title")}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("copy_receipt_body")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={() => builder.setSaveDialogOpen(true)}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {t("copy_receipt_save")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5 text-xs border-border/50"
                    onClick={builder.handleExportCard}
                  >
                    <Download className="h-3.5 w-3.5" />
                    {t("copy_receipt_export")}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

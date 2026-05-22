"use client";

import { Bookmark, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveCollectionDialog } from "@/features/collections/save-collection-dialog";
import { CommandSidebar } from "@/features/builder/command-sidebar";
import { HttpServerCard } from "@/features/builder/http-server-card";
import { ObfuscationCard } from "@/features/builder/obfuscation-card";
import { PayloadFormCard } from "@/features/builder/payload-form-card";
import { StageFileCard } from "@/features/builder/stage-file-card";
import { useBuilder } from "@/features/builder/use-builder";
import { supportsHttpServerNotes } from "@/lib/reverse-shells";

export function BuilderPage() {
  const builder = useBuilder();
  const { t } = builder;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => builder.setSaveDialogOpen(true)}
              className="gap-2"
              size="lg"
            >
              <Bookmark className="h-4 w-4" />
              {t("save_button")}
            </Button>
            <Button
              variant="outline"
              onClick={builder.handleExportCard}
              disabled={!builder.generated}
              className="gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {t("export_card_button")}
            </Button>
            <Button
              onClick={() =>
                builder.generated &&
                void builder.copy(builder.generated.command)
              }
              disabled={!builder.generated}
              className="gap-2"
              size="lg"
            >
              <Copy className="h-4 w-4" />
              {t("copy_command_button")}
            </Button>
          </div>
        </div>

        <SaveCollectionDialog
          open={builder.saveDialogOpen}
          onOpenChange={builder.setSaveDialogOpen}
          onSave={builder.handleSave}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <PayloadFormCard {...builder} />
            <ObfuscationCard {...builder} />
            <StageFileCard {...builder} />
            {supportsHttpServerNotes(builder.connectionMode) && (
              <HttpServerCard {...builder} />
            )}
          </div>
          <CommandSidebar {...builder} />
        </div>
      </div>
    </main>
  );
}

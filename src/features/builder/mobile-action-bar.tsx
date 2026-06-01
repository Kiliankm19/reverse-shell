"use client";

import { Bookmark, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { useBuilder } from "@/features/builder/use-builder";

type Builder = ReturnType<typeof useBuilder>;

interface MobileActionBarProps {
  builder: Builder;
}

export function MobileActionBar({ builder }: MobileActionBarProps) {
  const { t } = builder;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg gap-2">
        <Button
          className="min-w-0 flex-1 gap-2"
          size="lg"
          onClick={() =>
            builder.generated && void builder.copy(builder.generated.command)
          }
          disabled={!builder.generated}
        >
          <Copy className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("copy_command_button")}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 px-3"
          onClick={() => builder.setSaveDialogOpen(true)}
          hidden={!builder.lastCopiedAt}
        >
          <Bookmark className="h-4 w-4 shrink-0" />
          <span className="sr-only sm:not-sr-only sm:inline">
            {t("save_button")}
          </span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5 px-3"
          onClick={builder.handleExportCard}
          disabled={!builder.generated}
          hidden={!builder.lastCopiedAt}
        >
          <Download className="h-4 w-4 shrink-0" />
          <span className="sr-only sm:not-sr-only sm:inline">
            {t("export_card_button")}
          </span>
        </Button>
      </div>
    </div>
  );
}

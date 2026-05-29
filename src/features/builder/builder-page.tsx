"use client";

import { Bookmark, Copy, Download, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SaveCollectionDialog } from "@/features/collections/save-collection-dialog";
import { AttackerCard } from "@/features/builder/attacker-card";
import { CommandSidebar } from "@/features/builder/command-sidebar";
import { NextStepCard } from "@/features/builder/next-step-card";
import { ObfuscationCard } from "@/features/builder/obfuscation-card";
import { PayloadFormCard } from "@/features/builder/payload-form-card";
import { RecommendedListenerCard } from "@/features/builder/recommended-listener-card";
import { TechniqueSupportCard } from "@/features/builder/technique-support-card";
import { useBuilder } from "@/features/builder/use-builder";

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

        <div className="space-y-6">
          <AttackerCard
            {...builder}
            listenerContent={
              <RecommendedListenerCard
                config={builder.config}
                selectedListenerId={builder.selectedListenerId}
                onListenerChange={builder.onListenerChange}
                onCopy={(value) => void builder.copy(value)}
                embedded
              />
            }
          />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <RadioTower className="h-4 w-4 text-primary" />
                {t("technique_command_title")}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("technique_command_intro")}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <PayloadFormCard {...builder} embedded />
              <ObfuscationCard {...builder} embedded />
              <CommandSidebar {...builder} embedded />
              <TechniqueSupportCard
                safeConfig={builder.safeConfig}
                connectionMode={builder.connectionMode}
                stageTemplateId={builder.stageTemplateId}
                onStageTemplateChange={builder.setStageTemplateId}
                onCopy={(value) => void builder.copy(value)}
              />
            </CardContent>
          </Card>

          <NextStepCard
            config={builder.config}
            connectionMode={builder.connectionMode}
            selectedUpgradeRecipeId={builder.selectedUpgradeRecipeId}
            onUpgradeRecipeChange={builder.setSelectedUpgradeRecipeId}
            selectedCleanupRecipeId={builder.selectedCleanupRecipeId}
            onCleanupRecipeChange={builder.setSelectedCleanupRecipeId}
            onCopy={(value) => void builder.copy(value)}
          />
        </div>
      </div>
    </main>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBanner } from "@/components/layout/trust-banner";
import { SaveCollectionDialog } from "@/features/collections/save-collection-dialog";
import { AttackerCard } from "@/features/builder/attacker-card";
import { NextStepCard } from "@/features/builder/next-step-card";
import { ObfuscationCard } from "@/features/builder/obfuscation-card";
import { PayloadFormCard } from "@/features/builder/payload-form-card";
import { StickyOutputPanel } from "@/features/builder/sticky-output-panel";
import { RecommendedListenerCard } from "@/features/builder/recommended-listener-card";
import { TechniqueSupportCard } from "@/features/builder/technique-support-card";
import { useBuilder } from "@/features/builder/use-builder";
import { RadioTower } from "lucide-react";

export function BuilderPage() {
  const builder = useBuilder();
  const t = useTranslations("builder");

  return (
    <>
      <TrustBanner compact collapsibleOnMobile />
      <main className="flex-1 px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>

          <SaveCollectionDialog
            open={builder.saveDialogOpen}
            onOpenChange={builder.setSaveDialogOpen}
            onSave={builder.handleSave}
          />

          <div className="space-y-5">
            <section>
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
            </section>

            <section>
              <Card className="transition-colors hover:border-primary/40 focus-within:border-primary/40">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <RadioTower className="h-4 w-4 text-primary" />
                    {t("technique_command_title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("technique_command_intro")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <PayloadFormCard {...builder} embedded />
                  <ObfuscationCard {...builder} embedded />
                  <TechniqueSupportCard
                    safeConfig={builder.safeConfig}
                    connectionMode={builder.connectionMode}
                    stageTemplateId={builder.stageTemplateId}
                    onStageTemplateChange={builder.setStageTemplateId}
                    onCopy={(value) => void builder.copy(value)}
                  />
                </CardContent>
              </Card>
            </section>

            <section>
              <StickyOutputPanel builder={builder} />
            </section>

            <section>
              <NextStepCard
                config={builder.config}
                connectionMode={builder.connectionMode}
                selectedUpgradeRecipeId={builder.selectedUpgradeRecipeId}
                onUpgradeRecipeChange={builder.setSelectedUpgradeRecipeId}
                selectedCleanupRecipeId={builder.selectedCleanupRecipeId}
                onCleanupRecipeChange={builder.setSelectedCleanupRecipeId}
                onCopy={(value) => void builder.copy(value)}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

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
import { Terminal, Zap, Layers } from "lucide-react";

export function BuilderPage() {
  const builder = useBuilder();
  const t = useTranslations("builder");

  return (
    <>
      <TrustBanner compact collapsibleOnMobile />
      <main className="flex-1 px-4 py-6 sm:px-6 grid-bg">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-balance">
                  {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
              </div>
            </div>
          </div>

          <SaveCollectionDialog
            open={builder.saveDialogOpen}
            onOpenChange={builder.setSaveDialogOpen}
            onSave={builder.handleSave}
          />

          <div className="space-y-6">
            {/* Attacker & Target Configuration */}
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

            {/* Technique & Payload Section */}
            <section>
              <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    {t("technique_command_title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t("technique_command_intro")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
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

            {/* Output Panel */}
            <section>
              <StickyOutputPanel builder={builder} />
            </section>

            {/* Next Steps */}
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

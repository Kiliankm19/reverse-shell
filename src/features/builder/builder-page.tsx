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
import { Terminal, Zap } from "lucide-react";

export function BuilderPage() {
  const builder = useBuilder();
  const t = useTranslations("builder");

  return (
    <>
      <TrustBanner compact collapsibleOnMobile />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <Terminal className="h-6 w-6 text-primary" />
                <div className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
                  {t("title")}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("subtitle")}
                </p>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-primary/20 via-border to-transparent" />
          </div>

          <SaveCollectionDialog
            open={builder.saveDialogOpen}
            onOpenChange={builder.setSaveDialogOpen}
            onSave={builder.handleSave}
          />

          <div className="space-y-8">
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
              <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 rounded-2xl">
                <CardHeader className="pb-4 border-b border-border">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    {t("technique_command_title")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("technique_command_intro")}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
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

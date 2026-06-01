"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { TrustBanner } from "@/components/layout/trust-banner";
import { SaveCollectionDialog } from "@/features/collections/save-collection-dialog";
import { AttackerCard } from "@/features/builder/attacker-card";
import { CommandSidebar } from "@/features/builder/command-sidebar";
import { MobileActionBar } from "@/features/builder/mobile-action-bar";
import { NextStepCard } from "@/features/builder/next-step-card";
import { ObfuscationCard } from "@/features/builder/obfuscation-card";
import { PayloadFormCard } from "@/features/builder/payload-form-card";
import { StickyOutputPanel } from "@/features/builder/sticky-output-panel";
import { RecommendedListenerCard } from "@/features/builder/recommended-listener-card";
import { TechniqueSupportCard } from "@/features/builder/technique-support-card";
import { RecentWorkflowsBar } from "@/features/builder/recent-workflows-bar";
import { ResumeLastLab } from "@/features/builder/resume-last-lab";
import { useBuilder } from "@/features/builder/use-builder";
import { RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";

export function BuilderPage() {
  const builder = useBuilder();
  const t = useTranslations("builder");
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: "target", label: t("step_target") },
    { id: "technique", label: t("step_technique") },
    { id: "session", label: t("step_session") },
  ];

  const sectionClass = (step: number) => cn(currentStep !== step && "hidden");

  return (
    <>
      <TrustBanner compact collapsibleOnMobile />
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>

          <ResumeLastLab />
          <RecentWorkflowsBar />

          <Stepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            className="mb-6"
          />

          <SaveCollectionDialog
            open={builder.saveDialogOpen}
            onOpenChange={builder.setSaveDialogOpen}
            onSave={builder.handleSave}
          />

          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]">
            <div className="space-y-6">
              <section className={sectionClass(0)}>
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

              <section className={sectionClass(1)}>
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
                    <CommandSidebar {...builder} embedded rawOnly />
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

              <section className={sectionClass(2)}>
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

              <div className="flex justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentStep === 0}
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                >
                  {t("step_back")}
                </Button>
                <span className="text-xs text-muted-foreground">
                  {t("step_progress", {
                    current: currentStep + 1,
                    total: steps.length,
                  })}
                </span>
                <Button
                  size="sm"
                  disabled={currentStep === steps.length - 1}
                  onClick={() =>
                    setCurrentStep((s) => Math.min(steps.length - 1, s + 1))
                  }
                >
                  {t("step_next")}
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <StickyOutputPanel builder={builder} />
            </div>

            <div className="md:hidden">
              <StickyOutputPanel builder={builder} />
            </div>
          </div>
        </div>
      </main>
      <MobileActionBar builder={builder} />
    </>
  );
}

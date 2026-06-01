"use client";

import { useTranslations } from "next-intl";
import { RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PayloadPicker } from "@/features/builder/payload-picker";
import { TechniqueFitBadge } from "@/features/builder/technique-fit-badge";
import {
  FAMILY_FILTERS,
  familyAvailableForFilters,
  templateMatchesFilters,
  SHELL_OPTIONS,
  TECHNIQUE_TYPE_FILTERS,
  type ArchitectureFilter,
  type NetworkEgressFilter,
  type TechniqueTypeFilter,
  type VictimToolFilter,
} from "@/features/builder/constants";
import { modeLabel } from "@/features/builder/utils";
import type { BuilderState } from "@/features/builder/use-builder";
import {
  reverseShellTemplates,
  type Platform,
  type ShellFamily,
} from "@/lib/reverse-shells";

type PayloadFormCardProps = Pick<
  BuilderState,
  | "config"
  | "patchConfig"
  | "handleTemplateChange"
  | "techniqueTypeFilter"
  | "setTechniqueTypeFilter"
  | "platformFilter"
  | "architectureFilter"
  | "victimToolFilters"
  | "networkEgressFilter"
  | "familyFilter"
  | "setFamilyFilter"
  | "fieldErrors"
  | "safeConfig"
  | "selectedTemplate"
  | "connectionMode"
  | "bindMode"
  | "showShell"
  | "filteredTemplates"
  | "lhostHint"
> & {
  embedded?: boolean;
};

export function PayloadFormCard(props: PayloadFormCardProps) {
  const t = useTranslations("builder");
  const {
    config,
    patchConfig,
    handleTemplateChange,
    techniqueTypeFilter,
    setTechniqueTypeFilter,
    platformFilter,
    architectureFilter,
    victimToolFilters,
    networkEgressFilter,
    familyFilter,
    setFamilyFilter,
    fieldErrors,
    safeConfig,
    selectedTemplate,
    connectionMode,
    bindMode,
    showShell,
    filteredTemplates,
    lhostHint,
    embedded = false,
  } = props;
  const shellOptions = Array.from(
    new Set(
      [selectedTemplate.defaultShell, config.shell, ...SHELL_OPTIONS].filter(
        Boolean,
      ),
    ),
  );
  const availableFamilyFilters = FAMILY_FILTERS.filter((family) =>
    familyAvailableForFilters(reverseShellTemplates, family, {
      platform: platformFilter,
      architecture: architectureFilter,
      victimTools: victimToolFilters,
      networkEgress: networkEgressFilter,
      techniqueType: techniqueTypeFilter,
    }),
  );

  function isFamilyAvailableFor(
    family: "all" | ShellFamily,
    platform: "all" | Platform,
    architecture: ArchitectureFilter,
    victimTools: VictimToolFilter[],
    networkEgress: NetworkEgressFilter,
    techniqueType: TechniqueTypeFilter,
  ) {
    return familyAvailableForFilters(reverseShellTemplates, family, {
      platform,
      architecture,
      victimTools,
      networkEgress,
      techniqueType,
    });
  }

  function selectFirstTemplateForFilters(
    platform: "all" | Platform,
    architecture: ArchitectureFilter,
    victimTools: VictimToolFilter[],
    networkEgress: NetworkEgressFilter,
    family: "all" | ShellFamily,
    techniqueType: TechniqueTypeFilter,
  ) {
    if (
      templateMatchesFilters(selectedTemplate, {
        platform,
        architecture,
        victimTools,
        networkEgress,
        family,
        techniqueType,
      })
    ) {
      return;
    }

    const firstMatchingTemplate = reverseShellTemplates.find((template) =>
      templateMatchesFilters(template, {
        platform,
        architecture,
        victimTools,
        networkEgress,
        family,
        techniqueType,
      }),
    );

    if (firstMatchingTemplate) {
      handleTemplateChange(firstMatchingTemplate.id);
    }
  }

  function handleTechniqueTypeChange(value: TechniqueTypeFilter) {
    setTechniqueTypeFilter(value);
    const nextFamily = isFamilyAvailableFor(
      familyFilter,
      platformFilter,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      value,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) {
      setFamilyFilter("all");
    }

    selectFirstTemplateForFilters(
      platformFilter,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      nextFamily,
      value,
    );
  }

  function handleFamilyFilterChange(value: "all" | ShellFamily) {
    setFamilyFilter(value);
    selectFirstTemplateForFilters(
      platformFilter,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      value,
      techniqueTypeFilter,
    );
  }

  const content = (
    <div className="space-y-4">
      <TechniqueFitBadge
        safeConfig={safeConfig}
        platformFilter={platformFilter}
        architectureFilter={architectureFilter}
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label>{t("payload_label")}</Label>
          <span className="text-xs text-muted-foreground">
            {t("payload_result_count", {
              count: filteredTemplates.length,
              total: reverseShellTemplates.length,
            })}
          </span>
        </div>
        <PayloadPicker
          templates={filteredTemplates}
          value={config.templateId}
          onChange={handleTemplateChange}
        />
        {filteredTemplates.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {t("payload_no_results")}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            {modeLabel(t, connectionMode)}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            {selectedTemplate.platform}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">
            {t(`templates.${selectedTemplate.id}.name`)}
          </strong>
          {" · "}
          {selectedTemplate.platform} ·{" "}
          {t(`templates.${selectedTemplate.id}.description`)}
        </p>
        {lhostHint && <p>{lhostHint}</p>}
        {bindMode && <p>{t("lport_bind_hint")}</p>}
      </div>
      <details className="rounded-md border bg-background p-3">
        <summary className="cursor-pointer text-sm font-medium">
          {t("advanced_controls_title")}
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("technique_type_label")}</Label>
            <Select
              value={techniqueTypeFilter}
              onValueChange={(value) =>
                handleTechniqueTypeChange(value as TechniqueTypeFilter)
              }
            >
              <SelectTrigger aria-label={t("technique_type_label")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TECHNIQUE_TYPE_FILTERS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(`technique_types.${type}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t("family_filter_label")}</Label>
            <Select
              value={familyFilter}
              onValueChange={(value) =>
                handleFamilyFilterChange(value as "all" | ShellFamily)
              }
            >
              <SelectTrigger aria-label={t("family_filter_label")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableFamilyFilters.map((family) => (
                  <SelectItem key={family} value={family}>
                    {family === "all"
                      ? t("filter_all")
                      : t(`families.${family}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {showShell && (
            <div className="space-y-2 md:col-span-2">
              <Label>{t("shell_label")}</Label>
              <Select
                value={config.shell}
                onValueChange={(value) => patchConfig({ shell: value })}
              >
                <SelectTrigger
                  className="w-full"
                  aria-invalid={!!fieldErrors.shell}
                >
                  <SelectValue placeholder={selectedTemplate.defaultShell} />
                </SelectTrigger>
                <SelectContent>
                  {shellOptions.map((shell) => (
                    <SelectItem key={shell} value={shell}>
                      {shell}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.shell && (
                <p className="text-xs text-destructive">
                  {t("validation_field_shell")}
                </p>
              )}
            </div>
          )}
        </div>
      </details>
      <Separator />
      {!safeConfig && Object.keys(fieldErrors).length > 0 && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {t("validation_error")}
        </div>
      )}
    </div>
  );

  if (embedded) {
    return (
      <section className="space-y-3 rounded-md border bg-muted/20 p-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <RadioTower className="h-4 w-4 text-primary" />
            {t("payload_picker_title")}
          </h3>
          <p className="text-xs text-muted-foreground">{t("payload_intro")}</p>
        </div>
        {content}
      </section>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <RadioTower className="h-4 w-4 text-primary" /> {t("payload_label")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("payload_intro")}</p>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

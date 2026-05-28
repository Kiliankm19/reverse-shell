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
import {
  FAMILY_FILTERS,
  matchesTechniqueType,
  PLATFORM_FILTERS,
  SHELL_OPTIONS,
  TECHNIQUE_TYPE_FILTERS,
  type TechniqueTypeFilter,
} from "@/features/builder/constants";
import { modeLabel } from "@/features/builder/utils";
import type { BuilderState } from "@/features/builder/use-builder";
import {
  reverseShellTemplates,
  type Platform,
  type ShellFamily,
} from "@/lib/reverse-shells";

function matchesPlatformFilter(
  templatePlatform: Platform,
  platformFilter: "all" | Platform,
) {
  return (
    platformFilter === "all" ||
    templatePlatform === platformFilter ||
    templatePlatform === "multi"
  );
}

type PayloadFormCardProps = Pick<
  BuilderState,
  | "config"
  | "patchConfig"
  | "handleTemplateChange"
  | "techniqueTypeFilter"
  | "setTechniqueTypeFilter"
  | "platformFilter"
  | "setPlatformFilter"
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
>;

export function PayloadFormCard(props: PayloadFormCardProps) {
  const t = useTranslations("builder");
  const {
    config,
    patchConfig,
    handleTemplateChange,
    techniqueTypeFilter,
    setTechniqueTypeFilter,
    platformFilter,
    setPlatformFilter,
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
  } = props;
  const shellOptions = Array.from(
    new Set(
      [selectedTemplate.defaultShell, config.shell, ...SHELL_OPTIONS].filter(
        Boolean,
      ),
    ),
  );
  const availableFamilyFilters = FAMILY_FILTERS.filter(
    (family) =>
      family === "all" ||
      reverseShellTemplates.some(
        (template) =>
          template.family === family &&
          matchesPlatformFilter(template.platform, platformFilter) &&
          matchesTechniqueType(template, techniqueTypeFilter),
      ),
  );

  function isFamilyAvailableFor(
    family: "all" | ShellFamily,
    platform: "all" | Platform,
    techniqueType: TechniqueTypeFilter,
  ) {
    return (
      family === "all" ||
      reverseShellTemplates.some(
        (template) =>
          template.family === family &&
          matchesPlatformFilter(template.platform, platform) &&
          matchesTechniqueType(template, techniqueType),
      )
    );
  }

  function templateMatchesFilters(
    template: typeof selectedTemplate,
    platform: "all" | Platform,
    family: "all" | ShellFamily,
    techniqueType: TechniqueTypeFilter,
  ) {
    return (
      matchesPlatformFilter(template.platform, platform) &&
      (family === "all" || template.family === family) &&
      matchesTechniqueType(template, techniqueType)
    );
  }

  function selectFirstTemplateForFilters(
    platform: "all" | Platform,
    family: "all" | ShellFamily,
    techniqueType: TechniqueTypeFilter,
  ) {
    if (
      templateMatchesFilters(selectedTemplate, platform, family, techniqueType)
    ) {
      return;
    }

    const firstMatchingTemplate = reverseShellTemplates.find((template) =>
      templateMatchesFilters(template, platform, family, techniqueType),
    );

    if (firstMatchingTemplate) {
      handleTemplateChange(firstMatchingTemplate.id);
    }
  }

  function handlePlatformFilterChange(value: "all" | Platform) {
    setPlatformFilter(value);
    const nextFamily = isFamilyAvailableFor(
      familyFilter,
      value,
      techniqueTypeFilter,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) {
      setFamilyFilter("all");
    }

    selectFirstTemplateForFilters(value, nextFamily, techniqueTypeFilter);
  }

  function handleTechniqueTypeChange(value: TechniqueTypeFilter) {
    setTechniqueTypeFilter(value);
    const nextFamily = isFamilyAvailableFor(familyFilter, platformFilter, value)
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) {
      setFamilyFilter("all");
    }

    selectFirstTemplateForFilters(platformFilter, nextFamily, value);
  }

  function handleFamilyFilterChange(value: "all" | ShellFamily) {
    setFamilyFilter(value);
    selectFirstTemplateForFilters(platformFilter, value, techniqueTypeFilter);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <RadioTower className="h-4 w-4 text-primary" /> {t("payload_label")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("payload_intro")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>{t("technique_type_label")}</Label>
            <Select
              value={techniqueTypeFilter}
              onValueChange={(value) =>
                handleTechniqueTypeChange(value as TechniqueTypeFilter)
              }
            >
              <SelectTrigger>
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
            <Label>{t("platform_filter_label")}</Label>
            <Select
              value={platformFilter}
              onValueChange={(value) =>
                handlePlatformFilterChange(value as "all" | Platform)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_FILTERS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform === "all"
                      ? t("filter_all")
                      : t(`platforms.${platform}`)}
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
              <SelectTrigger>
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
          <div className="space-y-2 md:col-span-2">
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
            <Badge variant="outline" className="font-mono text-xs">
              {modeLabel(t, connectionMode)}
            </Badge>
          </div>
          {showShell && (
            <div className="space-y-2">
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
        <Separator />
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
        {!safeConfig && Object.keys(fieldErrors).length > 0 && (
          <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("validation_error")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

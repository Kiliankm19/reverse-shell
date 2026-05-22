"use client";

import { useTranslations } from "next-intl";
import { RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { FAMILY_FILTERS, PLATFORM_FILTERS } from "@/features/builder/constants";
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
  | "payloadQuery"
  | "setPayloadQuery"
  | "platformFilter"
  | "setPlatformFilter"
  | "familyFilter"
  | "setFamilyFilter"
  | "fieldErrors"
  | "safeConfig"
  | "selectedTemplate"
  | "connectionMode"
  | "showLhost"
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
    payloadQuery,
    setPayloadQuery,
    platformFilter,
    setPlatformFilter,
    familyFilter,
    setFamilyFilter,
    fieldErrors,
    safeConfig,
    selectedTemplate,
    connectionMode,
    showLhost,
    bindMode,
    showShell,
    filteredTemplates,
    lhostHint,
  } = props;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <RadioTower className="h-4 w-4 text-primary" /> {t("payload_label")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>{t("payload_search_label")}</Label>
            <Input
              value={payloadQuery}
              onChange={(event) => setPayloadQuery(event.target.value)}
              placeholder={t("payload_search_placeholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("platform_filter_label")}</Label>
            <Select
              value={platformFilter}
              onValueChange={(value) =>
                setPlatformFilter(value as "all" | Platform)
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
                setFamilyFilter(value as "all" | ShellFamily)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAMILY_FILTERS.map((family) => (
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
              <Input
                value={config.shell}
                onChange={(event) => patchConfig({ shell: event.target.value })}
                placeholder={selectedTemplate.defaultShell}
                aria-invalid={!!fieldErrors.shell}
              />
              {fieldErrors.shell && (
                <p className="text-xs text-destructive">
                  {t("validation_field_shell")}
                </p>
              )}
            </div>
          )}
          {showLhost && (
            <div className="space-y-2">
              <Label>{t("lhost_label")}</Label>
              <Input
                value={config.lhost}
                onChange={(event) => patchConfig({ lhost: event.target.value })}
                placeholder={t("lhost_placeholder")}
                aria-invalid={!!fieldErrors.lhost}
              />
              {fieldErrors.lhost && (
                <p className="text-xs text-destructive">
                  {t("validation_field_lhost")}
                </p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="builder-lport">{t("lport_label")}</Label>
            <Input
              id="builder-lport"
              type="number"
              min={1}
              max={65535}
              value={config.lport}
              onChange={(event) =>
                patchConfig({ lport: Number(event.target.value) || 1 })
              }
              aria-invalid={!!fieldErrors.lport}
            />
            {fieldErrors.lport && (
              <p className="text-xs text-destructive">
                {t("validation_field_lport")}
              </p>
            )}
          </div>
          {connectionMode === "staged" && (
            <div className="space-y-2">
              <Label>{t("http_port_label")}</Label>
              <Input
                type="number"
                min={1}
                max={65535}
                value={config.httpPort ?? 8000}
                onChange={(event) =>
                  patchConfig({
                    httpPort: Number(event.target.value) || 1,
                  })
                }
                aria-invalid={!!fieldErrors.httpPort}
              />
              {fieldErrors.httpPort && (
                <p className="text-xs text-destructive">
                  {t("validation_field_http_port")}
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

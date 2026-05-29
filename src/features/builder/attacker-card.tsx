"use client";

import type { ReactNode } from "react";
import { Crosshair, MonitorCog, Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
import {
  ARCHITECTURE_FILTERS,
  NETWORK_EGRESS_FILTERS,
  PLATFORM_FILTERS,
  VICTIM_TOOL_FILTERS,
  type ArchitectureFilter,
  type NetworkEgressFilter,
  type VictimToolFilter,
} from "@/features/builder/constants";
import type { BuilderState } from "@/features/builder/use-builder";
import type { Platform } from "@/lib/reverse-shells";

type AttackerCardProps = Pick<
  BuilderState,
  | "config"
  | "patchConfig"
  | "randomizeLport"
  | "fieldErrors"
  | "showLhost"
  | "connectionMode"
  | "platformFilter"
  | "setPlatformFilter"
  | "architectureFilter"
  | "setArchitectureFilter"
  | "victimToolFilters"
  | "toggleVictimTool"
  | "networkEgressFilter"
  | "setNetworkEgressFilter"
> & {
  listenerContent?: ReactNode;
};

export function AttackerCard({
  config,
  patchConfig,
  randomizeLport,
  fieldErrors,
  showLhost,
  connectionMode,
  platformFilter,
  setPlatformFilter,
  architectureFilter,
  setArchitectureFilter,
  victimToolFilters,
  toggleVictimTool,
  networkEgressFilter,
  setNetworkEgressFilter,
  listenerContent,
}: AttackerCardProps) {
  const t = useTranslations("builder");

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crosshair className="h-4 w-4 text-primary" />
          {t("attacker_victim_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("attacker_victim_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-4 rounded-md border bg-muted/20 p-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium">
              <MonitorCog className="h-4 w-4 text-primary" />
              {t("target_profile_title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("target_profile_intro")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
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
              <Label>{t("architecture_filter_label")}</Label>
              <Select
                value={architectureFilter}
                onValueChange={(value) =>
                  setArchitectureFilter(value as ArchitectureFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARCHITECTURE_FILTERS.map((architecture) => (
                    <SelectItem key={architecture} value={architecture}>
                      {architecture === "all"
                        ? t("filter_all")
                        : t(`architectures.${architecture}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("network_egress_label")}</Label>
              <Select
                value={networkEgressFilter}
                onValueChange={(value) =>
                  setNetworkEgressFilter(value as NetworkEgressFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NETWORK_EGRESS_FILTERS.map((network) => (
                    <SelectItem key={network} value={network}>
                      {network === "all"
                        ? t("filter_all")
                        : t(`network_egress.${network}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("target_profile_tools_label")}</Label>
            <div className="flex flex-wrap gap-2">
              {VICTIM_TOOL_FILTERS.map((tool) => {
                const isSelected = victimToolFilters.includes(tool);
                return (
                  <Button
                    key={tool}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleVictimTool(tool as VictimToolFilter)}
                  >
                    {t(`victim_tools.${tool}`)}
                  </Button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("target_profile_tools_hint")}
            </p>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="space-y-4 rounded-md border bg-muted/20 p-3">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <Crosshair className="h-4 w-4 text-primary" />
                {t("attacker_title")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("attacker_intro")}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex h-7 items-center">
                  <Label>{t("ip_label")}</Label>
                </div>
                {showLhost ? (
                  <>
                    <Input
                      value={config.lhost}
                      onChange={(event) =>
                        patchConfig({ lhost: event.target.value })
                      }
                      placeholder={t("lhost_placeholder")}
                      aria-invalid={!!fieldErrors.lhost}
                    />
                    {fieldErrors.lhost && (
                      <p className="text-xs text-destructive">
                        {t("validation_field_lhost")}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                    {t("attacker_ip_not_used")}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="builder-lport">{t("port_label")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 px-2 text-xs"
                    onClick={randomizeLport}
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    {t("random_port_button")}
                  </Button>
                </div>
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
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="builder-http-port">
                    {t("http_port_label")}
                  </Label>
                  <Input
                    id="builder-http-port"
                    type="number"
                    min={1}
                    max={65535}
                    value={config.httpPort ?? ""}
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
            <div className="rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                {t("attacker_endpoint_label")}
              </p>
              <p className="mt-1 break-all font-mono text-sm">
                {showLhost
                  ? `${config.lhost}:${config.lport}`
                  : `:${config.lport}`}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("random_port_hint")}
            </p>
          </section>

          {listenerContent}
        </div>
      </CardContent>
    </Card>
  );
}

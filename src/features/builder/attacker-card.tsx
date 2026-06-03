"use client";

import type { ReactNode } from "react";
import {
  Crosshair,
  Monitor,
  Shuffle,
  Server,
  Cpu,
  Globe,
  Wrench,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const TARGET_PLATFORM_FILTERS = PLATFORM_FILTERS.filter(
  (platform): platform is Platform => platform !== "all",
);
const TARGET_ARCHITECTURE_FILTERS = ARCHITECTURE_FILTERS.filter(
  (architecture): architecture is Exclude<ArchitectureFilter, "all"> =>
    architecture !== "all",
);
const TARGET_NETWORK_EGRESS_FILTERS = NETWORK_EGRESS_FILTERS.filter(
  (network): network is Exclude<NetworkEgressFilter, "all"> =>
    network !== "all",
);

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
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-200 hover:border-primary/30">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Crosshair className="h-4 w-4 text-primary" />
          </div>
          {t("attacker_victim_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("attacker_victim_intro")}
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Attacker Configuration */}
          <div className="space-y-4">
            <section className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{t("attacker_title")}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-medium">{t("ip_label")}</Label>
                  {showLhost ? (
                    <>
                      <Input
                        value={config.lhost}
                        onChange={(event) =>
                          patchConfig({ lhost: event.target.value })
                        }
                        placeholder={t("lhost_placeholder")}
                        aria-invalid={!!fieldErrors.lhost}
                        className="h-9 font-mono text-sm bg-background/50 border-border/50"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {(["10.10.14.3", "127.0.0.1", "0.0.0.0"] as const).map(
                          (preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-mono border-border/50 hover:border-primary/50 hover:bg-primary/5"
                              onClick={() => patchConfig({ lhost: preset })}
                            >
                              {preset}
                            </Button>
                          ),
                        )}
                      </div>
                      {fieldErrors.lhost && (
                        <p className="text-xs text-destructive">
                          {t("validation_field_lhost")}
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="flex h-9 items-center rounded-md border border-border/50 bg-muted/30 px-3 text-sm text-muted-foreground">
                      {t("attacker_ip_not_used")}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="builder-lport"
                      className="text-xs font-medium"
                    >
                      {t("port_label")}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 px-2 text-[10px] text-muted-foreground hover:text-primary"
                      onClick={randomizeLport}
                    >
                      <Shuffle className="h-3 w-3" />
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
                    className="h-9 font-mono text-sm bg-background/50 border-border/50"
                  />
                  {fieldErrors.lport && (
                    <p className="text-xs text-destructive">
                      {t("validation_field_lport")}
                    </p>
                  )}
                </div>

                {connectionMode === "staged" && (
                  <div className="space-y-2 sm:col-span-2">
                    <Label
                      htmlFor="builder-http-port"
                      className="text-xs font-medium"
                    >
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
                      className="h-9 font-mono text-sm bg-background/50 border-border/50"
                    />
                    {fieldErrors.httpPort && (
                      <p className="text-xs text-destructive">
                        {t("validation_field_http_port")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Endpoint Display */}
              <div className="terminal-block p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {t("attacker_endpoint_label")}
                </p>
                <p className="font-mono text-sm text-primary">
                  <span className="text-muted-foreground">$ connect </span>
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

          {/* Target Profile */}
          <section className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">
                {t("target_profile_title")}
              </p>
            </div>

            <div className="space-y-4">
              {/* Platform */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  {t("platform_filter_label")}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_PLATFORM_FILTERS.map((platform) => {
                    const isSelected = platformFilter === platform;
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-7 px-2.5 text-xs ${
                          isSelected
                            ? "glow-primary-sm"
                            : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        aria-pressed={isSelected}
                        onClick={() => setPlatformFilter(platform)}
                      >
                        {t(`platforms.${platform}`)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Architecture */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Cpu className="h-3 w-3 text-muted-foreground" />
                  {t("architecture_filter_label")}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_ARCHITECTURE_FILTERS.map((architecture) => {
                    const isSelected = architectureFilter === architecture;
                    return (
                      <Button
                        key={architecture}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-7 px-2.5 text-xs ${
                          isSelected
                            ? "glow-primary-sm"
                            : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setArchitectureFilter(
                            architecture as ArchitectureFilter,
                          )
                        }
                      >
                        {t(`architectures.${architecture}`)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Network Egress */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  {t("network_egress_label")}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_NETWORK_EGRESS_FILTERS.map((network) => {
                    const isSelected = networkEgressFilter === network;
                    return (
                      <Button
                        key={network}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-7 px-2.5 text-xs ${
                          isSelected
                            ? "glow-primary-sm"
                            : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        aria-pressed={isSelected}
                        onClick={() =>
                          setNetworkEgressFilter(network as NetworkEgressFilter)
                        }
                      >
                        {t(`network_egress.${network}`)}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Wrench className="h-3 w-3 text-muted-foreground" />
                  {t("target_profile_tools_label")}
                </Label>
                <div className="flex flex-wrap gap-1.5">
                  {VICTIM_TOOL_FILTERS.map((tool) => {
                    const isSelected = victimToolFilters.includes(tool);
                    return (
                      <Button
                        key={tool}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-7 px-2.5 text-xs ${
                          isSelected
                            ? "glow-primary-sm"
                            : "border-border/50 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() =>
                          toggleVictimTool(tool as VictimToolFilter)
                        }
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
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}

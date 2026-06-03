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
    <Card className="overflow-hidden border-border bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 rounded-2xl">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="flex items-center gap-3 text-lg font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Crosshair className="h-4 w-4 text-primary" />
          </div>
          {t("attacker_victim_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {t("attacker_victim_intro")}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Attacker Configuration */}
          <div className="space-y-6">
            <section className="space-y-5 rounded-2xl border border-border bg-muted/5 p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Server className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-sm font-semibold">{t("attacker_title")}</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    {t("ip_label")}
                  </Label>
                  {showLhost ? (
                    <>
                      <Input
                        value={config.lhost}
                        onChange={(event) =>
                          patchConfig({ lhost: event.target.value })
                        }
                        placeholder={t("lhost_placeholder")}
                        aria-invalid={!!fieldErrors.lhost}
                        className="h-10 font-mono text-sm bg-background border-border focus:border-primary/50 rounded-xl"
                      />
                      <div className="flex flex-wrap gap-2">
                        {(["10.10.14.3", "127.0.0.1", "0.0.0.0"] as const).map(
                          (preset) => (
                            <Button
                              key={preset}
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 px-2.5 text-[10px] font-mono border-border hover:border-primary/40 hover:bg-primary/5 rounded-lg transition-all duration-200"
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
                    <div className="flex h-10 items-center rounded-xl border border-border bg-muted/30 px-4 text-sm text-muted-foreground">
                      {t("attacker_ip_not_used")}
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor="builder-lport"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {t("port_label")}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1.5 px-2 text-[10px] text-muted-foreground hover:text-primary rounded-md"
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
                    className="h-10 font-mono text-sm bg-background border-border focus:border-primary/50 rounded-xl"
                  />
                  {fieldErrors.lport && (
                    <p className="text-xs text-destructive">
                      {t("validation_field_lport")}
                    </p>
                  )}
                </div>

                {connectionMode === "staged" && (
                  <div className="space-y-2.5 sm:col-span-2">
                    <Label
                      htmlFor="builder-http-port"
                      className="text-xs font-medium text-muted-foreground"
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
                      className="h-10 font-mono text-sm bg-background border-border focus:border-primary/50 rounded-xl"
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
              <div className="terminal-block p-4 rounded-xl">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {t("attacker_endpoint_label")}
                </p>
                <p className="font-mono text-sm">
                  <span className="text-muted-foreground">$ connect </span>
                  <span className="text-primary font-medium">
                    {showLhost
                      ? `${config.lhost}:${config.lport}`
                      : `:${config.lport}`}
                  </span>
                </p>
              </div>

              <p className="text-xs text-muted-foreground/80">
                {t("random_port_hint")}
              </p>
            </section>

            {listenerContent}
          </div>

          {/* Target Profile */}
          <section className="space-y-5 rounded-2xl border border-border bg-muted/5 p-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                <Monitor className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm font-semibold">
                {t("target_profile_title")}
              </p>
            </div>

            <div className="space-y-5">
              {/* Platform */}
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-3 w-3" />
                  {t("platform_filter_label")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_PLATFORM_FILTERS.map((platform) => {
                    const isSelected = platformFilter === platform;
                    return (
                      <Button
                        key={platform}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-8 px-3 text-xs rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "glow-neon-sm"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
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
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Cpu className="h-3 w-3" />
                  {t("architecture_filter_label")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_ARCHITECTURE_FILTERS.map((architecture) => {
                    const isSelected = architectureFilter === architecture;
                    return (
                      <Button
                        key={architecture}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-8 px-3 text-xs rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "glow-neon-sm"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
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
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  {t("network_egress_label")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {TARGET_NETWORK_EGRESS_FILTERS.map((network) => {
                    const isSelected = networkEgressFilter === network;
                    return (
                      <Button
                        key={network}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-8 px-3 text-xs rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "glow-neon-sm"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
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
              <div className="space-y-2.5">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Wrench className="h-3 w-3" />
                  {t("target_profile_tools_label")}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {VICTIM_TOOL_FILTERS.map((tool) => {
                    const isSelected = victimToolFilters.includes(tool);
                    return (
                      <Button
                        key={tool}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={`h-8 px-3 text-xs rounded-lg transition-all duration-200 ${
                          isSelected
                            ? "glow-neon-sm"
                            : "border-border hover:border-primary/40 hover:bg-primary/5"
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
                <p className="text-xs text-muted-foreground/80">
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

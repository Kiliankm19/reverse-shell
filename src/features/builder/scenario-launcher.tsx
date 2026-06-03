"use client";

import {
  ArrowRight,
  Globe2,
  HelpCircle,
  Lock,
  Server,
  Shield,
  Terminal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { BuilderState } from "@/features/builder/use-builder";
import type {
  ArchitectureFilter,
  NetworkEgressFilter,
  TechniqueTypeFilter,
} from "@/features/builder/constants";
import type { Platform, ShellFamily } from "@/lib/reverse-shells";
import { cn } from "@/lib/utils";

type ScenarioId = "web" | "linux" | "windows" | "tls" | "bind" | "unsure";

type Scenario = {
  id: ScenarioId;
  icon: typeof Globe2;
  templateId: string;
  platform: "all" | Platform;
  architecture: ArchitectureFilter;
  egress: NetworkEgressFilter;
  techniqueType: TechniqueTypeFilter;
  family: "all" | ShellFamily;
};

type ScenarioLauncherProps = Pick<
  BuilderState,
  | "handleTemplateChange"
  | "setPlatformFilter"
  | "setArchitectureFilter"
  | "setNetworkEgressFilter"
  | "setTechniqueTypeFilter"
  | "setFamilyFilter"
  | "patchConfig"
> & {
  onScenarioSelected?: () => void;
};

const SCENARIOS: Scenario[] = [
  {
    id: "web",
    icon: Globe2,
    templateId: "python3-socket",
    platform: "all",
    architecture: "all",
    egress: "http",
    techniqueType: "reverse",
    family: "python",
  },
  {
    id: "linux",
    icon: Terminal,
    templateId: "bash-dev-tcp",
    platform: "linux",
    architecture: "all",
    egress: "raw-tcp",
    techniqueType: "reverse",
    family: "bash",
  },
  {
    id: "windows",
    icon: Shield,
    templateId: "powershell-tcp-client",
    platform: "windows",
    architecture: "all",
    egress: "raw-tcp",
    techniqueType: "reverse",
    family: "powershell",
  },
  {
    id: "tls",
    icon: Lock,
    templateId: "openssl-fifo",
    platform: "linux",
    architecture: "all",
    egress: "tls",
    techniqueType: "reverse",
    family: "openssl",
  },
  {
    id: "bind",
    icon: Server,
    templateId: "nc-bind-e",
    platform: "linux",
    architecture: "all",
    egress: "all",
    techniqueType: "bind",
    family: "nc",
  },
  {
    id: "unsure",
    icon: HelpCircle,
    templateId: "bash-dev-tcp",
    platform: "all",
    architecture: "all",
    egress: "all",
    techniqueType: "reverse",
    family: "all",
  },
];

export function ScenarioLauncher({
  handleTemplateChange,
  setPlatformFilter,
  setArchitectureFilter,
  setNetworkEgressFilter,
  setTechniqueTypeFilter,
  setFamilyFilter,
  patchConfig,
  onScenarioSelected,
}: ScenarioLauncherProps) {
  const t = useTranslations("builder");

  function applyScenario(scenario: Scenario) {
    setTechniqueTypeFilter(scenario.techniqueType);
    setPlatformFilter(scenario.platform);
    setArchitectureFilter(scenario.architecture);
    setNetworkEgressFilter(scenario.egress);
    setFamilyFilter(scenario.family);
    handleTemplateChange(scenario.templateId);
    if (scenario.id === "web") patchConfig({ obfuscation: "url" });
    if (scenario.id === "tls") patchConfig({ lport: 443 });
    onScenarioSelected?.();
  }

  return (
    <Card className="mb-6 border-primary/20 bg-muted/20">
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{t("scenario_title")}</p>
            <p className="text-xs text-muted-foreground">
              {t("scenario_subtitle")}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("scenario_click_budget")}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
          {SCENARIOS.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => applyScenario(scenario)}
                className={cn(
                  "group rounded-lg border bg-background p-3 text-left transition-colors",
                  "hover:border-primary/50 hover:bg-muted/40",
                )}
              >
                <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-primary" />
                  {t(`scenarios.${scenario.id}.title`)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {t(`scenarios.${scenario.id}.description`)}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => onScenarioSelected?.()}
        >
          {t("scenario_skip")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

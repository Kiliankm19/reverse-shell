import {
  safeParseReverseShellConfig,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";
import {
  sanitizePersistedBuilderUi,
  type PersistedBuilderUi,
} from "@/features/builder/store";

export function configFromSearchParams(
  search: string,
): ReverseShellConfig | null {
  const params = new URLSearchParams(search);
  const templateId = params.get("template") ?? params.get("templateId");
  if (!templateId) return null;

  return safeParseReverseShellConfig({
    templateId,
    lhost: params.get("lhost") ?? undefined,
    lport: params.get("lport") ?? undefined,
    httpPort: params.get("httpPort") ?? undefined,
    shell: params.get("shell") ?? undefined,
    obfuscation: params.get("obfuscation") ?? undefined,
  });
}

export function uiFromSearchParams(
  search: string,
): Partial<PersistedBuilderUi> | null {
  const params = new URLSearchParams(search);
  const raw = {
    platformFilter: params.get("platform") ?? undefined,
    architectureFilter: params.get("arch") ?? undefined,
    victimToolFilters: params.get("tools")?.split(",") ?? undefined,
    networkEgressFilter: params.get("egress") ?? undefined,
    familyFilter: params.get("family") ?? undefined,
    techniqueTypeFilter: params.get("type") ?? undefined,
    selectedListenerId: params.get("listener") ?? undefined,
    stageTemplateId: params.get("stage") ?? undefined,
    selectedUpgradeRecipeId: params.get("upgrade") ?? undefined,
    selectedCleanupRecipeId: params.get("cleanup") ?? undefined,
  };
  const hasUiParams = Object.values(raw).some((value) => value !== undefined);
  if (!hasUiParams) return null;
  return sanitizePersistedBuilderUi(raw);
}

export function buildShareSearchParams(
  config: ReverseShellConfig,
  ui?: PersistedBuilderUi,
): string {
  const params = new URLSearchParams({
    template: config.templateId,
    lhost: config.lhost,
    lport: String(config.lport),
    shell: config.shell,
    obfuscation: config.obfuscation,
  });
  if (config.httpPort !== undefined) {
    params.set("httpPort", String(config.httpPort));
  }
  if (ui) {
    params.set("platform", ui.platformFilter);
    params.set("arch", ui.architectureFilter);
    if (ui.victimToolFilters.length > 0) {
      params.set("tools", ui.victimToolFilters.join(","));
    }
    params.set("egress", ui.networkEgressFilter);
    params.set("family", ui.familyFilter);
    params.set("type", ui.techniqueTypeFilter);
    if (ui.selectedListenerId) params.set("listener", ui.selectedListenerId);
    params.set("stage", ui.stageTemplateId);
    params.set("upgrade", ui.selectedUpgradeRecipeId);
    params.set("cleanup", ui.selectedCleanupRecipeId);
  }
  return params.toString();
}

export function syncShareUrl(
  config: ReverseShellConfig,
  ui?: PersistedBuilderUi,
): void {
  if (typeof window === "undefined") return;
  const safeConfig = safeParseReverseShellConfig(config);
  if (!safeConfig) return;
  const query = buildShareSearchParams(safeConfig, ui);
  const nextUrl = `${window.location.pathname}?${query}`;
  window.history.replaceState(null, "", nextUrl);
}

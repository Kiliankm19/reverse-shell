import type {
  ArchitectureFilter,
  NetworkEgressFilter,
  TechniqueTypeFilter,
  VictimToolFilter,
} from "@/features/builder/constants";
import {
  ARCHITECTURE_FILTERS,
  FAMILY_FILTERS,
  NETWORK_EGRESS_FILTERS,
  PLATFORM_FILTERS,
  TECHNIQUE_TYPE_FILTERS,
  VICTIM_TOOL_FILTERS,
} from "@/features/builder/constants";
import {
  defaultConfig,
  safeParseReverseShellConfig,
  type Platform,
  type ReverseShellConfig,
  type ShellFamily,
} from "@/lib/reverse-shells";

export const ACTIVE_CONFIG_KEY = "reverseshell:active-config";
export const PERSISTED_CONFIG_KEY = "reverseshell:persisted-config";
export const PERSISTED_UI_KEY = "reverseshell:builder-ui";

export interface PersistedBuilderUi {
  platformFilter: "all" | Platform;
  architectureFilter: ArchitectureFilter;
  victimToolFilters: VictimToolFilter[];
  networkEgressFilter: NetworkEgressFilter;
  familyFilter: "all" | ShellFamily;
  techniqueTypeFilter: TechniqueTypeFilter;
  selectedListenerId: string | null;
  stageTemplateId: string;
  selectedUpgradeRecipeId: string;
  selectedCleanupRecipeId: string;
}

function includesValue<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return typeof value === "string" && values.includes(value);
}

function readStringArray<T extends readonly string[]>(
  values: T,
  value: unknown,
): Array<T[number]> {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is T[number] => includesValue(values, item));
}

export function sanitizePersistedBuilderUi(
  value: unknown,
): Partial<PersistedBuilderUi> {
  if (!value || typeof value !== "object") return {};
  const raw = value as Record<string, unknown>;
  return {
    platformFilter: includesValue(PLATFORM_FILTERS, raw.platformFilter)
      ? raw.platformFilter
      : undefined,
    architectureFilter: includesValue(
      ARCHITECTURE_FILTERS,
      raw.architectureFilter,
    )
      ? raw.architectureFilter
      : undefined,
    victimToolFilters: readStringArray(
      VICTIM_TOOL_FILTERS,
      raw.victimToolFilters,
    ),
    networkEgressFilter: includesValue(
      NETWORK_EGRESS_FILTERS,
      raw.networkEgressFilter,
    )
      ? raw.networkEgressFilter
      : undefined,
    familyFilter: includesValue(FAMILY_FILTERS, raw.familyFilter)
      ? raw.familyFilter
      : undefined,
    techniqueTypeFilter: includesValue(
      TECHNIQUE_TYPE_FILTERS,
      raw.techniqueTypeFilter,
    )
      ? raw.techniqueTypeFilter
      : undefined,
    selectedListenerId:
      typeof raw.selectedListenerId === "string" ||
      raw.selectedListenerId === null
        ? raw.selectedListenerId
        : undefined,
    stageTemplateId:
      typeof raw.stageTemplateId === "string" ? raw.stageTemplateId : undefined,
    selectedUpgradeRecipeId:
      typeof raw.selectedUpgradeRecipeId === "string"
        ? raw.selectedUpgradeRecipeId
        : undefined,
    selectedCleanupRecipeId:
      typeof raw.selectedCleanupRecipeId === "string"
        ? raw.selectedCleanupRecipeId
        : undefined,
  };
}

/** One-shot transfer when loading a collection into the builder. */
export function saveActiveConfig(config: ReverseShellConfig): void {
  const safeConfig = safeParseReverseShellConfig(config);
  if (!safeConfig) return;
  localStorage.setItem(ACTIVE_CONFIG_KEY, JSON.stringify(safeConfig));
}

export function readActiveConfig(): ReverseShellConfig | null {
  const raw = localStorage.getItem(ACTIVE_CONFIG_KEY);
  if (!raw) return null;
  localStorage.removeItem(ACTIVE_CONFIG_KEY);
  try {
    return safeParseReverseShellConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function readPersistedConfig(): ReverseShellConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PERSISTED_CONFIG_KEY);
  if (!raw) return null;
  try {
    return safeParseReverseShellConfig(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function clearPersistedConfig(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_CONFIG_KEY);
  localStorage.removeItem(PERSISTED_CONFIG_KEY);
}

export function persistBuilderConfig(config: ReverseShellConfig): void {
  if (typeof window === "undefined") return;
  const safeConfig = safeParseReverseShellConfig(config);
  if (!safeConfig) return;
  localStorage.setItem(PERSISTED_CONFIG_KEY, JSON.stringify(safeConfig));
}

export function readPersistedBuilderUi(): Partial<PersistedBuilderUi> | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PERSISTED_UI_KEY);
  if (!raw) return null;
  try {
    return sanitizePersistedBuilderUi(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function persistBuilderUi(ui: PersistedBuilderUi): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERSISTED_UI_KEY, JSON.stringify(ui));
}

export function readInitialBuilderConfig(): ReverseShellConfig {
  return readActiveConfig() ?? readPersistedConfig() ?? defaultConfig();
}

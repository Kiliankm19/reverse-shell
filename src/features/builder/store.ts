import {
  defaultConfig,
  safeParseReverseShellConfig,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

export const ACTIVE_CONFIG_KEY = "reverseshell:active-config";
export const PERSISTED_CONFIG_KEY = "reverseshell:persisted-config";

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

export function persistBuilderConfig(config: ReverseShellConfig): void {
  if (typeof window === "undefined") return;
  const safeConfig = safeParseReverseShellConfig(config);
  if (!safeConfig) return;
  localStorage.setItem(PERSISTED_CONFIG_KEY, JSON.stringify(safeConfig));
}

export function readInitialBuilderConfig(): ReverseShellConfig {
  return readActiveConfig() ?? readPersistedConfig() ?? defaultConfig();
}

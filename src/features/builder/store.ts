import {
  safeParseReverseShellConfig,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

export const ACTIVE_CONFIG_KEY = "reverseshell:active-config";

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

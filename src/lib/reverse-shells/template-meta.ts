import { getTemplate, reverseShellTemplates } from "./catalog";
import type { PayloadConnectionMode, ReverseShellTemplate } from "./types";

export function getConnectionMode(
  template: ReverseShellTemplate,
): PayloadConnectionMode {
  if (template.family === "bind") return "bind";
  if (template.family === "staged") return "staged";
  if (template.id === "powershell-hoaxshell-style") return "http-callback";
  return "reverse";
}

export function getConnectionModeById(templateId: string): PayloadConnectionMode {
  return getConnectionMode(getTemplate(templateId));
}

export function usesCallbackHost(mode: PayloadConnectionMode): boolean {
  return mode === "reverse" || mode === "staged" || mode === "http-callback";
}

export function usesBindPortOnly(mode: PayloadConnectionMode): boolean {
  return mode === "bind";
}

export function supportsStageFile(mode: PayloadConnectionMode): boolean {
  return mode === "staged";
}

export function supportsHttpServerNotes(mode: PayloadConnectionMode): boolean {
  return mode === "http-callback";
}

export function usesShellInput(templateId: string): boolean {
  const template = getTemplate(templateId);
  return !["powershell", "ruby"].includes(template.family);
}

export const templateCount = reverseShellTemplates.length;

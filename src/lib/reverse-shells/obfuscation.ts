import { getTemplate } from "./catalog";
import type { ObfuscationMode, ReverseShellTemplate } from "./types";

const COMMON_MODES: ObfuscationMode[] = ["none", "url"];
const BASH_WRAPPER_MODES: ObfuscationMode[] = [
  "bash-base64",
  "bash-ifs",
  "bash-rev",
];
const PYTHON_WRAPPER_MODES: ObfuscationMode[] = [
  "python-chr",
];
const POWERSHELL_MODES: ObfuscationMode[] = [
  "powershell-encoded",
  "powershell-concat",
];

export function compatibleObfuscationModes(
  template: ReverseShellTemplate,
): ObfuscationMode[] {
  if (template.family === "powershell") {
    return [...COMMON_MODES, ...POWERSHELL_MODES];
  }

  if (template.family === "bash" || template.family === "staged") {
    return [...COMMON_MODES, ...BASH_WRAPPER_MODES, ...PYTHON_WRAPPER_MODES];
  }

  if (template.family === "python") {
    return [...COMMON_MODES, ...PYTHON_WRAPPER_MODES];
  }

  return COMMON_MODES;
}

export function isObfuscationCompatible(
  template: ReverseShellTemplate,
  mode: ObfuscationMode,
): boolean {
  return compatibleObfuscationModes(template).includes(mode);
}

export function safeObfuscationForTemplate(
  templateId: string,
  mode: ObfuscationMode,
): ObfuscationMode {
  const template = getTemplate(templateId);
  return isObfuscationCompatible(template, mode) ? mode : "none";
}

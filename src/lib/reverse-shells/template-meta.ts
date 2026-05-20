import { getTemplate, reverseShellTemplates } from "./catalog";
import type {
  ListenerTemplate,
  PayloadConnectionMode,
  ReverseShellTemplate,
} from "./types";

/** Per-template listener recommendations (see listener page for full catalog). */
export const RECOMMENDED_LISTENER_BY_TEMPLATE: Partial<
  Record<string, ListenerTemplate["id"]>
> = {
  "nc-e": "nc",
  "nc-mkfifo": "nc",
  "bash-dev-tcp": "rlwrap-nc",
  "bash-fd-196": "rlwrap-nc",
  "python3-socket": "rlwrap-nc",
  "php-proc-open": "rlwrap-nc",
  "perl-socket": "rlwrap-nc",
  "ruby-socket": "rlwrap-nc",
  "powershell-tcp-client": "nc",
  "bash-curl-staged": "rlwrap-nc",
  "nc-bind-e": "bind-connect",
  "python3-bind": "bind-connect",
  "socat-pty": "socat-tty",
};

export function getRecommendedListenerId(
  templateId: string,
): ListenerTemplate["id"] | "hoax-http" {
  if (templateId.includes("bind")) return "bind-connect";
  if (templateId === "powershell-hoaxshell-style") return "hoax-http";
  return RECOMMENDED_LISTENER_BY_TEMPLATE[templateId] ?? "rlwrap-nc";
}

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

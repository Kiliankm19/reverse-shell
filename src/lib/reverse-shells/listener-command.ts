import { listenerTemplates } from "./catalog";
import type { ListenerTemplate } from "./types";
import { getRecommendedListenerId } from "./template-meta";

export function getListenerTemplate(
  listenerId: ListenerTemplate["id"] | "hoax-http",
): ListenerTemplate | null {
  if (listenerId === "hoax-http") return null;
  return listenerTemplates.find((item) => item.id === listenerId) ?? null;
}

export function buildListenerCommand(
  listenerId: ListenerTemplate["id"] | "hoax-http",
  lhost: string,
  lport: number,
): string | null {
  const template = getListenerTemplate(listenerId);
  if (!template) return null;
  return template.command(lport, lhost);
}

export function getRecommendedListenerCommand(
  templateId: string,
  lhost: string,
  lport: number,
): {
  listenerId: ListenerTemplate["id"] | "hoax-http";
  command: string | null;
} {
  const listenerId = getRecommendedListenerId(templateId);
  return {
    listenerId,
    command: buildListenerCommand(listenerId, lhost, lport),
  };
}

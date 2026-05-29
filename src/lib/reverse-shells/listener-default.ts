import { getRecommendedListenerId } from "./template-meta";
import type { ListenerTemplate } from "./types";

const PLAIN_DEFAULT_LISTENER: ListenerTemplate["id"] = "nc";

const SPECIAL_LISTENER_IDS = new Set<ListenerTemplate["id"] | "hoax-http">([
  "hoax-http",
  "bind-connect",
  "ncat",
  "ncat-keep-open",
  "ncat-ssl",
  "ncat-ssl-keep-open",
  "openssl-server",
  "socat-tty",
  "socat-fork",
  "powercat",
  "msfconsole",
  "msfconsole-windows",
]);

export function getSmartDefaultListenerId(
  templateId: string,
): ListenerTemplate["id"] | "hoax-http" {
  const recommended = getRecommendedListenerId(templateId);

  if (SPECIAL_LISTENER_IDS.has(recommended)) {
    return recommended;
  }

  if (recommended.startsWith("msfconsole")) {
    return recommended;
  }

  return PLAIN_DEFAULT_LISTENER;
}

import {
  safeParseReverseShellConfig,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

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

export function buildShareSearchParams(config: ReverseShellConfig): string {
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
  return params.toString();
}

export function syncShareUrl(config: ReverseShellConfig): void {
  if (typeof window === "undefined") return;
  const safeConfig = safeParseReverseShellConfig(config);
  if (!safeConfig) return;
  const query = buildShareSearchParams(safeConfig);
  const nextUrl = `${window.location.pathname}?${query}`;
  window.history.replaceState(null, "", nextUrl);
}

import type { ReverseShellConfig } from "@/lib/reverse-shells";

export const PLAYBOOK_PRESETS: Record<
  string,
  { templateId: string; config: Partial<ReverseShellConfig> }
> = {
  web: {
    templateId: "python3-socket",
    config: {
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "url",
    },
  },
  linux: {
    templateId: "bash-dev-tcp",
    config: {
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "none",
    },
  },
  windows: {
    templateId: "powershell-tcp-client",
    config: {
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "cmd.exe",
      obfuscation: "none",
    },
  },
  tls: {
    templateId: "openssl-fifo",
    config: {
      lhost: "10.10.14.3",
      lport: 443,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  },
  bind: {
    templateId: "nc-bind-e",
    config: {
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  },
  staged: {
    templateId: "bash-curl-staged",
    config: {
      lhost: "10.10.14.3",
      lport: 4444,
      httpPort: 8080,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  },
};

export function playbookBuilderUrl(scenarioId: string): string {
  const preset = PLAYBOOK_PRESETS[scenarioId];
  if (!preset) return "/builder";
  const params = new URLSearchParams({
    template: preset.templateId,
    lhost: preset.config.lhost ?? "10.10.14.3",
    lport: String(preset.config.lport ?? 4444),
    shell: preset.config.shell ?? "/bin/sh",
    obfuscation: preset.config.obfuscation ?? "none",
  });
  if (preset.config.httpPort !== undefined) {
    params.set("httpPort", String(preset.config.httpPort));
  }
  return `/builder?${params.toString()}`;
}

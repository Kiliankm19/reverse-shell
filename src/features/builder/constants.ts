import type {
  ObfuscationMode,
  Platform,
  ReverseShellTemplate,
  ShellFamily,
} from "@/lib/reverse-shells";

export const obfuscationKeys: Array<{
  value: ObfuscationMode;
  labelKey:
    | "obfuscation_none"
    | "obfuscation_url"
    | "obfuscation_url_double"
    | "obfuscation_base64"
    | "obfuscation_hex"
    | "obfuscation_bash_base64"
    | "obfuscation_bash_base64_no_spaces"
    | "obfuscation_bash_ifs"
    | "obfuscation_bash_rev"
    | "obfuscation_bash_printf_hex"
    | "obfuscation_ps_enc"
    | "obfuscation_ps_concat"
    | "obfuscation_ps_base64"
    | "obfuscation_python_chr";
}> = [
  { value: "none", labelKey: "obfuscation_none" },
  { value: "url", labelKey: "obfuscation_url" },
  { value: "url-double", labelKey: "obfuscation_url_double" },
  { value: "base64", labelKey: "obfuscation_base64" },
  { value: "hex", labelKey: "obfuscation_hex" },
  { value: "bash-base64", labelKey: "obfuscation_bash_base64" },
  {
    value: "bash-base64-no-spaces",
    labelKey: "obfuscation_bash_base64_no_spaces",
  },
  { value: "bash-ifs", labelKey: "obfuscation_bash_ifs" },
  { value: "bash-rev", labelKey: "obfuscation_bash_rev" },
  { value: "bash-printf-hex", labelKey: "obfuscation_bash_printf_hex" },
  { value: "powershell-encoded", labelKey: "obfuscation_ps_enc" },
  { value: "powershell-concat", labelKey: "obfuscation_ps_concat" },
  { value: "powershell-base64", labelKey: "obfuscation_ps_base64" },
  { value: "python-chr", labelKey: "obfuscation_python_chr" },
];

export const PLATFORM_FILTERS: Array<"all" | Platform> = [
  "all",
  "linux",
  "macos",
  "windows",
  "multi",
];

export const ARCHITECTURE_FILTERS = [
  "all",
  "x64",
  "x86",
  "aarch64",
  "arm",
] as const;

export type ArchitectureFilter = (typeof ARCHITECTURE_FILTERS)[number];

export const VICTIM_TOOL_FILTERS = [
  "bash",
  "sh",
  "nc",
  "ncat",
  "python",
  "python3",
  "python2",
  "php",
  "perl",
  "ruby",
  "node",
  "powershell",
  "curl",
  "wget",
  "socat",
  "openssl",
] as const;

export type VictimToolFilter = (typeof VICTIM_TOOL_FILTERS)[number];

export const NETWORK_EGRESS_FILTERS = [
  "all",
  "raw-tcp",
  "http",
  "tls",
] as const;

export type NetworkEgressFilter = (typeof NETWORK_EGRESS_FILTERS)[number];

export const FAMILY_FILTERS: Array<"all" | ShellFamily> = [
  "all",
  "bash",
  "sh",
  "nc",
  "python",
  "php",
  "perl",
  "ruby",
  "node",
  "java",
  "go",
  "lua",
  "awk",
  "openssl",
  "telnet",
  "socat",
  "cmd",
  "powershell",
  "staged",
  "bind",
];

export const TECHNIQUE_TYPE_FILTERS = [
  "reverse",
  "bind",
  "msfvenom",
  "hoaxshell",
  "assembled",
  "encrypted",
] as const;

export type TechniqueTypeFilter = (typeof TECHNIQUE_TYPE_FILTERS)[number];

export interface TemplateFilterState {
  platform: "all" | Platform;
  architecture: ArchitectureFilter;
  victimTools: VictimToolFilter[];
  networkEgress: NetworkEgressFilter;
  family: "all" | ShellFamily;
  techniqueType: TechniqueTypeFilter;
}

export function matchesPlatformFilter(
  templatePlatform: Platform,
  platformFilter: "all" | Platform,
) {
  return (
    platformFilter === "all" ||
    templatePlatform === platformFilter ||
    templatePlatform === "multi"
  );
}

function templateArchitecture(
  templateId: string,
): "generic" | "x64" | "x86" | "aarch64" | "arm" {
  const id = templateId.toLowerCase();
  if (id.includes("aarch64") || id.includes("arm64")) return "aarch64";
  if (id.includes("x64") || id.includes("amd64")) return "x64";
  if (id.includes("x86") || id.includes("i386") || id.includes("i686")) {
    return "x86";
  }
  if (id.includes("arm")) return "arm";
  return "generic";
}

export function matchesArchitecture(
  template: Pick<ReverseShellTemplate, "id">,
  architectureFilter: ArchitectureFilter,
) {
  if (architectureFilter === "all") return true;
  const architecture = templateArchitecture(template.id);
  return architecture === "generic" || architecture === architectureFilter;
}

function isEncryptedTemplate(
  template: Pick<ReverseShellTemplate, "family" | "id">,
) {
  return (
    template.family === "openssl" ||
    template.id.includes("ssl") ||
    template.id.includes("tls") ||
    template.id.includes("openssl")
  );
}

function isHttpTemplate(template: Pick<ReverseShellTemplate, "family" | "id">) {
  return (
    template.family === "staged" ||
    template.id.includes("hoaxshell") ||
    template.id.includes("http") ||
    template.id.includes("curl") ||
    template.id.includes("wget")
  );
}

function templateTools(
  template: Pick<ReverseShellTemplate, "family" | "id">,
): VictimToolFilter[] {
  const id = template.id.toLowerCase();
  const tools = new Set<VictimToolFilter>();

  if (id.includes("python3")) tools.add("python3");
  if (id.includes("python2")) tools.add("python2");
  if (
    template.family === "python" &&
    !id.includes("python3") &&
    !id.includes("python2")
  ) {
    tools.add("python");
  }
  if (id.includes("bash")) tools.add("bash");
  if (template.family === "bash" && !id.includes("zsh")) tools.add("bash");
  if (template.family === "sh" || id.startsWith("sh-") || id.includes("-sh-")) {
    tools.add("sh");
  }
  if (id.includes("ncat")) {
    tools.add("ncat");
  } else if (template.family === "nc" || id.includes("nc-")) {
    tools.add("nc");
  }
  if (template.family === "php") tools.add("php");
  if (template.family === "perl") tools.add("perl");
  if (template.family === "ruby") tools.add("ruby");
  if (template.family === "node") tools.add("node");
  if (template.family === "powershell" || id.includes("powershell")) {
    tools.add("powershell");
  }
  if (id.includes("curl")) tools.add("curl");
  if (id.includes("wget")) tools.add("wget");
  if (template.family === "socat" || id.includes("socat")) tools.add("socat");
  if (template.family === "openssl" || id.startsWith("openssl-")) {
    tools.add("openssl");
  }

  return Array.from(tools);
}

export function matchesVictimTools(
  template: Pick<ReverseShellTemplate, "family" | "id">,
  victimTools: VictimToolFilter[],
) {
  if (victimTools.length === 0) return true;
  const tools = templateTools(template);
  if (tools.length === 0) return false;
  return tools.every((tool) => victimTools.includes(tool));
}

export function matchesNetworkEgress(
  template: Pick<ReverseShellTemplate, "family" | "id">,
  networkEgress: NetworkEgressFilter,
) {
  if (networkEgress === "all") return true;
  if (networkEgress === "tls") return isEncryptedTemplate(template);
  if (networkEgress === "http") return isHttpTemplate(template);
  return !isEncryptedTemplate(template) && !isHttpTemplate(template);
}

export function matchesTechniqueType(
  template: Pick<ReverseShellTemplate, "family" | "id">,
  typeFilter: TechniqueTypeFilter,
) {
  if (typeFilter === "bind") return template.family === "bind";
  if (typeFilter === "msfvenom") return template.id.startsWith("msfvenom-");
  if (typeFilter === "hoaxshell") return template.id.includes("hoaxshell");
  if (typeFilter === "assembled") return template.family === "staged";
  if (typeFilter === "encrypted") {
    return isEncryptedTemplate(template);
  }

  return (
    template.family !== "bind" &&
    template.family !== "staged" &&
    !template.id.startsWith("msfvenom-") &&
    !template.id.includes("hoaxshell")
  );
}

export function templateMatchesFilters(
  template: ReverseShellTemplate,
  filters: TemplateFilterState,
) {
  return (
    matchesPlatformFilter(template.platform, filters.platform) &&
    matchesArchitecture(template, filters.architecture) &&
    matchesVictimTools(template, filters.victimTools) &&
    matchesNetworkEgress(template, filters.networkEgress) &&
    (filters.family === "all" || template.family === filters.family) &&
    matchesTechniqueType(template, filters.techniqueType)
  );
}

export function familyAvailableForFilters(
  templates: ReverseShellTemplate[],
  family: "all" | ShellFamily,
  filters: Omit<TemplateFilterState, "family">,
) {
  return (
    family === "all" ||
    templates.some((template) =>
      templateMatchesFilters(template, { ...filters, family }),
    )
  );
}

export const SHELL_OPTIONS = [
  "/bin/sh",
  "/bin/bash",
  "/bin/dash",
  "/bin/zsh",
  "/bin/ash",
  "sh",
  "bash",
  "dash",
  "zsh",
  "cmd.exe",
  "powershell.exe",
  "pwsh.exe",
];

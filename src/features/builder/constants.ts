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
] as const;

export type TechniqueTypeFilter = (typeof TECHNIQUE_TYPE_FILTERS)[number];

export function matchesTechniqueType(
  template: Pick<ReverseShellTemplate, "family" | "id">,
  typeFilter: TechniqueTypeFilter,
) {
  if (typeFilter === "bind") return template.family === "bind";
  if (typeFilter === "msfvenom") return template.id.startsWith("msfvenom-");
  if (typeFilter === "hoaxshell") return template.id.includes("hoaxshell");
  if (typeFilter === "assembled") return template.family === "staged";

  return (
    template.family !== "bind" &&
    template.family !== "staged" &&
    !template.id.startsWith("msfvenom-") &&
    !template.id.includes("hoaxshell")
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

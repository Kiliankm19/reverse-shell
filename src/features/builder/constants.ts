import type {
  ObfuscationMode,
  Platform,
  ShellFamily,
} from "@/lib/reverse-shells";

export const obfuscationKeys: Array<{
  value: ObfuscationMode;
  labelKey:
    | "obfuscation_none"
    | "obfuscation_url"
    | "obfuscation_bash_base64"
    | "obfuscation_bash_ifs"
    | "obfuscation_bash_rev"
    | "obfuscation_ps_enc"
    | "obfuscation_ps_concat"
    | "obfuscation_python_chr";
}> = [
  { value: "none", labelKey: "obfuscation_none" },
  { value: "url", labelKey: "obfuscation_url" },
  { value: "bash-base64", labelKey: "obfuscation_bash_base64" },
  { value: "bash-ifs", labelKey: "obfuscation_bash_ifs" },
  { value: "bash-rev", labelKey: "obfuscation_bash_rev" },
  { value: "powershell-encoded", labelKey: "obfuscation_ps_enc" },
  { value: "powershell-concat", labelKey: "obfuscation_ps_concat" },
  { value: "python-chr", labelKey: "obfuscation_python_chr" },
];

export const PLATFORM_FILTERS: Array<"all" | Platform> = [
  "all",
  "linux",
  "windows",
  "multi",
];

export const FAMILY_FILTERS: Array<"all" | ShellFamily> = [
  "all",
  "bash",
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
  "powershell",
  "staged",
  "bind",
];

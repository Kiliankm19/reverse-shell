export type Platform = "linux" | "windows" | "multi";

export type ShellFamily =
  | "bash"
  | "nc"
  | "python"
  | "php"
  | "perl"
  | "ruby"
  | "node"
  | "java"
  | "go"
  | "lua"
  | "awk"
  | "openssl"
  | "telnet"
  | "socat"
  | "powershell"
  | "staged"
  | "bind";

export type PayloadConnectionMode =
  | "reverse"
  | "bind"
  | "staged"
  | "http-callback";

export type ObfuscationMode =
  | "none"
  | "url"
  | "bash-base64"
  | "bash-ifs"
  | "bash-rev"
  | "powershell-encoded"
  | "powershell-concat"
  | "python-chr";

export interface ReverseShellTemplate {
  id: string;
  name: string;
  family: ShellFamily;
  platform: Platform;
  description: string;
  defaultShell: string;
  render: (config: ReverseShellConfig) => string;
}

export interface ReverseShellConfig {
  templateId: string;
  lhost: string;
  lport: number;
  httpPort?: number;
  shell: string;
  obfuscation: ObfuscationMode;
}

export interface GeneratedReverseShell {
  template: ReverseShellTemplate;
  rawCommand: string;
  command: string;
  notes: string[];
}

export interface ListenerTemplate {
  id: string;
  name: string;
  description: string;
  command: (lport: number, lhost: string) => string;
}

export interface UpgradeRecipe {
  id: string;
  name: string;
  platform: Platform;
  description: string;
  steps: (shell: string, attackerHost: string, port: number) => string[];
}

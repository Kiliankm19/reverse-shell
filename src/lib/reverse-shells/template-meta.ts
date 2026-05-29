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
  "nc-openbsd-mkfifo": "nc",
  "nc-traditional-e": "nc-traditional",
  "nc-c-exec": "nc",
  "ncat-ssl-exec": "ncat-ssl",
  "macos-nc-mkfifo": "nc",
  "ncat-exec": "ncat",
  "ncat-sh-c": "ncat",
  "bash-dev-tcp": "rlwrap-nc",
  "bash-fd-196": "rlwrap-nc",
  "bash-c-exec": "rlwrap-nc",
  "bash-5-fd": "rlwrap-nc",
  "bash-read-line": "rlwrap-nc",
  "sh-dev-tcp": "rlwrap-nc",
  "dash-dev-tcp": "rlwrap-nc",
  "macos-bash-dev-tcp": "rlwrap-nc",
  "python3-socket": "rlwrap-nc",
  "python-socket": "rlwrap-nc",
  "python2-socket": "rlwrap-nc",
  "python3-pty": "rlwrap-nc",
  "python-pty": "rlwrap-nc",
  "python2-pty": "rlwrap-nc",
  "python3-subprocess": "rlwrap-nc",
  "python-subprocess": "rlwrap-nc",
  "python2-subprocess": "rlwrap-nc",
  "python3-no-spaces": "rlwrap-nc",
  "python3-ssl-socket": "ncat-ssl",
  "python-ssl-socket": "ncat-ssl",
  "python2-ssl-socket": "ncat-ssl",
  "nodejs-child-process": "rlwrap-nc",
  "nodejs-command-loop": "rlwrap-nc",
  "nodejs-reverse-sh": "rlwrap-nc",
  "nodejs-tls-child-process": "ncat-ssl",
  "java-runtime": "rlwrap-nc",
  "jshell-processbuilder": "rlwrap-nc",
  "awk-tcp": "rlwrap-nc",
  "awk-sh-loop": "rlwrap-nc",
  "lua-socket": "rlwrap-nc",
  "lua-os-execute": "rlwrap-nc",
  "php-proc-open": "rlwrap-nc",
  "php-fsockopen-exec": "rlwrap-nc",
  "php-cmd": "rlwrap-nc",
  "php-cmd-2": "rlwrap-nc",
  "php-shell-exec": "rlwrap-nc",
  "php-fsockopen-system": "rlwrap-nc",
  "php-fsockopen-passthru": "rlwrap-nc",
  "php-popen": "rlwrap-nc",
  "php-stream-socket-loop": "rlwrap-nc",
  "php-ssl-fsockopen": "ncat-ssl",
  "php-ssl-stream-socket": "ncat-ssl",
  "perl-socket": "rlwrap-nc",
  "perl-dup2": "rlwrap-nc",
  "ruby-socket": "rlwrap-nc",
  "ruby-stdio-reopen": "rlwrap-nc",
  "ruby-exec": "rlwrap-nc",
  "ruby-openssl": "ncat-ssl",
  "powershell-tcp-client": "nc",
  "powershell-tls-schannel": "ncat-ssl",
  "powershell-nishang-style": "nc",
  "powershell-powercat": "nc",
  "powershell-iex": "nc",
  "powershell-downloadstring": "rlwrap-nc",
  "zsh-dev-tcp": "rlwrap-nc",
  "zsh-fd": "rlwrap-nc",
  "golang-tcp": "rlwrap-nc",
  "golang-bash": "rlwrap-nc",
  "msfvenom-bash": "rlwrap-nc",
  "msfvenom-linux-x64-elf": "msfconsole",
  "msfvenom-linux-x86-elf": "msfconsole",
  "msfvenom-windows-x64-exe": "msfconsole-windows",
  "msfvenom-windows-x86-exe": "msfconsole-windows",
  "msfvenom-macos-x64-macho": "msfconsole",
  "msfvenom-php-reverse": "msfconsole",
  "msfvenom-python-reverse": "msfconsole",
  "msfvenom-bash-cmd": "msfconsole",
  "msfvenom-perl-cmd": "msfconsole",
  "msfvenom-nodejs-cmd": "msfconsole",
  "msfvenom-java-jar": "msfconsole",
  "msfvenom-jsp": "msfconsole",
  "msfvenom-war": "msfconsole",
  "msfvenom-asp": "msfconsole-windows",
  "msfvenom-aspx": "msfconsole-windows",
  "msfvenom-linux-aarch64-elf": "msfconsole",
  "msfvenom-powershell-cmd": "msfconsole-windows",
  "msfvenom-ruby-cmd": "msfconsole",
  "bash-curl-staged": "rlwrap-nc",
  "bash-wget-staged": "rlwrap-nc",
  "python3-http-staged": "rlwrap-nc",
  "python-http-staged": "rlwrap-nc",
  "python2-http-staged": "rlwrap-nc",
  "bash-curl-dropper-staged": "rlwrap-nc",
  "bash-wget-dropper-staged": "rlwrap-nc",
  "macos-curl-zsh-staged": "rlwrap-nc",
  "windows-certutil-staged": "rlwrap-nc",
  "windows-powershell-iex-staged": "rlwrap-nc",
  "nodejs-http-staged": "rlwrap-nc",
  "php-http-staged": "rlwrap-nc",
  "perl-http-staged": "rlwrap-nc",
  "ruby-http-staged": "rlwrap-nc",
  "staged-busybox-wget": "rlwrap-nc",
  "nc-bind-e": "bind-connect",
  "ncat-bind-exec": "bind-connect",
  "python3-bind": "bind-connect",
  "python-bind": "bind-connect",
  "python2-bind": "bind-connect",
  "socat-bind-pty": "bind-connect",
  "php-bind-shell": "bind-connect",
  "ruby-bind-shell": "bind-connect",
  "nodejs-bind-shell": "bind-connect",
  "busybox-nc-bind": "bind-connect",
  "bind-nc-traditional-e": "bind-connect",
  "bind-perl-socket": "bind-connect",
  "bind-powershell-tcp-listener": "bind-connect",
  "bind-cmd-nc-listen": "bind-connect",
  "golang-bind-tcp": "bind-connect",
  "lua-bind-tcp": "bind-connect",
  "socat-pty": "socat-tty",
  "socat-exec": "socat-fork",
  "socat-tcp4-exec": "socat-tty",
  "socat-openssl": "openssl-server",
  "openssl-fifo": "openssl-server",
  "openssl-client": "openssl-server",
  "busybox-nc-e": "nc",
  "telnet-mkfifo": "nc",
  "telnet-double": "nc",
  "cmd-ncat-exec": "ncat",
  "cmd-ncat-e": "ncat",
  "cmd-nc-e": "nc",
  "cmd-powercat-exe": "powercat",
  "cmd-telnet-double": "nc",
  "cmd-powershell-tcp-reverse": "nc",
};

export function getRecommendedListenerId(
  templateId: string,
): ListenerTemplate["id"] | "hoax-http" {
  if (templateId.includes("bind")) return "bind-connect";
  if (templateId.includes("hoaxshell")) return "hoax-http";
  return RECOMMENDED_LISTENER_BY_TEMPLATE[templateId] ?? "rlwrap-nc";
}

export function getConnectionMode(
  template: ReverseShellTemplate,
): PayloadConnectionMode {
  if (template.family === "bind") return "bind";
  if (template.family === "staged") return "staged";
  if (template.id.includes("hoaxshell")) return "http-callback";
  return "reverse";
}

export function getConnectionModeById(
  templateId: string,
): PayloadConnectionMode {
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
  return !["powershell", "ruby", "lua", "awk", "go"].includes(template.family);
}

export const templateCount = reverseShellTemplates.length;

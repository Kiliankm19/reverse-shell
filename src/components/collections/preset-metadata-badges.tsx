"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  getConnectionModeById,
  getTemplate,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

interface PresetMetadataBadgesProps {
  config: ReverseShellConfig;
  className?: string;
}

export function PresetMetadataBadges({
  config,
  className,
}: PresetMetadataBadgesProps) {
  const t = useTranslations("collections");
  const template = getTemplate(config.templateId);
  const mode = getConnectionModeById(config.templateId);

  const platform =
    template.platform === "multi"
      ? t("metadata.platform_multi")
      : t(`metadata.platform_${template.platform}`);

  const modeLabel = t(
    `metadata.mode_${mode}` as
      | "metadata.mode_reverse"
      | "metadata.mode_bind"
      | "metadata.mode_staged"
      | "metadata.mode_http-callback",
  );
  const obfuscation = t(obfuscationLabelKey(config.obfuscation));

  const egress =
    template.family === "openssl" ||
    config.templateId.includes("ssl") ||
    config.templateId.includes("tls")
      ? t("metadata.egress_tls")
      : config.templateId.includes("hoaxshell") ||
          config.templateId.includes("http")
        ? t("metadata.egress_http")
        : t("metadata.egress_tcp");

  const items = [platform, modeLabel, egress, obfuscation];

  return (
    <div className={`flex flex-wrap gap-1.5 ${className ?? ""}`}>
      {items.map((label) => (
        <Badge
          key={label}
          variant="secondary"
          className="font-mono text-[10px] uppercase tracking-wide"
        >
          {label}
        </Badge>
      ))}
    </div>
  );
}

function obfuscationLabelKey(mode: ReverseShellConfig["obfuscation"]): string {
  return `obfuscation.${mode}`;
}

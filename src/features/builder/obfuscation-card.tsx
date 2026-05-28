"use client";

import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { obfuscationKeys } from "@/features/builder/constants";
import type { BuilderState } from "@/features/builder/use-builder";
import type { ObfuscationMode } from "@/lib/reverse-shells";

type ObfuscationCardProps = Pick<
  BuilderState,
  "config" | "patchConfig" | "compatibleOptions"
>;

export function ObfuscationCard({
  config,
  patchConfig,
  compatibleOptions,
}: ObfuscationCardProps) {
  const t = useTranslations("builder");

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Wand2 className="h-4 w-4 text-primary" /> {t("obfuscation_label")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("obfuscation_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select
          value={config.obfuscation}
          onValueChange={(value) =>
            patchConfig({ obfuscation: value as ObfuscationMode })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {obfuscationKeys
              .filter((option) => compatibleOptions.includes(option.value))
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{t("obfuscation_note")}</p>
        <p className="text-xs text-muted-foreground">
          {t("obfuscation_compat_note")}
        </p>
      </CardContent>
    </Card>
  );
}

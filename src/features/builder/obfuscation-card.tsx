"use client";

import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
> & {
  embedded?: boolean;
};

export function ObfuscationCard({
  config,
  patchConfig,
  compatibleOptions,
  embedded = false,
}: ObfuscationCardProps) {
  const t = useTranslations("builder");
  const content = (
    <>
      <div className="space-y-2">
        <Label className="text-xs font-medium">
          {t("obfuscation_select_label")}
        </Label>
        <Select
          value={config.obfuscation}
          onValueChange={(value) =>
            patchConfig({ obfuscation: value as ObfuscationMode })
          }
        >
          <SelectTrigger
            aria-label={t("obfuscation_select_label")}
            className="h-9 border-border/50 bg-background/50"
          >
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
      </div>
      <p className="text-xs text-muted-foreground">{t("obfuscation_note")}</p>
      <p className="text-xs text-muted-foreground">
        {t("obfuscation_compat_note")}
      </p>
    </>
  );

  if (embedded) {
    return (
      <section className="rounded-xl border border-border/50 bg-muted/5 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">
            {t("obfuscation_label")}
          </span>
        </div>
        <div className="space-y-3">{content}</div>
      </section>
    );
  }

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Wand2 className="h-4 w-4 text-primary" />
          </div>
          {t("obfuscation_label")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("obfuscation_intro")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">{content}</CardContent>
    </Card>
  );
}

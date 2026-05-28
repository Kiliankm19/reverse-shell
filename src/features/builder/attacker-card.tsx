"use client";

import { Crosshair, Shuffle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BuilderState } from "@/features/builder/use-builder";

type AttackerCardProps = Pick<
  BuilderState,
  "config" | "patchConfig" | "randomizeLport" | "fieldErrors" | "showLhost"
>;

export function AttackerCard({
  config,
  patchConfig,
  randomizeLport,
  fieldErrors,
  showLhost,
}: AttackerCardProps) {
  const t = useTranslations("builder");

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Crosshair className="h-4 w-4 text-primary" />
          {t("attacker_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("attacker_intro")}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex h-7 items-center">
              <Label>{t("ip_label")}</Label>
            </div>
            {showLhost ? (
              <>
                <Input
                  value={config.lhost}
                  onChange={(event) =>
                    patchConfig({ lhost: event.target.value })
                  }
                  placeholder={t("lhost_placeholder")}
                  aria-invalid={!!fieldErrors.lhost}
                />
                {fieldErrors.lhost && (
                  <p className="text-xs text-destructive">
                    {t("validation_field_lhost")}
                  </p>
                )}
              </>
            ) : (
              <div className="flex h-9 items-center rounded-md border bg-muted/40 px-3 text-sm text-muted-foreground">
                {t("attacker_ip_not_used")}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="builder-lport">{t("port_label")}</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs"
                onClick={randomizeLport}
              >
                <Shuffle className="h-3.5 w-3.5" />
                {t("random_port_button")}
              </Button>
            </div>
            <Input
              id="builder-lport"
              type="number"
              min={1}
              max={65535}
              value={config.lport}
              onChange={(event) =>
                patchConfig({ lport: Number(event.target.value) || 1 })
              }
              aria-invalid={!!fieldErrors.lport}
            />
            {fieldErrors.lport && (
              <p className="text-xs text-destructive">
                {t("validation_field_lport")}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("attacker_endpoint_label")}
          </p>
          <p className="mt-1 break-all font-mono text-sm">
            {showLhost ? `${config.lhost}:${config.lport}` : `:${config.lport}`}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">{t("random_port_hint")}</p>
      </CardContent>
    </Card>
  );
}

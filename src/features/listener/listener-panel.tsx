"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  listenerTemplates,
  normalizeHost,
  normalizePort,
} from "@/lib/reverse-shells";

export function ListenerPanel() {
  const t = useTranslations("listener");
  const [lhost, setLhost] = useState("10.10.14.3");
  const [lport, setLport] = useState(4444);
  const safeHost = normalizeHost(lhost, "0.0.0.0");
  const safePort = normalizePort(lport, 4444);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success(t("copied"));
  }

  return (
    <main className="flex-1 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Headphones className="h-4 w-4 text-primary" /> {t("settings_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("lhost_label")}</Label>
              <Input value={lhost} onChange={(event) => setLhost(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("lport_label")}</Label>
              <Input
                type="number"
                min={1}
                max={65535}
                value={lport}
                onChange={(event) => setLport(Number(event.target.value) || 1)}
              />
            </div>
          </CardContent>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              {t("lhost_hint")}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {listenerTemplates.map((template) => {
            const command = template.command(safePort, safeHost);
            return (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t(`templates.${template.id}.name`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`templates.${template.id}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={command}
                    readOnly
                    className="min-h-24 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => void copy(command)}
                  >
                    <Copy className="h-4 w-4" />
                    {t("copy_listener")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

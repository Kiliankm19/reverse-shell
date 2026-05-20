"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Copy, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { normalizeHost, normalizePort, normalizeShell, upgradeRecipes } from "@/lib/reverse-shells";

export function UpgradePanel() {
  const t = useTranslations("upgrade");
  const [shell, setShell] = useState("/bin/bash");
  const [attackerHost, setAttackerHost] = useState("10.10.14.3");
  const [port, setPort] = useState(4444);
  const safeShell = normalizeShell(shell, "/bin/bash");
  const safeAttackerHost = normalizeHost(attackerHost, "10.10.14.3");
  const safePort = normalizePort(port, 4444);

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
              <TerminalSquare className="h-4 w-4 text-primary" /> {t("context_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{t("shell_label")}</Label>
              <Input value={shell} onChange={(event) => setShell(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("attacker_host_label")}</Label>
              <Input
                value={attackerHost}
                onChange={(event) => setAttackerHost(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("port_label")}</Label>
              <Input
                type="number"
                min={1}
                max={65535}
                value={port}
                onChange={(event) => setPort(Number(event.target.value) || 1)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {upgradeRecipes.map((recipe) => {
            const steps = recipe.steps(safeShell, safeAttackerHost, safePort);
            const text = steps.join("\n");
            return (
              <Card key={recipe.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t(`recipes.${recipe.id}.name`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {recipe.platform} · {t(`recipes.${recipe.id}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={text}
                    readOnly
                    className="min-h-40 font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => void copy(text)}
                  >
                    <Copy className="h-4 w-4" />
                    {t("copy_steps")}
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

"use client";

import { useTranslations } from "next-intl";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/features/builder/utils";
import type { BuilderState } from "@/features/builder/use-builder";
import { hoaxShellServerFileName } from "@/lib/reverse-shells";

type HttpServerCardProps = Pick<
  BuilderState,
  "safeConfig" | "hoaxServerScript" | "hoaxServerCommand" | "copy"
>;

export function HttpServerCard({
  safeConfig,
  hoaxServerScript,
  hoaxServerCommand,
  copy,
}: HttpServerCardProps) {
  const t = useTranslations("builder");

  if (!safeConfig || !hoaxServerScript) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("http_server_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("http_server_hint")}</p>
        <p className="font-mono text-xs text-muted-foreground">
          {hoaxShellServerFileName()} · {t("http_server_command_title")}
        </p>
        <Textarea
          value={hoaxServerScript}
          readOnly
          className="min-h-48 font-mono text-xs"
        />
        <Textarea
          value={hoaxServerCommand}
          readOnly
          className="min-h-16 font-mono text-xs"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => void copy(hoaxServerScript)}
          >
            <Copy className="h-4 w-4" />
            {hoaxShellServerFileName()}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() =>
              downloadText(hoaxShellServerFileName(), hoaxServerScript)
            }
          >
            <Download className="h-4 w-4" />
            {t("download_server_button")}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => void copy(hoaxServerCommand)}
          >
            <Copy className="h-4 w-4" />
            {t("http_server_command_title")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

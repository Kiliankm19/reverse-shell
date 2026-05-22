"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Copy, Headphones, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getRecommendedListenerCommand } from "@/lib/reverse-shells/listener-command";
import type { ReverseShellConfig } from "@/lib/reverse-shells";

interface RecommendedListenerCardProps {
  config: ReverseShellConfig;
  connectionMode: string;
  onCopy: (value: string) => void;
}

export function RecommendedListenerCard({
  config,
  connectionMode,
  onCopy,
}: RecommendedListenerCardProps) {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");
  const { listenerId, command } = getRecommendedListenerCommand(
    config.templateId,
    config.lhost,
    config.lport,
  );

  const listenerLabel =
    listenerId === "hoax-http"
      ? t("card_http_command_server")
      : tListener(`templates.${listenerId}.name`);

  const showUpgrade =
    connectionMode === "reverse" || connectionMode === "staged";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-4 w-4 text-primary" />
          {t("recommended_listener_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {t("recommended_listener_hint")}
        </p>
        <p className="text-sm font-medium">{listenerLabel}</p>
        {command ? (
          <>
            <Textarea
              value={command}
              readOnly
              className="min-h-24 font-mono text-xs"
            />
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => onCopy(command)}
            >
              <Copy className="h-4 w-4" />
              {t("copy_listener_button")}
            </Button>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {t("recommended_listener_http_note")}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/listener">{t("open_listener_page")}</Link>
          </Button>
          {showUpgrade && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href="/upgrade">
                <TerminalSquare className="h-3.5 w-3.5" />
                {t("open_upgrade_page")}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

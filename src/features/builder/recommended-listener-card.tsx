"use client";

import { useTranslations } from "next-intl";
import { Copy, Headphones, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildListenerCommand,
  getRecommendedListenerCommand,
} from "@/lib/reverse-shells/listener-command";
import { listenerTemplates } from "@/lib/reverse-shells";
import type { ReverseShellConfig } from "@/lib/reverse-shells";

interface RecommendedListenerCardProps {
  config: ReverseShellConfig;
  selectedListenerId: string | null;
  onListenerChange: (listenerId: string) => void;
  onCopy: (value: string) => void;
  embedded?: boolean;
}

export function RecommendedListenerCard({
  config,
  selectedListenerId,
  onListenerChange,
  onCopy,
  embedded = false,
}: RecommendedListenerCardProps) {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");
  const recommendation = getRecommendedListenerCommand(
    config.templateId,
    config.lhost,
    config.lport,
  );
  const listenerOptions = new Set<string>(
    listenerTemplates.map((listener) => listener.id),
  );
  if (recommendation.listenerId === "hoax-http") {
    listenerOptions.add("hoax-http");
  }
  const listenerId =
    selectedListenerId && listenerOptions.has(selectedListenerId)
      ? selectedListenerId
      : recommendation.listenerId;

  const command = buildListenerCommand(listenerId, config.lhost, config.lport);
  const content = (
    <div className="space-y-4">
      <Select value={listenerId} onValueChange={onListenerChange}>
        <SelectTrigger
          className="w-full h-9 border-border/50 bg-background/50"
          aria-label={t("listener_type_label")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {listenerTemplates.map((listener) => (
            <SelectItem key={listener.id} value={listener.id}>
              {tListener(`templates.${listener.id}.name`)}
            </SelectItem>
          ))}
          {recommendation.listenerId === "hoax-http" && (
            <SelectItem value="hoax-http">
              {t("card_http_command_server")}
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      {command ? (
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">
            {t("listener_command_label")}
          </p>
          <Textarea
            value={command}
            readOnly
            className="terminal-block min-h-24 font-mono text-xs border-0 text-primary/90 resize-none"
          />
          <Button className="gap-2 h-8 text-xs" onClick={() => onCopy(command)}>
            <Copy className="h-3.5 w-3.5" />
            {t("copy_listener_button")}
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("recommended_listener_http_note")}
        </p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <section className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-4">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            {t("recommended_listener_title")}
          </h3>
        </div>
        {content}
      </section>
    );
  }

  return (
    <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
            <Headphones className="h-4 w-4 text-primary" />
          </div>
          {t("recommended_listener_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("recommended_listener_hint")}
        </p>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="rounded-xl border border-border/50 bg-muted/5 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-semibold">
              {t("listener_setup_title")}
            </h4>
          </div>
          {content}
        </div>
      </CardContent>
    </Card>
  );
}

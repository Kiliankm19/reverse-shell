"use client";

import { useTranslations } from "next-intl";
import { Copy, Headphones, Server } from "lucide-react";
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
    <div className="space-y-3">
      <Select value={listenerId} onValueChange={onListenerChange}>
        <SelectTrigger className="w-full">
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
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            {t("listener_command_label")}
          </p>
          <Textarea
            value={command}
            readOnly
            className="min-h-24 font-mono text-xs"
          />
          <Button className="w-fit gap-2" onClick={() => onCopy(command)}>
            <Copy className="h-4 w-4" />
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
      <section className="space-y-3 rounded-md border bg-muted/20 p-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Headphones className="h-4 w-4 text-primary" />
            {t("recommended_listener_title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("recommended_listener_hint")}
          </p>
        </div>
        {content}
      </section>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-4 w-4 text-primary" />
          {t("recommended_listener_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("recommended_listener_hint")}
        </p>
      </CardHeader>
      <CardContent>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" />
              {t("listener_setup_title")}
            </CardTitle>
          </CardHeader>
          <CardContent>{content}</CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

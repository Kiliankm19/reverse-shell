"use client";

import { useTranslations } from "next-intl";
import { Code2, Copy, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { BuilderState } from "@/features/builder/use-builder";

type CommandSidebarProps = Pick<
  BuilderState,
  "copy" | "generated" | "safeConfig"
> & {
  embedded?: boolean;
};

export function CommandSidebar({
  copy,
  generated,
  safeConfig,
  embedded = false,
}: CommandSidebarProps) {
  const t = useTranslations("builder");
  const generatedCommandHeader = (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Terminal className="h-4 w-4 text-primary" />
        {t("generated_command_title")}
      </h3>
      <p className="text-xs text-muted-foreground">
        {t("generated_command_intro")}
      </p>
    </div>
  );
  const generatedCommandBody = (
    <>
      <Textarea
        value={generated?.command ?? t("invalid_input")}
        readOnly
        className="min-h-48 font-mono text-xs"
      />
      <Button
        className="w-fit gap-2"
        onClick={() => generated && void copy(generated.command)}
        disabled={!generated}
      >
        <Copy className="h-4 w-4" />
        {t("copy_command_button")}
      </Button>
    </>
  );
  const rawCommandHeader = (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <Code2 className="h-4 w-4 text-primary" />
        {t("raw_command_title")}
      </h3>
      <p className="text-xs text-muted-foreground">{t("raw_command_intro")}</p>
    </div>
  );
  const rawCommandBody = (
    <>
      <Textarea
        value={generated?.rawCommand ?? ""}
        readOnly
        className="min-h-32 font-mono text-xs"
      />
      <ul className="space-y-1 text-xs text-muted-foreground">
        {generated && (
          <>
            <li>- {t(`templates.${generated.template.id}.description`)}</li>
            <li>
              - {t(`obfuscation_notes.${safeConfig?.obfuscation ?? "none"}`)}
            </li>
          </>
        )}
      </ul>
    </>
  );

  if (embedded) {
    return (
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="space-y-3 rounded-md border bg-muted/20 p-3">
          {generatedCommandHeader}
          {generatedCommandBody}
        </section>
        <section className="space-y-3 rounded-md border bg-muted/20 p-3">
          {rawCommandHeader}
          {rawCommandBody}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Terminal className="h-4 w-4 text-primary" />
            {t("generated_command_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("generated_command_intro")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">{generatedCommandBody}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Code2 className="h-4 w-4 text-primary" />
            {t("raw_command_title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("raw_command_intro")}
          </p>
        </CardHeader>
        <CardContent className="space-y-3">{rawCommandBody}</CardContent>
      </Card>
    </div>
  );
}

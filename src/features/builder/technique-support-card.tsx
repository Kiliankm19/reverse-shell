"use client";

import { useTranslations } from "next-intl";
import { Copy, Download, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/features/builder/utils";
import {
  createHoaxShellServerScript,
  createStageScript,
  hoaxShellServerCommand,
  hoaxShellServerFileName,
  stageFileName,
  stageServeCommand,
  stageTemplateOptions,
  type PayloadConnectionMode,
  type ReverseShellConfig,
} from "@/lib/reverse-shells";

interface TechniqueSupportCardProps {
  safeConfig: ReverseShellConfig | null;
  connectionMode: PayloadConnectionMode;
  stageTemplateId: string;
  onStageTemplateChange: (templateId: string) => void;
  onCopy: (value: string) => void;
}

export function TechniqueSupportCard({
  safeConfig,
  connectionMode,
  stageTemplateId,
  onStageTemplateChange,
  onCopy,
}: TechniqueSupportCardProps) {
  const t = useTranslations("builder");

  if (!safeConfig) return null;

  if (connectionMode === "staged") {
    const stageScript = createStageScript(safeConfig, stageTemplateId);
    const serveCommand = stageServeCommand(safeConfig);
    const stageTemplates = stageTemplateOptions();

    return (
      <section className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t("stage_file_title")}</h3>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium">
            {t("stage_template_label")}
          </label>
          <Select value={stageTemplateId} onValueChange={onStageTemplateChange}>
            <SelectTrigger className="h-9 border-border/50 bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {t(`templates.${template.id}.name`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Textarea
          value={stageScript}
          readOnly
          className="terminal-block min-h-32 font-mono text-xs border-0 text-primary/90 resize-none"
        />
        <Textarea
          value={serveCommand}
          readOnly
          className="terminal-block min-h-16 font-mono text-xs border-0 text-primary/90 resize-none"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-2 h-8 text-xs"
            onClick={() => onCopy(stageScript)}
          >
            <Copy className="h-3.5 w-3.5" />
            {stageFileName(safeConfig)}
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-8 text-xs border-border/50"
            onClick={() => downloadText(stageFileName(safeConfig), stageScript)}
          >
            <Download className="h-3.5 w-3.5" />
            {t("download_stage_button")}
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-8 text-xs border-border/50"
            onClick={() => onCopy(serveCommand)}
          >
            <Copy className="h-3.5 w-3.5" />
            {t("stage_serve_title")}
          </Button>
        </div>
      </section>
    );
  }

  if (connectionMode === "http-callback") {
    const serverScript = createHoaxShellServerScript(safeConfig);
    const serverCommand = hoaxShellServerCommand(safeConfig);

    return (
      <section className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-4">
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">{t("http_server_title")}</h3>
        </div>

        <p className="rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-[10px] font-mono text-muted-foreground w-fit">
          {hoaxShellServerFileName()} · {t("http_server_command_title")}
        </p>

        <Textarea
          value={serverScript}
          readOnly
          className="terminal-block min-h-48 font-mono text-xs border-0 text-primary/90 resize-none"
        />
        <Textarea
          value={serverCommand}
          readOnly
          className="terminal-block min-h-16 font-mono text-xs border-0 text-primary/90 resize-none"
        />

        <div className="flex flex-wrap gap-2">
          <Button
            className="gap-2 h-8 text-xs"
            onClick={() => onCopy(serverScript)}
          >
            <Copy className="h-3.5 w-3.5" />
            {hoaxShellServerFileName()}
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-8 text-xs border-border/50"
            onClick={() =>
              downloadText(hoaxShellServerFileName(), serverScript)
            }
          >
            <Download className="h-3.5 w-3.5" />
            {t("download_server_button")}
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-8 text-xs border-border/50"
            onClick={() => onCopy(serverCommand)}
          >
            <Copy className="h-3.5 w-3.5" />
            {t("http_server_command_title")}
          </Button>
        </div>
      </section>
    );
  }

  return null;
}

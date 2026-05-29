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
      <section className="space-y-3 rounded-md border bg-muted/20 p-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Server className="h-4 w-4 text-primary" />
            {t("stage_file_title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("stage_file_hint")}
          </p>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {t("stage_template_label")}
          </label>
          <Select value={stageTemplateId} onValueChange={onStageTemplateChange}>
            <SelectTrigger>
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
          className="min-h-32 font-mono text-xs"
        />
        <Textarea
          value={serveCommand}
          readOnly
          className="min-h-16 font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button className="w-fit gap-2" onClick={() => onCopy(stageScript)}>
            <Copy className="h-4 w-4" />
            {stageFileName(safeConfig)}
          </Button>
          <Button
            variant="outline"
            className="w-fit gap-2"
            onClick={() => downloadText(stageFileName(safeConfig), stageScript)}
          >
            <Download className="h-4 w-4" />
            {t("download_stage_button")}
          </Button>
          <Button
            variant="outline"
            className="w-fit gap-2"
            onClick={() => onCopy(serveCommand)}
          >
            <Copy className="h-4 w-4" />
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
      <section className="space-y-3 rounded-md border bg-muted/20 p-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Server className="h-4 w-4 text-primary" />
            {t("http_server_title")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("http_server_hint")}
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {hoaxShellServerFileName()} · {t("http_server_command_title")}
        </p>
        <Textarea
          value={serverScript}
          readOnly
          className="min-h-48 font-mono text-xs"
        />
        <Textarea
          value={serverCommand}
          readOnly
          className="min-h-16 font-mono text-xs"
        />
        <div className="flex flex-wrap gap-2">
          <Button className="w-fit gap-2" onClick={() => onCopy(serverScript)}>
            <Copy className="h-4 w-4" />
            {hoaxShellServerFileName()}
          </Button>
          <Button
            variant="outline"
            className="w-fit gap-2"
            onClick={() =>
              downloadText(hoaxShellServerFileName(), serverScript)
            }
          >
            <Download className="h-4 w-4" />
            {t("download_server_button")}
          </Button>
          <Button
            variant="outline"
            className="w-fit gap-2"
            onClick={() => onCopy(serverCommand)}
          >
            <Copy className="h-4 w-4" />
            {t("http_server_command_title")}
          </Button>
        </div>
      </section>
    );
  }

  return null;
}

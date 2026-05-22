"use client";

import { useTranslations } from "next-intl";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { downloadText } from "@/features/builder/utils";
import type { BuilderState } from "@/features/builder/use-builder";
import { stageFileName } from "@/lib/reverse-shells";

type StageFileCardProps = Pick<
  BuilderState,
  | "safeConfig"
  | "stageScript"
  | "stageTemplates"
  | "stageServe"
  | "stageTemplateId"
  | "setStageTemplateId"
  | "copy"
>;

export function StageFileCard({
  safeConfig,
  stageScript,
  stageTemplates,
  stageServe,
  stageTemplateId,
  setStageTemplateId,
  copy,
}: StageFileCardProps) {
  const t = useTranslations("builder");

  if (!stageScript || !safeConfig) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("stage_file_title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{t("stage_file_hint")}</p>
        <div className="space-y-2">
          <Label>{t("stage_template_label")}</Label>
          <Select value={stageTemplateId} onValueChange={setStageTemplateId}>
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
        <p className="font-mono text-xs text-muted-foreground">
          {stageFileName(safeConfig)} · {t("stage_serve_title")}
        </p>
        <Textarea
          value={stageScript}
          readOnly
          className="min-h-32 font-mono text-xs"
        />
        <Textarea
          value={stageServe}
          readOnly
          className="min-h-16 font-mono text-xs"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => void copy(stageScript)}
          >
            <Copy className="h-4 w-4" />
            {stageFileName(safeConfig)}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => downloadText(stageFileName(safeConfig), stageScript)}
          >
            <Download className="h-4 w-4" />
            {t("download_stage_button")}
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => void copy(stageServe)}
          >
            <Copy className="h-4 w-4" />
            {t("stage_serve_title")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

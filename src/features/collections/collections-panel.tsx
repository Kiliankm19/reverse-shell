"use client";

import { useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCollections } from "./use-collections";
import { builtinCollections, type BuiltinCollection } from "./builtin-collections";
import type { SavedCollection } from "./types";
import { saveActiveConfig } from "@/features/builder/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Bookmark, Download, FolderOpen, Trash2, Upload } from "lucide-react";
import { MAX_COLLECTION_IMPORT_BYTES } from "@/lib/security";
import {
  getConnectionModeById,
  type ObfuscationMode,
} from "@/lib/reverse-shells";

function formatDate(ts: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(ts));
}

function obfuscationLabelKey(mode: ObfuscationMode): string {
  return `obfuscation.${mode}`;
}

function DeleteButton({
  onDelete,
  label,
  confirmLabel,
}: {
  onDelete: () => void;
  label: string;
  confirmLabel: string;
}) {
  const [confirm, setConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleClick() {
    if (confirm) {
      onDelete();
      return;
    }
    setConfirm(true);
    timerRef.current = setTimeout(() => setConfirm(false), 3000);
  }

  return (
    <Button
      variant={confirm ? "destructive" : "outline"}
      size="sm"
      onClick={handleClick}
      className="gap-1.5"
    >
      <Trash2 className="h-3.5 w-3.5" />
      {confirm ? confirmLabel : label}
    </Button>
  );
}

export function CollectionsPanel() {
  const t = useTranslations("collections");
  const { collections, loading, save, remove, exportJson, importJson } =
    useCollections();
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "en";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleLoad = useCallback(
    (col: Pick<SavedCollection, "config">) => {
      saveActiveConfig(col.config);
      router.push(`/${locale}/builder`);
    },
    [locale, router],
  );

  const handleSaveBuiltin = useCallback(
    (collection: BuiltinCollection) => {
      void save({
        id: crypto.randomUUID(),
        name: t(`presets.${collection.id}.name`),
        createdAt: Date.now(),
        config: collection.config,
        renderedCommand: collection.renderedCommand,
      }).then(() => toast.success(t("preset_saved")));
    },
    [save, t],
  );

  const handleExport = useCallback(() => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "reverseshell-collections.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [exportJson]);

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      setImportError(null);
      if (file.size > MAX_COLLECTION_IMPORT_BYTES) {
        setImportError(t("import_error_size"));
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        importJson(text)
          .then((imported) => toast.success(t("import_success", { count: imported.length })))
          .catch(() => {
            setImportError(t("import_failed"));
          });
      };
      reader.readAsText(file);
      event.target.value = "";
    },
    [importJson, t],
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t("presets_title")}</h2>
            <Badge variant="secondary">{builtinCollections.length}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t("presets_hint")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {builtinCollections.map((collection) => (
            <Card key={collection.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">
                  {t(`presets.${collection.id}.name`)}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t(`presets.${collection.id}.description`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {collection.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="w-fit font-mono text-xs"
                    >
                      {t(`tags.${tag}`)}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <Textarea
                  value={collection.renderedCommand}
                  readOnly
                  className="min-h-28 font-mono text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleLoad(collection)}
                    className="flex-1 gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    {t("load_button")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveBuiltin(collection)}
                    className="gap-1.5"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {t("save_copy")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("saved_title")}</h2>
          <Badge variant="secondary">{collections.length}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={collections.length === 0}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            {t("export_button")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            {t("import_button")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </div>

      {importError && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {importError}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {collections.map((col) => (
            <Card key={col.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">{col.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="w-fit font-mono text-xs">
                    {col.config.templateId}
                  </Badge>
                  <Badge variant="secondary" className="w-fit font-mono text-xs">
                    {getConnectionModeById(col.config.templateId) === "bind"
                      ? t("bind_badge", { port: col.config.lport })
                      : `${col.config.lhost}:${col.config.lport}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <Textarea
                  value={col.renderedCommand}
                  readOnly
                  className="min-h-28 font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {t(obfuscationLabelKey(col.config.obfuscation))} ·{" "}
                  {formatDate(col.createdAt, locale)}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleLoad(col)}
                    className="flex-1 gap-1.5"
                  >
                    <FolderOpen className="h-3.5 w-3.5" />
                    {t("load_button")}
                  </Button>
                  <DeleteButton
                    label={t("delete_button")}
                    confirmLabel={t("confirm_delete")}
                    onDelete={() => void remove(col.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

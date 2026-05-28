"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCollections } from "./use-collections";
import {
  builtinCollections,
  type BuiltinCollection,
} from "./builtin-collections";
import type { SavedCollection } from "./types";
import { saveActiveConfig } from "@/features/builder/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Bookmark,
  Download,
  FolderOpen,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_COLLECTION_IMPORT_BYTES } from "@/lib/security";
import {
  getConnectionModeById,
  getTemplate,
  type ObfuscationMode,
} from "@/lib/reverse-shells";

const COLLECTION_FILTERS = [
  "all",
  "linux",
  "windows",
  "macos",
  "reverse",
  "bind",
  "msfvenom",
  "hoaxshell",
  "assembled",
  "encoded",
] as const;

type CollectionFilter = (typeof COLLECTION_FILTERS)[number];

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

function matchesPlatformFilter(templateId: string, filter: CollectionFilter) {
  const template = getTemplate(templateId);
  return (
    template.platform === filter ||
    (filter === "linux" && template.platform === "multi") ||
    (filter === "windows" && template.platform === "multi") ||
    (filter === "macos" && template.platform === "multi")
  );
}

function matchesCollectionFilter(
  collection: BuiltinCollection | SavedCollection,
  filter: CollectionFilter,
) {
  if (filter === "all") return true;

  const templateId = collection.config.templateId;
  const mode = getConnectionModeById(templateId);
  const template = getTemplate(templateId);

  if (filter === "linux" || filter === "windows" || filter === "macos") {
    return (
      matchesPlatformFilter(templateId, filter) ||
      ("tags" in collection && collection.tags.includes(filter))
    );
  }

  if (filter === "reverse") {
    return (
      mode === "reverse" &&
      !templateId.startsWith("msfvenom-") &&
      !templateId.includes("hoaxshell")
    );
  }
  if (filter === "bind") return mode === "bind";
  if (filter === "msfvenom") return templateId.startsWith("msfvenom-");
  if (filter === "hoaxshell") return templateId.includes("hoaxshell");
  if (filter === "assembled") return template.family === "staged";
  if (filter === "encoded") return collection.config.obfuscation !== "none";

  return false;
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
  const {
    collections,
    loading,
    save,
    rename,
    remove,
    clear,
    exportJson,
    importJson,
    previewJson,
  } = useCollections();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<{
    text: string;
    count: number;
  } | null>(null);
  const [collectionQuery, setCollectionQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>("all");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filteredPresets = useMemo(() => {
    const needle = collectionQuery.trim().toLowerCase();
    return builtinCollections.filter((collection) => {
      const haystack = [
        collection.id,
        collection.config.templateId,
        getTemplate(collection.config.templateId).platform,
        getTemplate(collection.config.templateId).family,
        getConnectionModeById(collection.config.templateId),
        collection.config.obfuscation,
        collection.renderedCommand,
        t(`presets.${collection.id}.name`),
        t(`presets.${collection.id}.description`),
        ...collection.tags.map((tag) => t(`tags.${tag}`)),
      ]
        .join(" ")
        .toLowerCase();
      return (
        (!needle || haystack.includes(needle)) &&
        matchesCollectionFilter(collection, activeFilter)
      );
    });
  }, [activeFilter, collectionQuery, t]);

  const filteredCollections = useMemo(() => {
    const needle = collectionQuery.trim().toLowerCase();
    return collections.filter((collection) => {
      const template = getTemplate(collection.config.templateId);
      const haystack = [
        collection.id,
        collection.name,
        collection.config.templateId,
        template.name,
        template.family,
        template.platform,
        getConnectionModeById(collection.config.templateId),
        collection.config.obfuscation,
        collection.renderedCommand,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!needle || haystack.includes(needle)) &&
        matchesCollectionFilter(collection, activeFilter)
      );
    });
  }, [activeFilter, collectionQuery, collections]);

  const handleLoad = useCallback(
    (col: Pick<SavedCollection, "config">) => {
      saveActiveConfig(col.config);
      router.push("/");
    },
    [router],
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
        try {
          const preview = previewJson(text);
          setPendingImport({ text, count: preview.length });
        } catch {
          setImportError(t("import_failed"));
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    },
    [previewJson, t],
  );

  const handleConfirmImport = useCallback(() => {
    if (!pendingImport) return;
    importJson(pendingImport.text)
      .then((result) => {
        if (result.skippedDuplicates > 0) {
          toast.success(
            t("import_success_duplicates", {
              count: result.imported,
              duplicates: result.skippedDuplicates,
            }),
          );
        } else {
          toast.success(t("import_success", { count: result.imported }));
        }
        setPendingImport(null);
      })
      .catch(() => {
        setImportError(t("import_failed"));
        setPendingImport(null);
      });
  }, [importJson, pendingImport, t]);

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{t("presets_title")}</h2>
            <Badge variant="secondary">
              {filteredPresets.length}/{builtinCollections.length}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{t("presets_hint")}</p>
        </div>
        <div className="space-y-3 rounded-lg border bg-card p-4">
          <Label>{t("collection_search_label")}</Label>
          <Input
            value={collectionQuery}
            onChange={(event) => setCollectionQuery(event.target.value)}
            placeholder={t("collection_search_placeholder")}
          />
          <div className="flex flex-wrap gap-2">
            {COLLECTION_FILTERS.map((filter) => (
              <Button
                key={filter}
                type="button"
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter)}
              >
                {t(`collection_filters.${filter}`)}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredPresets.map((collection) => (
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
          {filteredPresets.length === 0 && (
            <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
              {t("no_builtin_matches")}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{t("saved_title")}</h2>
          <Badge variant="secondary">
            {filteredCollections.length}/{collections.length}
          </Badge>
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
          <DeleteButton
            label={t("clear_button")}
            confirmLabel={t("confirm_clear")}
            onDelete={() => void clear()}
          />
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

      {pendingImport && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border bg-card px-4 py-3 text-sm">
          <p className="text-muted-foreground">
            {t("import_preview", { count: pendingImport.count })}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPendingImport(null)}
            >
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleConfirmImport}>
              {t("confirm_import")}
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {t("empty")}
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {t("no_saved_matches")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCollections.map((col) => (
            <Card key={col.id} className="flex flex-col">
              <CardHeader className="pb-2">
                {renamingId === col.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      data-testid="collection-rename-input"
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      className="h-8 max-w-xs text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        void rename(col.id, renameValue).then(() => {
                          toast.success(t("renamed"));
                          setRenamingId(null);
                        });
                      }}
                    >
                      {t("rename_save")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRenamingId(null)}
                    >
                      {t("rename_cancel")}
                    </Button>
                  </div>
                ) : (
                  <CardTitle className="text-sm font-bold">
                    {col.name}
                  </CardTitle>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="w-fit font-mono text-xs">
                    {col.config.templateId}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="w-fit font-mono text-xs"
                  >
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
                  {formatDate(col.createdAt, "en")}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRenamingId(col.id);
                      setRenameValue(col.name);
                    }}
                    className="gap-1.5"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {t("rename_button")}
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

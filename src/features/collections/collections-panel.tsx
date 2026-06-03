"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCollections } from "./use-collections";
import {
  builtinCollections,
  type BuiltinCollection,
} from "./builtin-collections";
import type { SavedCollection } from "./types";
import {
  readPersistedConfig,
  saveActiveConfig,
} from "@/features/builder/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandOutput } from "@/components/ui/command-output";
import { PresetMetadataBadges } from "@/components/collections/preset-metadata-badges";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Download,
  FolderOpen,
  Pencil,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_COLLECTION_IMPORT_BYTES } from "@/lib/security";
import {
  generateReverseShell,
  getConnectionModeById,
  getTemplate,
  normalizeHost,
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
  "encoded",
] as const;

type CollectionFilter = (typeof COLLECTION_FILTERS)[number];

const PRESETS_PAGE_SIZE = 8;
const PRESET_LHOST_KEY = "reverseshell:collections-preset-lhost";
const FALLBACK_PRESET_LHOST = "YOUR-IP";
const FAVORITE_PRESETS_KEY = "reverseshell:favorite-presets";

function readFavoritePresets(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(
      localStorage.getItem(FAVORITE_PRESETS_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function readInitialPresetLhost(): string {
  if (typeof window === "undefined") return "";

  const saved = localStorage.getItem(PRESET_LHOST_KEY);
  if (saved !== null) return saved;

  const persistedConfig = readPersistedConfig();
  return persistedConfig?.lhost === "0.0.0.0"
    ? ""
    : (persistedConfig?.lhost ?? "");
}

function resolvePresetLhost(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return FALLBACK_PRESET_LHOST;
  return normalizeHost(trimmed, FALLBACK_PRESET_LHOST);
}

function withPresetLhost(
  collection: BuiltinCollection,
  lhost: string,
): BuiltinCollection {
  if (getConnectionModeById(collection.config.templateId) === "bind") {
    return collection;
  }

  const config = { ...collection.config, lhost };
  return {
    ...collection,
    config,
    renderedCommand: generateReverseShell(config).command,
  };
}

function isCollectionFilter(value: string | null): value is CollectionFilter {
  return (
    value !== null && (COLLECTION_FILTERS as readonly string[]).includes(value)
  );
}

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
  const searchParams = useSearchParams();
  const initialFilterParam = searchParams.get("filter");
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
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>(() =>
    isCollectionFilter(initialFilterParam) ? initialFilterParam : "all",
  );
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [presetLhost, setPresetLhost] = useState(readInitialPresetLhost);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [favoritePresetIds, setFavoritePresetIds] = useState<string[]>(() =>
    readFavoritePresets(),
  );
  const resolvedPresetLhost = resolvePresetLhost(presetLhost);

  const materializePreset = useCallback(
    (collection: BuiltinCollection) =>
      withPresetLhost(collection, resolvedPresetLhost),
    [resolvedPresetLhost],
  );

  const filteredPresets = useMemo(() => {
    return builtinCollections.filter((collection) =>
      matchesCollectionFilter(collection, activeFilter),
    );
  }, [activeFilter]);

  const filteredCollections = useMemo(() => {
    return collections.filter((collection) =>
      matchesCollectionFilter(collection, activeFilter),
    );
  }, [activeFilter, collections]);

  const visiblePresets = useMemo(() => {
    if (showAllPresets) return filteredPresets;
    return filteredPresets.slice(0, PRESETS_PAGE_SIZE);
  }, [filteredPresets, showAllPresets]);

  const selectedPreset = useMemo(() => {
    if (!filteredPresets.length) return null;
    const match = filteredPresets.find((p) => p.id === selectedPresetId);
    return materializePreset(match ?? filteredPresets[0]);
  }, [filteredPresets, materializePreset, selectedPresetId]);

  const favoritePresets = useMemo(
    () =>
      favoritePresetIds
        .map((id) =>
          builtinCollections.find((collection) => collection.id === id),
        )
        .filter((collection): collection is BuiltinCollection => !!collection),
    [favoritePresetIds],
  );

  const handlePresetLhostChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setPresetLhost(value);
      localStorage.setItem(PRESET_LHOST_KEY, value);
    },
    [],
  );

  const handleLoad = useCallback(
    (
      col: Pick<SavedCollection, "config"> & {
        id?: string;
        name?: string;
      },
      options?: { presetId?: string; label?: string },
    ) => {
      saveActiveConfig(col.config);
      const label =
        options?.label ??
        col.name ??
        (options?.presetId ? t(`presets.${options.presetId}.name`) : "Builder");
      toast.success(t("load_success", { name: label }));
      router.push("/builder");
    },
    [router, t],
  );

  const handleSaveBuiltin = useCallback(
    (collection: BuiltinCollection) => {
      const readyCollection = materializePreset(collection);
      void save({
        id: crypto.randomUUID(),
        name: t(`presets.${readyCollection.id}.name`),
        createdAt: Date.now(),
        config: readyCollection.config,
        renderedCommand: readyCollection.renderedCommand,
      }).then(() => toast.success(t("preset_saved")));
    },
    [materializePreset, save, t],
  );

  const toggleFavoritePreset = useCallback((presetId: string) => {
    setFavoritePresetIds((current) => {
      const next = current.includes(presetId)
        ? current.filter((id) => id !== presetId)
        : [presetId, ...current].slice(0, 8);
      localStorage.setItem(FAVORITE_PRESETS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

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
      {favoritePresets.length > 0 && (
        <section className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 focus-within:border-primary/40">
          <div className="mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("favorites_title")}</h2>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {favoritePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handleLoad(materializePreset(preset), {
                    presetId: preset.id,
                    label: t(`presets.${preset.id}.name`),
                  })
                }
                className="rounded-md border bg-background p-3 text-left text-sm transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <span className="block font-medium">
                  {t(`presets.${preset.id}.name`)}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {t("favorite_load_hint")}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

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
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm transition-colors hover:border-primary/40 focus-within:border-primary/40">
          <div className="rounded-md border bg-muted/20 p-3">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] md:items-end">
              <div>
                <Label>{t("preset_lhost_label")}</Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("preset_lhost_hint")}
                </p>
              </div>
              <Input
                value={presetLhost}
                onChange={handlePresetLhostChange}
                placeholder={FALLBACK_PRESET_LHOST}
                aria-label={t("preset_lhost_label")}
              />
            </div>
            {!presetLhost.trim() && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t("preset_lhost_empty", {
                  placeholder: FALLBACK_PRESET_LHOST,
                })}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 focus-within:border-primary/40">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            {COLLECTION_FILTERS.map((filter) => (
              <Button
                key={filter}
                type="button"
                variant={activeFilter === filter ? "default" : "outline"}
                size="sm"
                className="shrink-0"
                onClick={() => setActiveFilter(filter)}
              >
                {t(`collection_filters.${filter}`)}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
          <section className="space-y-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 focus-within:border-primary/40">
            <p className="text-xs text-muted-foreground">
              {t("presets_visible", {
                shown: visiblePresets.length,
                total: filteredPresets.length,
              })}
            </p>
            <ul className="max-h-[32rem] space-y-1 overflow-y-auto">
              {visiblePresets.map((collection) => {
                const isSelected = selectedPreset?.id === collection.id;
                return (
                  <li key={collection.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedPresetId(collection.id)}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 font-medium text-foreground"
                          : "hover:bg-muted/60 text-muted-foreground",
                      )}
                    >
                      {t(`presets.${collection.id}.name`)}
                    </button>
                  </li>
                );
              })}
              {filteredPresets.length === 0 && (
                <li className="p-4 text-sm text-muted-foreground">
                  {t("no_builtin_matches")}
                </li>
              )}
            </ul>
            {filteredPresets.length > PRESETS_PAGE_SIZE && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllPresets((value) => !value)}
              >
                {showAllPresets
                  ? t("show_fewer_presets")
                  : t("show_all_presets")}
              </Button>
            )}
          </section>

          <Card className="flex flex-col transition-colors hover:border-primary/40 focus-within:border-primary/40">
            {selectedPreset ? (
              <>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold">
                    {t(`presets.${selectedPreset.id}.name`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`presets.${selectedPreset.id}.description`)}
                  </p>
                  <PresetMetadataBadges config={selectedPreset.config} />
                  <div className="flex flex-wrap gap-2">
                    {selectedPreset.tags.map((tag) => (
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
                  <CommandOutput
                    value={selectedPreset.renderedCommand}
                    minHeight="min-h-40"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        handleLoad(selectedPreset, {
                          presetId: selectedPreset.id,
                          label: t(`presets.${selectedPreset.id}.name`),
                        })
                      }
                      className="gap-1.5"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      {t("load_button")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSaveBuiltin(selectedPreset)}
                      className="gap-1.5"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      {t("save_copy")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toggleFavoritePreset(selectedPreset.id)}
                      className="gap-1.5"
                    >
                      <Star className="h-3.5 w-3.5" />
                      {favoritePresetIds.includes(selectedPreset.id)
                        ? t("favorite_remove")
                        : t("favorite_add")}
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {t("select_preset_hint")}
              </CardContent>
            )}
          </Card>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((key) => (
            <div
              key={key}
              className="animate-pulse rounded-lg border bg-card p-6"
              aria-hidden
            >
              <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
              <div className="mb-4 h-24 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">{t("empty")}</p>
          <Button asChild className="mt-4" size="sm">
            <Link href="/builder">{t("empty_cta")}</Link>
          </Button>
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          {t("no_saved_matches")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredCollections.map((col) => (
            <Card
              key={col.id}
              className="flex flex-col transition-colors hover:border-primary/40 focus-within:border-primary/40"
            >
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
                <PresetMetadataBadges config={col.config} />
                <p className="font-mono text-xs text-muted-foreground">
                  {getConnectionModeById(col.config.templateId) === "bind"
                    ? t("bind_badge", { port: col.config.lport })
                    : `${col.config.lhost}:${col.config.lport}`}
                </p>
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
                    onClick={() => handleLoad(col, { label: col.name })}
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

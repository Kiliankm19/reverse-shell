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
import { saveActiveConfig } from "@/features/builder/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommandOutput } from "@/components/ui/command-output";
import { PresetMetadataBadges } from "@/components/collections/preset-metadata-badges";
import {
  pushRecentWorkflow,
  readRecentWorkflows,
  type RecentWorkflow,
} from "@/lib/recent-workflows";
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
  "encrypted",
] as const;

type CollectionFilter = (typeof COLLECTION_FILTERS)[number];

const PRESETS_PAGE_SIZE = 8;
const RECOMMENDED_PRESET_IDS = [
  "linux-bash-dev-tcp",
  "web-rce-python3",
  "windows-powershell-encoded",
  "linux-openssl-fifo",
] as const;
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

function isEncryptedTemplate(templateId: string) {
  const template = getTemplate(templateId);
  return (
    template.family === "openssl" ||
    templateId.includes("ssl") ||
    templateId.includes("tls") ||
    templateId.includes("openssl")
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
  if (filter === "encrypted") {
    return (
      isEncryptedTemplate(templateId) ||
      ("tags" in collection && collection.tags.includes("encrypted"))
    );
  }

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
  const [collectionQuery, setCollectionQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>(() =>
    isCollectionFilter(initialFilterParam) ? initialFilterParam : "all",
  );
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [favoritePresetIds, setFavoritePresetIds] = useState<string[]>(() =>
    readFavoritePresets(),
  );

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

  const visiblePresets = useMemo(() => {
    if (showAllPresets) return filteredPresets;
    return filteredPresets.slice(0, PRESETS_PAGE_SIZE);
  }, [filteredPresets, showAllPresets]);

  const selectedPreset = useMemo(() => {
    if (!filteredPresets.length) return null;
    const match = filteredPresets.find((p) => p.id === selectedPresetId);
    return match ?? filteredPresets[0];
  }, [filteredPresets, selectedPresetId]);

  const recommendedPresets = useMemo(
    () =>
      RECOMMENDED_PRESET_IDS.map((id) =>
        builtinCollections.find((collection) => collection.id === id),
      ).filter((collection): collection is BuiltinCollection => !!collection),
    [],
  );

  const favoritePresets = useMemo(
    () =>
      favoritePresetIds
        .map((id) =>
          builtinCollections.find((collection) => collection.id === id),
        )
        .filter((collection): collection is BuiltinCollection => !!collection),
    [favoritePresetIds],
  );

  const [recents, setRecents] = useState<RecentWorkflow[]>(() =>
    readRecentWorkflows(),
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
      const id = options?.presetId ?? col.id ?? label;
      pushRecentWorkflow({
        id,
        label,
        href: "/builder",
        kind: options?.presetId ? "preset" : "saved",
      });
      setRecents(readRecentWorkflows());
      toast.success(t("load_success", { name: label }));
      router.push("/builder");
    },
    [router, t],
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
      {recents.length > 0 && (
        <section className="rounded-lg border bg-muted/20 px-3 py-2">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            {t("recents_title")}
          </p>
          <ul className="flex flex-wrap gap-2">
            {recents.map((item) => (
              <li key={`${item.id}-${item.at}`}>
                <Link
                  href={item.href}
                  className="inline-flex rounded-md border bg-background px-2.5 py-1 text-xs font-medium hover:border-primary/40"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {favoritePresets.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
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
                  handleLoad(preset, {
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

      {!collectionQuery.trim() && recommendedPresets.length > 0 && (
        <section className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">
            {t("recommended_title")}
          </h2>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            {recommendedPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() =>
                  handleLoad(preset, {
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
                  {t("recommended_load_hint")}
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
        <div className="sticky top-14 z-30 space-y-3 rounded-lg border bg-card/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <Label>{t("collection_search_label")}</Label>
          <Input
            value={collectionQuery}
            onChange={(event) => setCollectionQuery(event.target.value)}
            placeholder={t("collection_search_placeholder")}
          />
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
        <p className="text-xs text-muted-foreground">
          {t("presets_visible", {
            shown: visiblePresets.length,
            total: filteredPresets.length,
          })}
        </p>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
          <ul className="max-h-[32rem] space-y-1 overflow-y-auto rounded-lg border bg-card p-2">
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

          <Card className="flex flex-col">
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

        {filteredPresets.length > PRESETS_PAGE_SIZE && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllPresets((value) => !value)}
          >
            {showAllPresets ? t("show_fewer_presets") : t("show_all_presets")}
          </Button>
        )}
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

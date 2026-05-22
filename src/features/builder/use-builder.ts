"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveCollection } from "@/features/collections/collections-db";
import {
  configFromSearchParams,
  syncShareUrl,
} from "@/features/builder/share-config";
import {
  persistBuilderConfig,
  readInitialBuilderConfig,
} from "@/features/builder/store";
import { downloadText } from "@/features/builder/utils";
import {
  createEngagementCard,
  createHoaxShellServerScript,
  createStageScript,
  defaultStageTemplateId,
  defaultConfig,
  generateReverseShell,
  hoaxShellServerCommand,
  compatibleObfuscationModes,
  getConnectionModeById,
  getRecommendedListenerId,
  getTemplate,
  reverseShellTemplates,
  getConfigFieldErrors,
  safeParseReverseShellConfig,
  safeObfuscationForTemplate,
  stageServeCommand,
  stageTemplateOptions,
  supportsHttpServerNotes,
  supportsStageFile,
  usesBindPortOnly,
  usesCallbackHost,
  usesShellInput,
  type Platform,
  type ReverseShellConfig,
  type ShellFamily,
} from "@/lib/reverse-shells";

export function useBuilder() {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");

  const [config, setConfig] = useState<ReverseShellConfig>(() => {
    if (typeof window === "undefined") return defaultConfig();
    return (
      configFromSearchParams(window.location.search) ??
      readInitialBuilderConfig()
    );
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [stageTemplateId, setStageTemplateId] = useState(
    defaultStageTemplateId,
  );
  const [payloadQuery, setPayloadQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [familyFilter, setFamilyFilter] = useState<"all" | ShellFamily>("all");

  useEffect(() => {
    persistBuilderConfig(config);
    syncShareUrl(config);
  }, [config]);

  const fieldErrors = useMemo(
    () => getConfigFieldErrors(config, config.templateId),
    [config],
  );
  const safeConfig = useMemo(
    () => safeParseReverseShellConfig(config),
    [config],
  );
  const generated = useMemo(
    () => (safeConfig ? generateReverseShell(safeConfig) : null),
    [safeConfig],
  );
  const selectedTemplate = getTemplate(config.templateId);
  const connectionMode = getConnectionModeById(config.templateId);
  const stageScript = useMemo(
    () =>
      safeConfig && supportsStageFile(connectionMode)
        ? createStageScript(safeConfig, stageTemplateId)
        : null,
    [safeConfig, connectionMode, stageTemplateId],
  );
  const stageTemplates = stageTemplateOptions();
  const stageServe = safeConfig ? stageServeCommand(safeConfig) : "";
  const hoaxServerScript = useMemo(
    () =>
      safeConfig && supportsHttpServerNotes(connectionMode)
        ? createHoaxShellServerScript(safeConfig)
        : null,
    [safeConfig, connectionMode],
  );
  const hoaxServerCommand =
    safeConfig && supportsHttpServerNotes(connectionMode)
      ? hoaxShellServerCommand(safeConfig)
      : "";
  const compatibleOptions = compatibleObfuscationModes(selectedTemplate);
  const showLhost = usesCallbackHost(connectionMode);
  const bindMode = usesBindPortOnly(connectionMode);
  const showShell = usesShellInput(config.templateId);
  const filteredTemplates = useMemo(() => {
    const query = payloadQuery.trim().toLowerCase();

    return reverseShellTemplates.filter((template) => {
      const matchesPlatform =
        platformFilter === "all" || template.platform === platformFilter;
      const matchesFamily =
        familyFilter === "all" || template.family === familyFilter;
      const translatedName = t(`templates.${template.id}.name`);
      const translatedDescription = t(`templates.${template.id}.description`);
      const haystack = [
        template.id,
        template.name,
        template.family,
        template.platform,
        template.description,
        translatedName,
        translatedDescription,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesPlatform && matchesFamily && (!query || haystack.includes(query))
      );
    });
  }, [familyFilter, payloadQuery, platformFilter, t]);

  const lhostHint = bindMode
    ? t("lhost_bind_hint")
    : connectionMode === "staged"
      ? t("lhost_staged_hint")
      : connectionMode === "http-callback"
        ? t("lhost_http_hint")
        : undefined;

  function patchConfig(patch: Partial<ReverseShellConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
  }

  function handleTemplateChange(templateId: string) {
    const template = getTemplate(templateId);
    patchConfig({
      templateId,
      shell: template.defaultShell,
      obfuscation: safeObfuscationForTemplate(templateId, config.obfuscation),
    });
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success(t("copied"));
  }

  function handleSave(name: string) {
    if (!safeConfig || !generated) {
      toast.error(t("invalid_save"));
      return;
    }
    void saveCollection({
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      config: safeConfig,
      renderedCommand: generated.command,
    }).then(() => toast.success(t("saved")));
  }

  function handleExportCard() {
    if (!safeConfig || !generated) {
      toast.error(t("invalid_export"));
      return;
    }
    const listenerId = getRecommendedListenerId(safeConfig.templateId);
    const listenerLabel =
      listenerId === "hoax-http"
        ? t("card_http_command_server")
        : tListener(`templates.${listenerId}.name`);
    const exportNotes = [
      t(`templates.${safeConfig.templateId}.description`),
      t(`obfuscation_notes.${safeConfig.obfuscation}`),
    ];
    const card = createEngagementCard(
      safeConfig,
      generated,
      {
        title: t("card_title"),
        generated: t("card_generated"),
        configuration: t("card_configuration"),
        command: t("card_command"),
        rawCommand: t("card_raw_command"),
        listener: t("card_listener"),
        stageFile: t("stage_file_title"),
        httpServer: t("http_server_title"),
        notes: t("card_notes"),
        authorizedOnly: t("card_authorized_only"),
        template: t("card_template"),
        platform: t("card_platform"),
        bindPort: t("card_bind_port"),
        lhost: t("lhost_label"),
        lport: t("lport_label"),
        shell: t("shell_label"),
        obfuscation: t("obfuscation_label"),
        type: t("card_type"),
        stageServeCommand: t("stage_serve_title"),
        hoaxServerCommand: t("http_server_command_title"),
        bindConnectListener: t("card_bind_connect_listener"),
        httpCommandServer: t("card_http_command_server"),
        tcpListener: t("card_tcp_listener"),
        listenerName: listenerLabel,
      },
      stageTemplateId,
      exportNotes,
    );
    downloadText(
      `reverseshell-${safeConfig.templateId}-${safeConfig.lhost}-${safeConfig.lport}.md`,
      card,
      "text/markdown",
    );
    toast.success(t("exported_card"));
  }

  return {
    t,
    config,
    patchConfig,
    handleTemplateChange,
    copy,
    handleSave,
    handleExportCard,
    saveDialogOpen,
    setSaveDialogOpen,
    stageTemplateId,
    setStageTemplateId,
    payloadQuery,
    setPayloadQuery,
    platformFilter,
    setPlatformFilter,
    familyFilter,
    setFamilyFilter,
    fieldErrors,
    safeConfig,
    generated,
    selectedTemplate,
    connectionMode,
    stageScript,
    stageTemplates,
    stageServe,
    hoaxServerScript,
    hoaxServerCommand,
    compatibleOptions,
    showLhost,
    bindMode,
    showShell,
    filteredTemplates,
    lhostHint,
  };
}

export type BuilderState = ReturnType<typeof useBuilder>;

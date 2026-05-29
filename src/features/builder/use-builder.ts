"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { saveCollection } from "@/features/collections/collections-db";
import {
  configFromSearchParams,
  syncShareUrl,
  uiFromSearchParams,
} from "@/features/builder/share-config";
import {
  familyAvailableForFilters,
  templateMatchesFilters,
  type ArchitectureFilter,
  type NetworkEgressFilter,
  type TechniqueTypeFilter,
  type VictimToolFilter,
} from "@/features/builder/constants";
import {
  persistBuilderConfig,
  persistBuilderUi,
  readInitialBuilderConfig,
  readPersistedBuilderUi,
} from "@/features/builder/store";
import { downloadText } from "@/features/builder/utils";
import {
  createEngagementCard,
  defaultStageTemplateId,
  defaultConfig,
  generateReverseShell,
  compatibleObfuscationModes,
  getConnectionModeById,
  getSmartDefaultListenerId,
  getTemplate,
  listenerTemplates,
  reverseShellTemplates,
  getConfigFieldErrors,
  safeParseReverseShellConfig,
  safeObfuscationForTemplate,
  stageTemplateOptions,
  usesBindPortOnly,
  usesCallbackHost,
  usesShellInput,
  type Platform,
  type ReverseShellConfig,
  type ShellFamily,
} from "@/lib/reverse-shells";

const COMMON_PORTS = new Set([
  20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 111, 119, 123, 135, 137, 138,
  139, 143, 161, 162, 389, 443, 445, 465, 514, 515, 587, 631, 636, 873, 993,
  995, 1080, 1433, 1521, 1723, 2049, 2375, 2376, 3000, 3001, 3002, 3306, 3389,
  5000, 5432, 5601, 5672, 5900, 5985, 5986, 6379, 8000, 8008, 8080, 8081, 8443,
  9000, 9200, 9300, 11211, 15672, 27017,
]);

export function useBuilder() {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");
  const initialConfig = useMemo(() => {
    if (typeof window === "undefined") return defaultConfig();
    return (
      configFromSearchParams(window.location.search) ??
      readInitialBuilderConfig()
    );
  }, []);
  const persistedUi = useMemo(() => {
    if (typeof window === "undefined") return null;
    return (
      uiFromSearchParams(window.location.search) ?? readPersistedBuilderUi()
    );
  }, []);

  const [config, setConfig] = useState<ReverseShellConfig>(initialConfig);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [techniqueTypeFilter, setTechniqueTypeFilter] =
    useState<TechniqueTypeFilter>(
      () => persistedUi?.techniqueTypeFilter ?? "reverse",
    );
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>(
    () => persistedUi?.platformFilter ?? "all",
  );
  const [architectureFilter, setArchitectureFilter] =
    useState<ArchitectureFilter>(
      () => persistedUi?.architectureFilter ?? "all",
    );
  const [victimToolFilters, setVictimToolFilters] = useState<
    VictimToolFilter[]
  >(() => persistedUi?.victimToolFilters ?? []);
  const [networkEgressFilter, setNetworkEgressFilter] =
    useState<NetworkEgressFilter>(
      () => persistedUi?.networkEgressFilter ?? "all",
    );
  const [familyFilter, setFamilyFilter] = useState<"all" | ShellFamily>(
    () => persistedUi?.familyFilter ?? "all",
  );
  const [selectedListenerId, setSelectedListenerId] = useState<string | null>(
    () =>
      persistedUi?.selectedListenerId ??
      getSmartDefaultListenerId(initialConfig.templateId),
  );
  const [stageTemplateId, setStageTemplateId] = useState(
    () => persistedUi?.stageTemplateId ?? defaultStageTemplateId,
  );
  const [selectedUpgradeRecipeId, setSelectedUpgradeRecipeId] = useState(
    () => persistedUi?.selectedUpgradeRecipeId ?? "python-pty",
  );
  const [selectedCleanupRecipeId, setSelectedCleanupRecipeId] = useState(
    () => persistedUi?.selectedCleanupRecipeId ?? "terminal-env",
  );
  const stageTemplates = useMemo(() => stageTemplateOptions(), []);
  const safeStageTemplateId = stageTemplates.some(
    (template) => template.id === stageTemplateId,
  )
    ? stageTemplateId
    : defaultStageTemplateId;

  useEffect(() => {
    persistBuilderConfig(config);
    syncShareUrl(config, {
      platformFilter,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      familyFilter,
      techniqueTypeFilter,
      selectedListenerId,
      stageTemplateId: safeStageTemplateId,
      selectedUpgradeRecipeId,
      selectedCleanupRecipeId,
    });
  }, [
    config,
    platformFilter,
    architectureFilter,
    victimToolFilters,
    networkEgressFilter,
    familyFilter,
    techniqueTypeFilter,
    selectedListenerId,
    safeStageTemplateId,
    selectedUpgradeRecipeId,
    selectedCleanupRecipeId,
  ]);

  useEffect(() => {
    persistBuilderUi({
      platformFilter,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      familyFilter,
      techniqueTypeFilter,
      selectedListenerId,
      stageTemplateId: safeStageTemplateId,
      selectedUpgradeRecipeId,
      selectedCleanupRecipeId,
    });
  }, [
    platformFilter,
    architectureFilter,
    victimToolFilters,
    networkEgressFilter,
    familyFilter,
    techniqueTypeFilter,
    selectedListenerId,
    safeStageTemplateId,
    selectedUpgradeRecipeId,
    selectedCleanupRecipeId,
  ]);

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
  const compatibleOptions = compatibleObfuscationModes(selectedTemplate);
  const showLhost = usesCallbackHost(connectionMode);
  const bindMode = usesBindPortOnly(connectionMode);
  const showShell = usesShellInput(config.templateId);
  const filteredTemplates = useMemo(() => {
    return reverseShellTemplates.filter((template) =>
      templateMatchesFilters(template, {
        platform: platformFilter,
        architecture: architectureFilter,
        victimTools: victimToolFilters,
        networkEgress: networkEgressFilter,
        family: familyFilter,
        techniqueType: techniqueTypeFilter,
      }),
    );
  }, [
    architectureFilter,
    familyFilter,
    networkEgressFilter,
    platformFilter,
    techniqueTypeFilter,
    victimToolFilters,
  ]);

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

  function randomizeLport() {
    const randomValues = crypto.getRandomValues(new Uint32Array(32));
    const candidate =
      Array.from(randomValues)
        .map((value) => (value % 65535) + 1)
        .find((port) => !COMMON_PORTS.has(port)) ?? 4444;
    patchConfig({ lport: candidate });
  }

  function handleTemplateChange(templateId: string) {
    const template = getTemplate(templateId);
    patchConfig({
      templateId,
      shell: template.defaultShell,
      obfuscation: safeObfuscationForTemplate(templateId, config.obfuscation),
    });
    setSelectedListenerId(getSmartDefaultListenerId(templateId));
  }

  function handleListenerChange(listenerId: string) {
    setSelectedListenerId(listenerId);
  }

  function familyAvailableForVictim(
    family: "all" | ShellFamily,
    platform: "all" | Platform,
    architecture: ArchitectureFilter,
    victimTools: VictimToolFilter[],
    networkEgress: NetworkEgressFilter,
  ) {
    return familyAvailableForFilters(reverseShellTemplates, family, {
      platform,
      architecture,
      victimTools,
      networkEgress,
      techniqueType: techniqueTypeFilter,
    });
  }

  function selectFirstTemplateForVictim(
    platform: "all" | Platform,
    architecture: ArchitectureFilter,
    victimTools: VictimToolFilter[],
    networkEgress: NetworkEgressFilter,
    family: "all" | ShellFamily,
  ) {
    if (
      templateMatchesFilters(selectedTemplate, {
        platform,
        architecture,
        victimTools,
        networkEgress,
        family,
        techniqueType: techniqueTypeFilter,
      })
    ) {
      return;
    }

    const firstMatchingTemplate = reverseShellTemplates.find((template) =>
      templateMatchesFilters(template, {
        platform,
        architecture,
        victimTools,
        networkEgress,
        family,
        techniqueType: techniqueTypeFilter,
      }),
    );

    if (firstMatchingTemplate) {
      handleTemplateChange(firstMatchingTemplate.id);
    }
  }

  function handlePlatformFilterChange(value: "all" | Platform) {
    setPlatformFilter(value);
    const nextFamily = familyAvailableForVictim(
      familyFilter,
      value,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) setFamilyFilter("all");
    selectFirstTemplateForVictim(
      value,
      architectureFilter,
      victimToolFilters,
      networkEgressFilter,
      nextFamily,
    );
  }

  function handleArchitectureFilterChange(value: ArchitectureFilter) {
    setArchitectureFilter(value);
    const nextFamily = familyAvailableForVictim(
      familyFilter,
      platformFilter,
      value,
      victimToolFilters,
      networkEgressFilter,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) setFamilyFilter("all");
    selectFirstTemplateForVictim(
      platformFilter,
      value,
      victimToolFilters,
      networkEgressFilter,
      nextFamily,
    );
  }

  function handleVictimToolToggle(tool: VictimToolFilter) {
    const nextTools = victimToolFilters.includes(tool)
      ? victimToolFilters.filter((currentTool) => currentTool !== tool)
      : [...victimToolFilters, tool];
    setVictimToolFilters(nextTools);
    const nextFamily = familyAvailableForVictim(
      familyFilter,
      platformFilter,
      architectureFilter,
      nextTools,
      networkEgressFilter,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) setFamilyFilter("all");
    selectFirstTemplateForVictim(
      platformFilter,
      architectureFilter,
      nextTools,
      networkEgressFilter,
      nextFamily,
    );
  }

  function handleNetworkEgressChange(value: NetworkEgressFilter) {
    setNetworkEgressFilter(value);
    const nextFamily = familyAvailableForVictim(
      familyFilter,
      platformFilter,
      architectureFilter,
      victimToolFilters,
      value,
    )
      ? familyFilter
      : "all";

    if (nextFamily !== familyFilter) setFamilyFilter("all");
    selectFirstTemplateForVictim(
      platformFilter,
      architectureFilter,
      victimToolFilters,
      value,
      nextFamily,
    );
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("copied"));
    } catch {
      toast.error(t("copy_failed"));
    }
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
    const listenerOptions = new Set<string>(
      listenerTemplates.map((listener) => listener.id),
    );
    if (connectionMode === "http-callback") {
      listenerOptions.add("hoax-http");
    }
    const listenerId =
      selectedListenerId && listenerOptions.has(selectedListenerId)
        ? selectedListenerId
        : getSmartDefaultListenerId(safeConfig.templateId);
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
      safeStageTemplateId,
      exportNotes,
      listenerId,
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
    randomizeLport,
    handleTemplateChange,
    copy,
    handleSave,
    handleExportCard,
    saveDialogOpen,
    setSaveDialogOpen,
    techniqueTypeFilter,
    setTechniqueTypeFilter,
    platformFilter,
    setPlatformFilter: handlePlatformFilterChange,
    architectureFilter,
    setArchitectureFilter: handleArchitectureFilterChange,
    victimToolFilters,
    toggleVictimTool: handleVictimToolToggle,
    networkEgressFilter,
    setNetworkEgressFilter: handleNetworkEgressChange,
    familyFilter,
    setFamilyFilter,
    fieldErrors,
    safeConfig,
    generated,
    selectedTemplate,
    connectionMode,
    compatibleOptions,
    showLhost,
    bindMode,
    showShell,
    filteredTemplates,
    lhostHint,
    selectedListenerId,
    onListenerChange: handleListenerChange,
    stageTemplateId: safeStageTemplateId,
    setStageTemplateId,
    selectedUpgradeRecipeId,
    setSelectedUpgradeRecipeId,
    selectedCleanupRecipeId,
    setSelectedCleanupRecipeId,
  };
}

export type BuilderState = ReturnType<typeof useBuilder>;

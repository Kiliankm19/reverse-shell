"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Bookmark, Copy, Download, RadioTower, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SaveCollectionDialog } from "@/features/collections/save-collection-dialog";
import { saveCollection } from "@/features/collections/collections-db";
import { PayloadPicker } from "@/features/builder/payload-picker";
import { RecommendedListenerCard } from "@/features/builder/recommended-listener-card";
import {
  configFromSearchParams,
  syncShareUrl,
} from "@/features/builder/share-config";
import {
  persistBuilderConfig,
  readInitialBuilderConfig,
} from "@/features/builder/store";
import {
  createEngagementCard,
  createHoaxShellServerScript,
  createStageScript,
  defaultStageTemplateId,
  defaultConfig,
  generateReverseShell,
  hoaxShellServerCommand,
  hoaxShellServerFileName,
  compatibleObfuscationModes,
  getConnectionModeById,
  getRecommendedListenerId,
  getTemplate,
  reverseShellTemplates,
  getConfigFieldErrors,
  safeParseReverseShellConfig,
  safeObfuscationForTemplate,
  stageFileName,
  stageServeCommand,
  stageTemplateOptions,
  supportsHttpServerNotes,
  supportsStageFile,
  usesBindPortOnly,
  usesCallbackHost,
  usesShellInput,
  type ObfuscationMode,
  type PayloadConnectionMode,
  type Platform,
  type ReverseShellConfig,
  type ShellFamily,
} from "@/lib/reverse-shells";

const obfuscationKeys: Array<{
  value: ObfuscationMode;
  labelKey:
    | "obfuscation_none"
    | "obfuscation_url"
    | "obfuscation_bash_base64"
    | "obfuscation_bash_ifs"
    | "obfuscation_bash_rev"
    | "obfuscation_ps_enc"
    | "obfuscation_ps_concat"
    | "obfuscation_python_chr";
}> = [
  { value: "none", labelKey: "obfuscation_none" },
  { value: "url", labelKey: "obfuscation_url" },
  { value: "bash-base64", labelKey: "obfuscation_bash_base64" },
  { value: "bash-ifs", labelKey: "obfuscation_bash_ifs" },
  { value: "bash-rev", labelKey: "obfuscation_bash_rev" },
  { value: "powershell-encoded", labelKey: "obfuscation_ps_enc" },
  { value: "powershell-concat", labelKey: "obfuscation_ps_concat" },
  { value: "python-chr", labelKey: "obfuscation_python_chr" },
];

const PLATFORM_FILTERS: Array<"all" | Platform> = [
  "all",
  "linux",
  "windows",
  "multi",
];
const FAMILY_FILTERS: Array<"all" | ShellFamily> = [
  "all",
  "bash",
  "nc",
  "python",
  "php",
  "perl",
  "ruby",
  "node",
  "java",
  "go",
  "lua",
  "awk",
  "openssl",
  "telnet",
  "socat",
  "powershell",
  "staged",
  "bind",
];

function modeLabel(
  t: ReturnType<typeof useTranslations<"builder">>,
  mode: PayloadConnectionMode,
): string {
  switch (mode) {
    case "bind":
      return t("mode_bind");
    case "staged":
      return t("mode_staged");
    case "http-callback":
      return t("mode_http");
    default:
      return t("mode_reverse");
  }
}

function downloadText(filename: string, content: string, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BuilderPageClient() {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");
  const [config, setConfig] = useState<ReverseShellConfig>(() => {
    if (typeof window === "undefined") return defaultConfig();
    return (
      configFromSearchParams(window.location.search) ??
      readInitialBuilderConfig()
    );
  });

  useEffect(() => {
    persistBuilderConfig(config);
    syncShareUrl(config);
  }, [config]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [stageTemplateId, setStageTemplateId] = useState(
    defaultStageTemplateId,
  );
  const [payloadQuery, setPayloadQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | Platform>("all");
  const [familyFilter, setFamilyFilter] = useState<"all" | ShellFamily>("all");

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

  const lhostHint = bindMode
    ? t("lhost_bind_hint")
    : connectionMode === "staged"
      ? t("lhost_staged_hint")
      : connectionMode === "http-callback"
        ? t("lhost_http_hint")
        : undefined;

  return (
    <main className="flex-1 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSaveDialogOpen(true)}
              className="gap-2"
              size="lg"
            >
              <Bookmark className="h-4 w-4" />
              {t("save_button")}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportCard}
              disabled={!generated}
              className="gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              {t("export_card_button")}
            </Button>
            <Button
              onClick={() => generated && void copy(generated.command)}
              disabled={!generated}
              className="gap-2"
              size="lg"
            >
              <Copy className="h-4 w-4" />
              {t("copy_command_button")}
            </Button>
          </div>
        </div>

        <SaveCollectionDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          onSave={handleSave}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <RadioTower className="h-4 w-4 text-primary" />{" "}
                  {t("payload_label")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>{t("payload_search_label")}</Label>
                    <Input
                      value={payloadQuery}
                      onChange={(event) => setPayloadQuery(event.target.value)}
                      placeholder={t("payload_search_placeholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("platform_filter_label")}</Label>
                    <Select
                      value={platformFilter}
                      onValueChange={(value) =>
                        setPlatformFilter(value as "all" | Platform)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PLATFORM_FILTERS.map((platform) => (
                          <SelectItem key={platform} value={platform}>
                            {platform === "all"
                              ? t("filter_all")
                              : t(`platforms.${platform}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("family_filter_label")}</Label>
                    <Select
                      value={familyFilter}
                      onValueChange={(value) =>
                        setFamilyFilter(value as "all" | ShellFamily)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FAMILY_FILTERS.map((family) => (
                          <SelectItem key={family} value={family}>
                            {family === "all"
                              ? t("filter_all")
                              : t(`families.${family}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <Label>{t("payload_label")}</Label>
                      <span className="text-xs text-muted-foreground">
                        {t("payload_result_count", {
                          count: filteredTemplates.length,
                          total: reverseShellTemplates.length,
                        })}
                      </span>
                    </div>
                    <PayloadPicker
                      templates={filteredTemplates}
                      value={config.templateId}
                      onChange={handleTemplateChange}
                    />
                    {filteredTemplates.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        {t("payload_no_results")}
                      </p>
                    )}
                    <Badge variant="outline" className="font-mono text-xs">
                      {modeLabel(t, connectionMode)}
                    </Badge>
                  </div>
                  {showShell && (
                    <div className="space-y-2">
                      <Label>{t("shell_label")}</Label>
                      <Input
                        value={config.shell}
                        onChange={(event) =>
                          patchConfig({ shell: event.target.value })
                        }
                        placeholder={selectedTemplate.defaultShell}
                        aria-invalid={!!fieldErrors.shell}
                      />
                      {fieldErrors.shell && (
                        <p className="text-xs text-destructive">
                          {t("validation_field_shell")}
                        </p>
                      )}
                    </div>
                  )}
                  {showLhost && (
                    <div className="space-y-2">
                      <Label>{t("lhost_label")}</Label>
                      <Input
                        value={config.lhost}
                        onChange={(event) =>
                          patchConfig({ lhost: event.target.value })
                        }
                        placeholder={t("lhost_placeholder")}
                        aria-invalid={!!fieldErrors.lhost}
                      />
                      {fieldErrors.lhost && (
                        <p className="text-xs text-destructive">
                          {t("validation_field_lhost")}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="builder-lport">{t("lport_label")}</Label>
                    <Input
                      id="builder-lport"
                      type="number"
                      min={1}
                      max={65535}
                      value={config.lport}
                      onChange={(event) =>
                        patchConfig({ lport: Number(event.target.value) || 1 })
                      }
                      aria-invalid={!!fieldErrors.lport}
                    />
                    {fieldErrors.lport && (
                      <p className="text-xs text-destructive">
                        {t("validation_field_lport")}
                      </p>
                    )}
                  </div>
                  {connectionMode === "staged" && (
                    <div className="space-y-2">
                      <Label>{t("http_port_label")}</Label>
                      <Input
                        type="number"
                        min={1}
                        max={65535}
                        value={config.httpPort ?? 8000}
                        onChange={(event) =>
                          patchConfig({
                            httpPort: Number(event.target.value) || 1,
                          })
                        }
                        aria-invalid={!!fieldErrors.httpPort}
                      />
                      {fieldErrors.httpPort && (
                        <p className="text-xs text-destructive">
                          {t("validation_field_http_port")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-2 rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">
                      {t(`templates.${selectedTemplate.id}.name`)}
                    </strong>
                    {" · "}
                    {selectedTemplate.platform} ·{" "}
                    {t(`templates.${selectedTemplate.id}.description`)}
                  </p>
                  {lhostHint && <p>{lhostHint}</p>}
                  {bindMode && <p>{t("lport_bind_hint")}</p>}
                </div>
                {!safeConfig && Object.keys(fieldErrors).length > 0 && (
                  <div className="rounded-md border border-destructive bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {t("validation_error")}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Wand2 className="h-4 w-4 text-primary" />{" "}
                  {t("obfuscation_label")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={config.obfuscation}
                  onValueChange={(value) =>
                    patchConfig({ obfuscation: value as ObfuscationMode })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {obfuscationKeys
                      .filter((option) =>
                        compatibleOptions.includes(option.value),
                      )
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.labelKey)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {t("obfuscation_note")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("obfuscation_compat_note")}
                </p>
              </CardContent>
            </Card>

            {stageScript && safeConfig && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    {t("stage_file_title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("stage_file_hint")}
                  </p>
                  <div className="space-y-2">
                    <Label>{t("stage_template_label")}</Label>
                    <Select
                      value={stageTemplateId}
                      onValueChange={setStageTemplateId}
                    >
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
                      onClick={() =>
                        downloadText(stageFileName(safeConfig), stageScript)
                      }
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
            )}

            {supportsHttpServerNotes(connectionMode) &&
              safeConfig &&
              hoaxServerScript && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {t("http_server_title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t("http_server_hint")}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {hoaxShellServerFileName()} ·{" "}
                      {t("http_server_command_title")}
                    </p>
                    <Textarea
                      value={hoaxServerScript}
                      readOnly
                      className="min-h-48 font-mono text-xs"
                    />
                    <Textarea
                      value={hoaxServerCommand}
                      readOnly
                      className="min-h-16 font-mono text-xs"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => void copy(hoaxServerScript)}
                      >
                        <Copy className="h-4 w-4" />
                        {hoaxShellServerFileName()}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() =>
                          downloadText(
                            hoaxShellServerFileName(),
                            hoaxServerScript,
                          )
                        }
                      >
                        <Download className="h-4 w-4" />
                        {t("download_server_button")}
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => void copy(hoaxServerCommand)}
                      >
                        <Copy className="h-4 w-4" />
                        {t("http_server_command_title")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          <div className="space-y-6">
            <RecommendedListenerCard
              config={config}
              connectionMode={connectionMode}
              onCopy={(value) => void copy(value)}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("generated_command_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={generated?.command ?? t("invalid_input")}
                  readOnly
                  className="min-h-48 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => generated && void copy(generated.command)}
                  disabled={!generated}
                >
                  <Copy className="h-4 w-4" />
                  {t("copy_command_button")}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {t("raw_command_title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={generated?.rawCommand ?? ""}
                  readOnly
                  className="min-h-32 font-mono text-xs"
                />
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {generated && (
                    <>
                      <li>
                        - {t(`templates.${generated.template.id}.description`)}
                      </li>
                      <li>
                        -{" "}
                        {t(
                          `obfuscation_notes.${safeConfig?.obfuscation ?? "none"}`,
                        )}
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

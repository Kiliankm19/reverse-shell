"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, Headphones, Server, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  buildListenerCommand,
  getRecommendedListenerCommand,
} from "@/lib/reverse-shells/listener-command";
import {
  getTemplate,
  listenerTemplates,
  upgradeRecipes,
} from "@/lib/reverse-shells";
import type { ReverseShellConfig } from "@/lib/reverse-shells";

interface RecommendedListenerCardProps {
  config: ReverseShellConfig;
  connectionMode: string;
  onCopy: (value: string) => void;
}

export function RecommendedListenerCard({
  config,
  connectionMode,
  onCopy,
}: RecommendedListenerCardProps) {
  const t = useTranslations("builder");
  const tListener = useTranslations("listener");
  const tUpgrade = useTranslations("upgrade");
  const recommendation = getRecommendedListenerCommand(
    config.templateId,
    config.lhost,
    config.lport,
  );
  const [selectedListenerId, setSelectedListenerId] = useState<
    typeof recommendation.listenerId | null
  >(null);
  const [selectedUpgradeRecipeId, setSelectedUpgradeRecipeId] =
    useState("python-pty");
  const listenerId = selectedListenerId ?? recommendation.listenerId;
  const selectedTemplate = getTemplate(config.templateId);

  const command = buildListenerCommand(listenerId, config.lhost, config.lport);

  const showUpgrade =
    connectionMode === "reverse" || connectionMode === "staged";
  const availableUpgradeRecipes = upgradeRecipes.filter((recipe) => {
    if (selectedTemplate.platform === "windows") {
      return recipe.platform === "windows";
    }

    if (selectedTemplate.platform === "macos") {
      return recipe.platform !== "windows";
    }

    return recipe.platform === "linux" || recipe.platform === "multi";
  });
  const selectedUpgradeRecipe =
    availableUpgradeRecipes.find(
      (recipe) => recipe.id === selectedUpgradeRecipeId,
    ) ?? availableUpgradeRecipes[0];
  const upgradeText = selectedUpgradeRecipe
    ? selectedUpgradeRecipe
        .steps(config.shell, config.lhost, config.lport)
        .join("\n")
    : "";

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Headphones className="h-4 w-4 text-primary" />
          {t("recommended_listener_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("recommended_listener_hint")}
        </p>
      </CardHeader>
      <CardContent>
        <div
          className={
            showUpgrade && selectedUpgradeRecipe
              ? "grid gap-4 lg:grid-cols-2"
              : "space-y-4"
          }
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4 text-primary" />
                {t("listener_setup_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={listenerId}
                onValueChange={(value) =>
                  setSelectedListenerId(value as typeof listenerId)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {listenerTemplates.map((listener) => (
                    <SelectItem key={listener.id} value={listener.id}>
                      {tListener(`templates.${listener.id}.name`)}
                    </SelectItem>
                  ))}
                  {recommendation.listenerId === "hoax-http" && (
                    <SelectItem value="hoax-http">
                      {t("card_http_command_server")}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {command ? (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("listener_command_label")}
                  </p>
                  <Textarea
                    value={command}
                    readOnly
                    className="min-h-24 font-mono text-xs"
                  />
                  <Button
                    className="w-fit gap-2"
                    onClick={() => onCopy(command)}
                  >
                    <Copy className="h-4 w-4" />
                    {t("copy_listener_button")}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("recommended_listener_http_note")}
                </p>
              )}
            </CardContent>
          </Card>
          {showUpgrade && selectedUpgradeRecipe && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TerminalSquare className="h-4 w-4 text-primary" />
                  {t("tty_upgrade_title")}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t("tty_upgrade_hint")}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    {t("tty_upgrade_recipe_label")}
                  </label>
                  <Select
                    value={selectedUpgradeRecipe.id}
                    onValueChange={setSelectedUpgradeRecipeId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUpgradeRecipes.map((recipe) => (
                        <SelectItem key={recipe.id} value={recipe.id}>
                          {tUpgrade(`recipes.${recipe.id}.name`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("tty_upgrade_steps_label")}
                  </p>
                  <Textarea
                    value={upgradeText}
                    readOnly
                    className="min-h-28 font-mono text-xs"
                  />
                </div>
                <Button
                  className="w-fit gap-2"
                  onClick={() => onCopy(upgradeText)}
                >
                  <Copy className="h-4 w-4" />
                  {t("copy_upgrade_button")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Copy, TerminalSquare } from "lucide-react";
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
  getTemplate,
  upgradeRecipes,
  type PayloadConnectionMode,
  type ReverseShellConfig,
  type UpgradeRecipe,
} from "@/lib/reverse-shells";

const TTY_UPGRADE_RECIPE_IDS = new Set([
  "python-pty",
  "python-command-pty",
  "python2-pty-upgrade",
  "script-tty",
  "script-bsd-tty",
  "stty-stabilize",
  "expect-spawn",
  "socat-upgrade",
  "windows-ncat-reconnect",
]);

const CLEANUP_RECIPE_IDS = new Set([
  "bash-interactive",
  "sh-interactive",
  "terminal-env",
  "terminal-reset",
  "terminal-resize",
  "rlwrap-reconnect",
  "windows-conpty",
  "windows-codepage",
]);

const TERMINAL_SIZE_COMMAND = "stty rows $(tput lines) columns $(tput cols)";

interface NextStepCardProps {
  config: ReverseShellConfig;
  connectionMode: PayloadConnectionMode;
  selectedUpgradeRecipeId: string;
  onUpgradeRecipeChange: (recipeId: string) => void;
  selectedCleanupRecipeId: string;
  onCleanupRecipeChange: (recipeId: string) => void;
  onCopy: (value: string) => void;
}

function matchesSelectedPlatform(recipe: UpgradeRecipe, platform: string) {
  if (platform === "windows") {
    return recipe.platform === "windows";
  }

  if (platform === "macos") {
    return recipe.platform === "macos" || recipe.platform === "multi";
  }

  return recipe.platform === "linux" || recipe.platform === "multi";
}

export function NextStepCard({
  config,
  connectionMode,
  selectedUpgradeRecipeId,
  onUpgradeRecipeChange,
  selectedCleanupRecipeId,
  onCleanupRecipeChange,
  onCopy,
}: NextStepCardProps) {
  const t = useTranslations("builder");
  const tUpgrade = useTranslations("upgrade");

  const selectedTemplate = getTemplate(config.templateId);
  const showUpgrade =
    connectionMode === "reverse" || connectionMode === "staged";

  const availableRecipes = upgradeRecipes.filter((recipe) =>
    matchesSelectedPlatform(recipe, selectedTemplate.platform),
  );
  const availableUpgradeRecipes = availableRecipes.filter((recipe) =>
    TTY_UPGRADE_RECIPE_IDS.has(recipe.id),
  );
  const availableCleanupRecipes = availableRecipes.filter((recipe) =>
    CLEANUP_RECIPE_IDS.has(recipe.id),
  );
  const selectedUpgradeRecipe =
    availableUpgradeRecipes.find(
      (recipe) => recipe.id === selectedUpgradeRecipeId,
    ) ?? availableUpgradeRecipes[0];
  const selectedCleanupRecipe =
    availableCleanupRecipes.find(
      (recipe) => recipe.id === selectedCleanupRecipeId,
    ) ?? availableCleanupRecipes[0];
  const upgradeText = selectedUpgradeRecipe
    ? selectedUpgradeRecipe
        .steps(config.shell, config.lhost, config.lport)
        .join("\n")
    : "";
  const cleanupText = selectedCleanupRecipe
    ? selectedCleanupRecipe
        .steps(config.shell, config.lhost, config.lport)
        .join("\n")
    : "";

  useEffect(() => {
    if (!showUpgrade || !selectedUpgradeRecipe) return;
    if (selectedUpgradeRecipe.id !== selectedUpgradeRecipeId) {
      onUpgradeRecipeChange(selectedUpgradeRecipe.id);
    }
  }, [
    onUpgradeRecipeChange,
    selectedUpgradeRecipe,
    selectedUpgradeRecipeId,
    showUpgrade,
  ]);

  useEffect(() => {
    if (!showUpgrade || !selectedCleanupRecipe) return;
    if (selectedCleanupRecipe.id !== selectedCleanupRecipeId) {
      onCleanupRecipeChange(selectedCleanupRecipe.id);
    }
  }, [
    onCleanupRecipeChange,
    selectedCleanupRecipe,
    selectedCleanupRecipeId,
    showUpgrade,
  ]);

  if (!showUpgrade || !selectedUpgradeRecipe) return null;

  return (
    <Card className="transition-colors hover:border-primary/40 focus-within:border-primary/40">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TerminalSquare className="h-4 w-4 text-primary" />
          {t("next_step_title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("next_step_hint")}</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <section className="space-y-3 rounded-lg border bg-muted/20 p-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <TerminalSquare className="h-4 w-4 text-primary" />
              {t("tty_upgrade_title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("tty_upgrade_size_hint")}{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
                {TERMINAL_SIZE_COMMAND}
              </code>
            </p>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t("tty_upgrade_recipe_label")}
              </label>
              <Select
                value={selectedUpgradeRecipe.id}
                onValueChange={onUpgradeRecipeChange}
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
            <Button className="w-fit gap-2" onClick={() => onCopy(upgradeText)}>
              <Copy className="h-4 w-4" />
              {t("copy_upgrade_button")}
            </Button>
          </div>
        </section>

        {selectedCleanupRecipe && (
          <section className="space-y-3 rounded-lg border bg-muted/20 p-3">
            <div className="space-y-1">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <TerminalSquare className="h-4 w-4 text-primary" />
                {t("session_cleanup_title")}
              </h3>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                {t("session_cleanup_recipe_label")}
              </label>
              <Select
                value={selectedCleanupRecipe.id}
                onValueChange={onCleanupRecipeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableCleanupRecipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {tUpgrade(`recipes.${recipe.id}.name`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {t("session_cleanup_steps_label")}
              </p>
              <Textarea
                value={cleanupText}
                readOnly
                className="min-h-24 font-mono text-xs"
              />
            </div>
            <Button className="w-fit gap-2" onClick={() => onCopy(cleanupText)}>
              <Copy className="h-4 w-4" />
              {t("copy_cleanup_button")}
            </Button>
          </section>
        )}
      </CardContent>
    </Card>
  );
}

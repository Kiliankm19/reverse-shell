"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function SiteFooter() {
  const t = useTranslations("footer");

  const resourceLinks = [{ href: "/legal", label: t("legal") }];

  return (
    <footer className="mt-auto border-t py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-1.5">
          <p className="font-mono text-xs font-semibold">
            <span className="text-primary">reverse</span>shell
          </p>
          <p className="max-w-md text-xs text-muted-foreground">
            {t("tagline")}
          </p>
          <p className="text-xs text-muted-foreground">{t("privacy_note")}</p>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("resources_title")}
          </p>
          <nav className="flex flex-col gap-1.5 text-xs">
            {resourceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

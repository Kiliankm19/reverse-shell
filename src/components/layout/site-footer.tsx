"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const SCENARIO_LINKS = [
  { href: "/collections?filter=reverse", key: "web" as const },
  { href: "/collections?filter=linux", key: "linux" as const },
  { href: "/collections?filter=windows", key: "windows" as const },
  { href: "/collections?filter=encrypted", key: "tls" as const },
  { href: "/collections?filter=bind", key: "bind" as const },
  { href: "/collections?filter=assembled", key: "staged" as const },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  const tHome = useTranslations("home");

  const productLinks = [
    { href: "/", label: t("home") },
    { href: "/builder", label: t("builder") },
    { href: "/collections", label: t("collections") },
  ];

  const resourceLinks = [
    { href: "/guides", label: t("guides") },
    { href: "/legal", label: t("legal") },
  ];

  return (
    <footer className="mt-auto border-t py-6">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="space-y-1.5 lg:col-span-2">
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
            {t("product_title")}
          </p>
          <nav className="flex flex-col gap-1.5 text-xs">
            {productLinks.map((link) => (
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

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("scenarios_title")}
          </p>
          <nav className="flex flex-col gap-1.5 text-xs">
            {SCENARIO_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {tHome(`scenario_${link.key}_title`)}
              </Link>
            ))}
          </nav>
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

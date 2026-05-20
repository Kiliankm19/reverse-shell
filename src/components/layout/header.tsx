"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, RadioTower, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  pathname: string;
}

function NavLink({ href, label, pathname }: NavLinkProps) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "text-sm transition-colors hover:text-foreground",
        isActive ? "font-medium text-foreground" : "text-muted-foreground",
      )}
    >
      {label}
    </Link>
  );
}

function ThemeToggle({ label }: { label: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={label}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const locale = segments[0] ?? "en";
  const base = `/${locale}`;
  const pathWithoutLocale = `/${segments.slice(1).join("/")}`;
  const localizedPath = (nextLocale: string) =>
    `/${nextLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          href={`${base}/reverseshell`}
          className="flex items-center gap-2 font-bold"
        >
          <RadioTower className="h-5 w-5 text-primary" />
          <span className="font-mono tracking-tight">
            <span className="text-primary">reverse</span>shell
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          <NavLink href={`${base}/builder`} label={t("builder")} pathname={pathname} />
          <NavLink href={`${base}/listener`} label={t("listener")} pathname={pathname} />
          <NavLink href={`${base}/upgrade`} label={t("upgrade")} pathname={pathname} />
          <NavLink
            href={`${base}/collections`}
            label={t("collections")}
            pathname={pathname}
          />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href={localizedPath(locale === "fr" ? "en" : "fr")}
            className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {locale === "fr" ? "EN" : "FR"}
          </Link>
          <ThemeToggle label={t("toggle_theme")} />
        </div>
      </div>
    </header>
  );
}

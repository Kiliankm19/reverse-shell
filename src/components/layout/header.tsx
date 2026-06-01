"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Moon, RadioTower, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  label: string;
  pathname: string;
  exact?: boolean;
}

function NavLink({ href, label, pathname, exact = false }: NavLinkProps) {
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
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

function contextualCta(pathname: string): {
  href: string;
  labelKey: "launch_builder" | "browse_presets" | "open_guides";
  show: boolean;
} {
  if (pathname === "/" || pathname.startsWith("/builder")) {
    return { href: "/collections", labelKey: "browse_presets", show: true };
  }
  if (pathname.startsWith("/collections")) {
    return { href: "/builder", labelKey: "launch_builder", show: true };
  }
  if (pathname.startsWith("/guides") || pathname.startsWith("/legal")) {
    return { href: "/builder", labelKey: "launch_builder", show: true };
  }
  return { href: "/builder", labelKey: "launch_builder", show: true };
}

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const cta = contextualCta(pathname);
  const hidePrimaryOnBuilder =
    pathname === "/" || pathname.startsWith("/builder");

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold">
          <RadioTower className="h-5 w-5 text-primary" />
          <span className="font-mono tracking-tight">
            <span className="text-primary">reverse</span>shell
          </span>
        </Link>

        <nav
          className="hidden flex-1 items-center gap-4 md:flex"
          aria-label="Main navigation"
        >
          <NavLink href="/" label={t("home")} pathname={pathname} exact />
          <NavLink href="/builder" label={t("builder")} pathname={pathname} />
          <NavLink
            href="/collections"
            label={t("collections")}
            pathname={pathname}
          />
          <NavLink href="/guides" label={t("guides")} pathname={pathname} />
          <NavLink href="/legal" label={t("legal")} pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <span className="hidden rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground lg:inline">
            {t("local_badge")}
          </span>
          {cta.show && !hidePrimaryOnBuilder && (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}
          {cta.show && hidePrimaryOnBuilder && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
            >
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}
          <MobileNav
            ctaHref={cta.href}
            ctaLabel={t(cta.labelKey)}
            showCta={cta.show}
          />
          <ThemeToggle label={t("toggle_theme")} />
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Moon, Sun, Terminal, Command } from "lucide-react";
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
        "relative px-3 py-1.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {isActive && (
        <span className="absolute inset-x-0 -bottom-px h-px bg-primary" />
      )}
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
      className="h-8 w-8 text-muted-foreground hover:text-foreground"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function contextualCta(pathname: string): {
  href: string;
  labelKey: "launch_builder" | "browse_presets";
  show: boolean;
} {
  if (pathname === "/" || pathname.startsWith("/builder")) {
    return { href: "/collections", labelKey: "browse_presets", show: true };
  }
  if (pathname.startsWith("/collections")) {
    return { href: "/builder", labelKey: "launch_builder", show: true };
  }
  if (pathname.startsWith("/legal")) {
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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
            <Terminal className="h-4 w-4 text-primary" />
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            <span className="text-primary">reverse</span>
            <span className="text-foreground">shell</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden flex-1 items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          <NavLink href="/builder" label={t("builder")} pathname={pathname} />
          <NavLink
            href="/collections"
            label={t("collections")}
            pathname={pathname}
          />
          <NavLink href="/legal" label={t("legal")} pathname={pathname} />
        </nav>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Status Badge */}
          <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 lg:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
              {t("local_badge")}
            </span>
          </div>

          {/* CTA Button */}
          {cta.show && !hidePrimaryOnBuilder && (
            <Button
              asChild
              size="sm"
              className="hidden h-8 px-3 text-xs font-medium sm:inline-flex"
            >
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}
          {cta.show && hidePrimaryOnBuilder && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden h-8 px-3 text-xs font-medium border-border/50 sm:inline-flex"
            >
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}

          {/* Keyboard Shortcut Hint */}
          <div className="hidden items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 py-1 xl:flex">
            <Command className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              K
            </span>
          </div>

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

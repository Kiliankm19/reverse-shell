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
        "relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-md",
        isActive
          ? "text-primary bg-primary/5"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      {label}
      {isActive && (
        <span className="absolute inset-x-1 -bottom-1 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
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
      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
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
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
            <Terminal className="h-4.5 w-4.5 text-primary" />
            <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-semibold tracking-tight leading-none">
              <span className="text-primary">reverse</span>
              <span className="text-foreground">shell</span>
            </span>
            <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wider uppercase mt-0.5">
              generator
            </span>
          </div>
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
        <div className="ml-auto flex items-center gap-3">
          {/* Status Badge */}
          <div className="hidden items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/90">
              {t("local_badge")}
            </span>
          </div>

          {/* CTA Button */}
          {cta.show && !hidePrimaryOnBuilder && (
            <Button
              asChild
              size="sm"
              className="hidden h-9 px-4 text-xs font-semibold sm:inline-flex rounded-lg glow-neon-sm"
            >
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}
          {cta.show && hidePrimaryOnBuilder && (
            <Button
              asChild
              size="sm"
              variant="outline"
              className="hidden h-9 px-4 text-xs font-semibold border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/30 sm:inline-flex rounded-lg transition-all duration-200"
            >
              <Link href={cta.href}>{t(cta.labelKey)}</Link>
            </Button>
          )}

          {/* Keyboard Shortcut Hint */}
          <div className="hidden items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-2 py-1.5 xl:flex">
            <Command className="h-3 w-3 text-muted-foreground/70" />
            <span className="text-[10px] font-semibold text-muted-foreground/70">
              K
            </span>
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

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

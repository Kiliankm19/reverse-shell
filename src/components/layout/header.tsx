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
  const isActive =
    pathname === href ||
    (href === "/" && pathname === "/builder") ||
    (href !== "/" && pathname.startsWith(`${href}/`));
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

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex min-h-14 max-w-7xl flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <RadioTower className="h-5 w-5 text-primary" />
          <span className="font-mono tracking-tight">
            <span className="text-primary">reverse</span>shell
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4">
          <NavLink href="/" label={t("builder")} pathname={pathname} />
          <NavLink
            href="/collections"
            label={t("collections")}
            pathname={pathname}
          />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle label={t("toggle_theme")} />
        </div>
      </div>
    </header>
  );
}

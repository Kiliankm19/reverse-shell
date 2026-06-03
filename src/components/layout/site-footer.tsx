"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Github, Terminal, Shield, Lock } from "lucide-react";

export function SiteFooter() {
  const t = useTranslations("footer");

  const resourceLinks = [
    { href: "/legal", label: t("legal") },
    { href: "/collections", label: "Collections" },
    { href: "/builder", label: "Builder" },
  ];

  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                <Terminal className="h-4 w-4 text-primary" />
              </div>
              <span className="font-mono text-sm font-semibold tracking-tight">
                <span className="text-primary">reverse</span>
                <span className="text-foreground">shell</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Resources Column */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("resources_title")}
            </p>
            <nav className="flex flex-col gap-2.5">
              {resourceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Security Column */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Security
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  {t("privacy_note")}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  For authorized security testing only
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Built for security researchers and penetration testers
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

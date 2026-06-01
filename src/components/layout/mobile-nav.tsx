"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  ctaHref: string;
  ctaLabel: string;
  showCta: boolean;
}

export function MobileNav({ ctaHref, ctaLabel, showCta }: MobileNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home"), exact: true },
    { href: "/builder", label: t("builder") },
    { href: "/collections", label: t("collections") },
    { href: "/guides", label: t("guides") },
    { href: "/legal", label: t("legal") },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={t("open_menu")}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 p-0 sm:max-w-sm">
        <DialogHeader className="border-b px-4 py-4">
          <DialogTitle className="flex items-center gap-2 font-mono text-base">
            <RadioTower className="h-4 w-4 text-primary" />
            <span>
              <span className="text-primary">reverse</span>shell
            </span>
          </DialogTitle>
        </DialogHeader>
        <nav className="flex flex-col px-2 py-3" aria-label="Mobile navigation">
          {links.map((link) => {
            const isActive = link.exact
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t px-4 py-4">
          <p className="mb-3 text-xs text-muted-foreground">
            {t("local_badge")}
          </p>
          {showCta && (
            <Button asChild className="w-full" onClick={() => setOpen(false)}>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

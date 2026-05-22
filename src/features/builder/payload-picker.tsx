"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ReverseShellTemplate } from "@/lib/reverse-shells";

interface PayloadPickerProps {
  templates: ReverseShellTemplate[];
  value: string;
  onChange: (templateId: string) => void;
}

export function PayloadPicker({
  templates,
  value,
  onChange,
}: PayloadPickerProps) {
  const t = useTranslations("builder");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = templates.find((item) => item.id === value) ?? templates[0];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return templates;
    return templates.filter((template) => {
      const label = t(`templates.${template.id}.name`).toLowerCase();
      return (
        template.id.includes(needle) ||
        template.family.includes(needle) ||
        template.platform.includes(needle) ||
        label.includes(needle)
      );
    });
  }, [query, t, templates]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? t(`templates.${selected.id}.name`) : t("payload_label")}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("payload_picker_title")}</DialogTitle>
        </DialogHeader>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("payload_search_placeholder")}
          autoFocus
        />
        <ScrollArea className="h-72 pr-3">
          <div className="space-y-1">
            {filtered.map((template) => (
              <button
                key={template.id}
                type="button"
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent",
                  template.id === value && "bg-accent font-medium",
                )}
                onClick={() => {
                  onChange(template.id);
                  setOpen(false);
                  setQuery("");
                }}
              >
                <div>{t(`templates.${template.id}.name`)}</div>
                <div className="text-xs text-muted-foreground">
                  {template.platform} · {template.family}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">
                {t("payload_no_results")}
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

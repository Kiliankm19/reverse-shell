"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_COLLECTION_NAME_LENGTH, trimCollectionName } from "@/lib/security";

interface SaveCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => void;
}

export function SaveCollectionDialog({
  open,
  onOpenChange,
  onSave,
}: SaveCollectionDialogProps) {
  const t = useTranslations("collections");
  const [name, setName] = useState("");

  function handleSave() {
    const trimmed = trimCollectionName(name);
    if (!trimmed) return;
    onSave(trimmed);
    setName("");
    onOpenChange(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Enter") handleSave();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("save_dialog_title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="collection-name">{t("save_dialog_label")}</Label>
          <Input
            id="collection-name"
            value={name}
            onChange={(event) => setName(trimCollectionName(event.target.value))}
            onKeyDown={handleKeyDown}
            placeholder={t("name_placeholder")}
            maxLength={MAX_COLLECTION_NAME_LENGTH}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t("save_copy")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

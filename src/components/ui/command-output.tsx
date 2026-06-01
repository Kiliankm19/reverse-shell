"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CommandOutputProps {
  value: string;
  label?: string;
  onCopy?: () => void;
  copyLabel?: string;
  copiedLabel?: string;
  className?: string;
  minHeight?: string;
}

export function CommandOutput({
  value,
  label,
  onCopy,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
  minHeight = "min-h-32",
}: CommandOutputProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (onCopy) {
      onCopy();
    } else {
      await navigator.clipboard.writeText(value);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="relative rounded-md border bg-background">
        <pre
          className={cn(
            "overflow-x-auto p-3 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap",
            minHeight,
          )}
        >
          {value}
        </pre>
        {onCopy !== undefined || value ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2 gap-1.5"
            onClick={() => void handleCopy()}
            disabled={!value}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? copiedLabel : copyLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
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
      <div className="terminal-block relative overflow-hidden">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between border-b border-border/30 bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Output
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          </div>
        </div>

        {/* Code Content */}
        <div className="relative">
          <pre
            className={cn(
              "overflow-x-auto p-4 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-primary/90",
              minHeight,
            )}
          >
            <span className="text-muted-foreground select-none">$ </span>
            {value}
          </pre>
          {(onCopy !== undefined || value) && (
            <Button
              type="button"
              size="sm"
              variant={copied ? "default" : "secondary"}
              className={cn(
                "absolute top-3 right-3 h-7 gap-1.5 text-xs font-medium transition-all",
                copied && "bg-primary text-primary-foreground glow-primary-sm",
              )}
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
          )}
        </div>
      </div>
    </div>
  );
}

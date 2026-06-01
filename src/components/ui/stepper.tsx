"use client";

import { cn } from "@/lib/utils";

export interface StepperStep {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepperStep[];
  currentStep: number;
  onStepChange?: (index: number) => void;
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  onStepChange,
  className,
}: StepperProps) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-2", className)}
      aria-label="Builder progress"
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        return (
          <li key={step.id} className="flex items-center gap-2">
            {index > 0 && (
              <span
                className="hidden h-px w-4 bg-border sm:block"
                aria-hidden
              />
            )}
            <button
              type="button"
              onClick={() => onStepChange?.(index)}
              disabled={!onStepChange}
              className={cn(
                "flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors",
                isActive &&
                  "border-primary bg-primary/10 font-medium text-foreground",
                isComplete && !isActive && "border-border text-foreground",
                !isActive &&
                  !isComplete &&
                  "border-transparent text-muted-foreground",
                onStepChange && "hover:border-border hover:bg-muted/50",
                !onStepChange && "cursor-default",
              )}
              aria-current={isActive ? "step" : undefined}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold",
                  isActive && "bg-primary text-primary-foreground",
                  isComplete && !isActive && "bg-muted text-foreground",
                  !isActive && !isComplete && "bg-muted text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

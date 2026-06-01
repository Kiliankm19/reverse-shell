export interface RecentWorkflow {
  id: string;
  label: string;
  href: string;
  kind: "preset" | "saved" | "builder";
  at: number;
}

const RECENTS_KEY = "reverseshell:recent-workflows";
const MAX_RECENTS = 6;

export function readRecentWorkflows(): RecentWorkflow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentWorkflow[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.label === "string" &&
        typeof item.href === "string",
    );
  } catch {
    return [];
  }
}

export function pushRecentWorkflow(
  entry: Omit<RecentWorkflow, "at">,
): RecentWorkflow[] {
  if (typeof window === "undefined") return [];
  const next: RecentWorkflow = { ...entry, at: Date.now() };
  const merged = [
    next,
    ...readRecentWorkflows().filter((item) => item.id !== entry.id),
  ].slice(0, MAX_RECENTS);
  localStorage.setItem(RECENTS_KEY, JSON.stringify(merged));
  return merged;
}

export function clearRecentWorkflows(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENTS_KEY);
}

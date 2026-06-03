import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CollectionsPanel } from "@/features/collections/collections-panel";
import { FolderOpen, Loader2 } from "lucide-react";

export default async function CollectionsPage() {
  const t = await getTranslations("collections");

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 grid-bg">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <FolderOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-balance">
                {t("title")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>
          </div>
        </div>

        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <p className="text-sm">{t("loading")}</p>
              </div>
            </div>
          }
        >
          <CollectionsPanel />
        </Suspense>
      </div>
    </main>
  );
}

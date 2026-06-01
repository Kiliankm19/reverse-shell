import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CollectionsPanel } from "@/features/collections/collections-panel";

export default async function CollectionsPage() {
  const t = await getTranslations("collections");

  return (
    <main className="flex-1 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">{t("loading")}</p>
          }
        >
          <CollectionsPanel />
        </Suspense>
      </div>
    </main>
  );
}

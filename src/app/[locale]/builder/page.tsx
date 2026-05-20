import { setRequestLocale } from "next-intl/server";
import { BuilderPageClient } from "./page-client";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuilderPageClient />;
}

import { setRequestLocale } from "next-intl/server";
import { ListenerPanel } from "@/features/listener/listener-panel";

export default async function ListenerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ListenerPanel />;
}

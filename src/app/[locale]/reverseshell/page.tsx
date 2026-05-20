import { setRequestLocale } from "next-intl/server";
import { HomePage } from "@/features/home/home-page";

export default async function ReverseShellPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomePage />;
}

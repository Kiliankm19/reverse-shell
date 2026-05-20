"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ArrowRight, RadioTower, Shield, Wand2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function HomePage() {
  const t = useTranslations("home");
  const params = useParams<{ locale?: string }>();
  const locale = params.locale ?? "en";
  const base = `/${locale}`;

  const features = [
    {
      icon: RadioTower,
      title: t("feature_payloads_title"),
      description: t("feature_payloads_desc"),
    },
    {
      icon: Wand2,
      title: t("feature_encoders_title"),
      description: t("feature_encoders_desc"),
    },
    {
      icon: Shield,
      title: t("feature_formats_title"),
      description: t("feature_formats_desc"),
    },
    {
      icon: FolderOpen,
      title: t("feature_collections_title"),
      description: t("feature_collections_desc"),
    },
  ];

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <div className="w-full max-w-5xl space-y-10">
        <section className="space-y-4 text-center">
          <h1 className="font-mono text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
            <span className="text-primary">reverse</span>shell
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">{t("tagline")}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href={`${base}/builder`}>
                {t("cta_launch")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`${base}/collections`}>{t("cta_collections")}</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <feature.icon className="h-4 w-4 text-primary" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Wand2 className="h-3.5 w-3.5" />
          {t("client_side_note")}
        </p>
      </div>
    </main>
  );
}

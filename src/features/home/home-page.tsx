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
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-10">
        <section className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight">
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

        <p className="text-center text-xs text-muted-foreground">
          <Link href={`${base}/legal`} className="underline hover:text-foreground">
            {t("cta_legal")}
          </Link>
        </p>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  FolderOpen,
  RadioTower,
  Shield,
  Terminal,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBanner } from "@/components/layout/trust-banner";
import { ProductMockupHero } from "@/components/home/product-mockup-hero";

const SCENARIO_IDS = [
  "web",
  "linux",
  "windows",
  "tls",
  "bind",
  "staged",
] as const;

const SCENARIO_LINKS: Record<(typeof SCENARIO_IDS)[number], string> = {
  web: "/collections?filter=reverse",
  linux: "/collections?filter=linux",
  windows: "/collections?filter=windows",
  tls: "/collections?filter=encrypted",
  bind: "/collections?filter=bind",
  staged: "/collections?filter=assembled",
};

export function HomePage() {
  const t = useTranslations("home");

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

  const howSteps = [
    {
      title: t("how_step_1_title"),
      description: t("how_step_1_desc"),
    },
    {
      title: t("how_step_2_title"),
      description: t("how_step_2_desc"),
    },
    {
      title: t("how_step_3_title"),
      description: t("how_step_3_desc"),
    },
  ];

  const faqs = [
    { q: t("faq_q1"), a: t("faq_a1") },
    { q: t("faq_q2"), a: t("faq_a2") },
    { q: t("faq_q3"), a: t("faq_a3") },
    { q: t("faq_q4"), a: t("faq_a4") },
  ];

  return (
    <>
      <TrustBanner collapsibleOnMobile />
      <main className="flex flex-1 flex-col">
        <section className="border-b px-4 py-12 sm:px-6 sm:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">
                <span className="text-primary">reverse</span>shell
              </h1>
              <p className="text-lg text-muted-foreground">{t("hero_title")}</p>
              <p className="text-sm text-muted-foreground">{t("tagline")}</p>
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/builder">
                    {t("cta_launch")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/collections">{t("cta_collections")}</Link>
                </Button>
              </div>
              <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground lg:justify-start">
                <Terminal className="h-3.5 w-3.5" />
                {t("client_side_note")}
              </p>
            </div>
            <ProductMockupHero />
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("how_it_works_title")}
              </h2>
            </div>
            <ol className="grid gap-4 md:grid-cols-3">
              {howSteps.map((step, index) => (
                <li key={step.title}>
                  <Card className="h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        {step.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y bg-muted/20 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {t("scenarios_title")}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("scenarios_subtitle")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SCENARIO_IDS.map((id) => (
                <Link
                  key={id}
                  href={SCENARIO_LINKS[id]}
                  className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                >
                  <p className="font-medium">{t(`scenario_${id}_title`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`scenario_${id}_desc`)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        <section className="border-t bg-muted/20 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-center text-2xl font-bold tracking-tight">
              {t("faq_title")}
            </h2>
            <dl className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-lg border bg-card p-4">
                  <dt className="font-medium">{faq.q}</dt>
                  <dd className="mt-2 text-sm text-muted-foreground">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-4 py-16 text-center sm:px-6">
          <div className="mx-auto max-w-xl space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              {t("final_cta_title")}
            </h2>
            <p className="text-muted-foreground">{t("final_cta_subtitle")}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/builder">{t("final_cta_primary")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/collections">{t("final_cta_secondary")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

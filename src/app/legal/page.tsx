import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/layout/trust-banner";

export default async function LegalPage() {
  const t = await getTranslations("legal");

  const items = [
    t("acceptableUse.items.0"),
    t("acceptableUse.items.1"),
    t("acceptableUse.items.2"),
    t("acceptableUse.items.3"),
  ];

  const prohibited = [
    t("prohibited.items.0"),
    t("prohibited.items.1"),
    t("prohibited.items.2"),
  ];

  return (
    <>
      <TrustBanner compact />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("intro")}</p>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>{t("trust_summary.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("trust_summary.body")}</p>
              <Button asChild variant="outline" size="sm">
                <Link href="/builder">{t("trust_summary.cta")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("disclaimer.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("disclaimer.body")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("acceptableUse.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("prohibited.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {prohibited.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("does_not_do.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-inside list-disc space-y-2 text-muted-foreground">
                {[0, 1, 2, 3].map((i) => (
                  <li key={i}>{t(`does_not_do.items.${i}`)}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("privacy.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t("privacy.body")}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrustBanner } from "@/components/layout/trust-banner";
import { playbookBuilderUrl } from "@/lib/playbook-presets";

const SCENARIO_IDS = [
  "web",
  "linux",
  "windows",
  "tls",
  "bind",
  "staged",
] as const;

const RELEASE_IDS = ["builder-update", "welcome"] as const;

export default async function GuidesPage() {
  const t = await getTranslations("blog");

  return (
    <>
      <TrustBanner compact />
      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{t("scenarios_title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("scenarios_subtitle")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SCENARIO_IDS.map((id) => (
                <Card key={id} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {t(`scenarios.${id}.title`)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="mt-auto space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {t(`scenarios.${id}.body`)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={playbookBuilderUrl(id)}>
                          {t("scenario_cta_launch")}
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/collections?filter=${id === "web" ? "reverse" : id === "tls" ? "encrypted" : id === "staged" ? "assembled" : id}`}
                        >
                          {t("scenario_cta_presets")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4 border-t pt-8">
            <div>
              <h2 className="text-lg font-semibold text-muted-foreground">
                {t("release_notes_title")}
              </h2>
            </div>
            {RELEASE_IDS.map((id) => (
              <Card key={id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t(`posts.${id}.title`)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t(`posts.${id}.date`)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>{t(`posts.${id}.excerpt`)}</p>
                  <p className="leading-relaxed text-foreground">
                    {t(`posts.${id}.body`)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

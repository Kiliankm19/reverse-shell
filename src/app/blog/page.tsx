import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const POST_IDS = ["welcome"] as const;

export default async function BlogPage() {
  const t = await getTranslations("blog");

  return (
    <main className="flex-1 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
          <p className="text-sm text-muted-foreground">{t("intro")}</p>
        </div>

        <div className="space-y-4">
          {POST_IDS.map((id) => (
            <Card key={id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  {t(`posts.${id}.title`)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t(`posts.${id}.date`)}
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{t(`posts.${id}.excerpt`)}</p>
                <p className="leading-relaxed text-foreground">
                  {t(`posts.${id}.body`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}

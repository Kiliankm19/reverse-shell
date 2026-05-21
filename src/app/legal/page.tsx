import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LegalPage() {
  const t = await getTranslations("legal");

  const items = [
    t("acceptableUse.items.0"),
    t("acceptableUse.items.1"),
    t("acceptableUse.items.2"),
    t("acceptableUse.items.3"),
  ];

  return (
    <main className="flex-1 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
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
            <CardTitle>{t("privacy.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("privacy.body")}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

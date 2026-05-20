import type { MetadataRoute } from "next";

const BASE_URL = "https://reverseshell.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "fr"];
  const routes = [
    "/reverseshell",
    "/builder",
    "/listener",
    "/upgrade",
    "/collections",
    "/blog",
    "/legal",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "monthly" : "weekly",
        priority:
          route === "/reverseshell"
            ? 1
            : route === "/builder"
              ? 0.9
              : 0.7,
      });
    }
  }

  return entries;
}

import type { MetadataRoute } from "next";

const BASE_URL = "https://reverseshell.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/reverseshell",
    "/listener",
    "/upgrade",
    "/collections",
    "/blog",
    "/legal",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "weekly",
    priority: route === "" || route === "/reverseshell" ? 1 : 0.7,
  }));
}

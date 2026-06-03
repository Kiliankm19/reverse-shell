import type { MetadataRoute } from "next";

const BASE_URL = "https://reverseshell.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/builder", "/collections", "/legal"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "monthly" : "weekly",
    priority: route === "" || route === "/builder" ? 1 : 0.7,
  }));
}

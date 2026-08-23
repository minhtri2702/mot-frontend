import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mottruyentranh.site";
  const routes = ["", "/truyen-hot", "/truyen-moi-cap-nhat", "/truyen-full", "/the-loai", "/tim-kiem"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "hourly",
    priority: route === "" ? 1 : 0.8,
  }));
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mọt Truyện",
    short_name: "Mọt",
    description: "Đọc manga và truyện tranh, tiếp tục đúng vị trí trên mọi thiết bị.",
    start_url: "/",
    display: "standalone",
    background_color: "#11100f",
    theme_color: "#f26135",
    lang: "vi",
    icons: [
      { src: "/pwa-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440],
    imageSizes: [32, 40, 48, 64, 96, 128, 192, 256, 384],
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "www.svgrepo.com",
      "100.94.58.103",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.svgrepo.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "100.94.58.103",
        port: "9000",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const internalApiUrl = process.env.INTERNAL_API_URL || "http://product-services:8080";

    return [
      {
        source: "/api/v1/images/:path*",
        destination: `${internalApiUrl}/api/v1/images/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      { source: "/quoc-gia", destination: "/the-loai", permanent: true },
      { source: "/quoc-gia/:path*", destination: "/the-loai", permanent: true },
      { source: "/lich-su-doc", destination: "/profile", permanent: true },
    ];
  },
};

export default nextConfig;

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nuno Starter SQLite",
    short_name: "Starter",
    description:
      "Modern full-stack starter kit with Next.js, tRPC, Drizzle, and Better-Auth on SQLite",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#f8f3e9",
    theme_color: "#281c17",
    orientation: "portrait-primary",
    categories: ["developer", "productivity"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Landing",
        short_name: "Home",
        description: "Starter kit landing page",
        url: "/",
      },
      {
        name: "Demo App",
        short_name: "Posts",
        description: "SQLite CRUD workspace",
        url: "/posts",
      },
    ],
  };
}

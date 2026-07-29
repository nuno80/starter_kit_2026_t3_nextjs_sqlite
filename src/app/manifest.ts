import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Nuno Starter SQlite",
    short_name: "Starter",
    description: "Modern full-stack starter kit with Next.js, tRPC, Drizzle, and Better-Auth on SQLite",
    lang: "it",
    categories: ["productivity", "developer tools"],
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait",
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
    // `screenshots` (wide + narrow form factors) meaningfully improve the install UI on
    // desktop Chrome/Edge, but they need real screenshots of *your* running app - add them
    // once you have production content to show. See docs/pwa/README.md.
    shortcuts: [
      {
        name: "Bacheca Post (demo CRUD)",
        short_name: "Post",
        url: "/posts",
      },
      {
        name: "Dashboard amministrazione",
        short_name: "Admin",
        url: "/admin-dashboard",
      },
    ],
  };
}


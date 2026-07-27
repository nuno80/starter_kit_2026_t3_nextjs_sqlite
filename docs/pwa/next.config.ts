import type { NextConfig } from "next";
import withSerwistInit from "@serwist/turbopack";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // Disabilita in dev per non dover invalidare la cache ad ogni modifica
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // la tua config esistente va qui
};

export default withSerwist(nextConfig);

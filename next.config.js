/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  exclude: [
    ({ asset }) => Boolean(asset.name.startsWith("server/") || asset.name.match(/^((app|pages)\/)?_not-found\/|^.*_not-found.*\.js$/)),
  ],
});

/** @type {import("next").NextConfig} */
const config = {
  turbopack: {
    root: import.meta.dirname,
  },
};

export default withSerwist(config);

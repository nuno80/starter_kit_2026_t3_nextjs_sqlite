import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, "BETTER_AUTH_SECRET must be at least 32 characters long. Generate one using: openssl rand -base64 32"),
    BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),
    BETTER_AUTH_GITHUB_CLIENT_ID: z.string().optional(),
    BETTER_AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
    BETTER_AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
    BETTER_AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("onboarding@resend.dev"),
    // Stripe
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRICE_ONE_TIME_BASIC: z.string().optional(),
    STRIPE_PRICE_ONE_TIME_PRO: z.string().optional(),
    STRIPE_PRICE_SUB_MONTHLY: z.string().optional(),
    STRIPE_PRICE_SUB_YEARLY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development")
      .superRefine((val, ctx) => {
        const isBuildOrTest =
          !!process.env.SKIP_ENV_VALIDATION ||
          !!process.env.npm_lifecycle_event ||
          process.argv.some((arg) =>
            arg.includes("node_modules") ||
            arg.includes("next") ||
            arg.includes("playwright") ||
            arg.includes("test")
          );
        if (val === "production" && !isBuildOrTest) {
          if (!process.env.RESEND_API_KEY) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "RESEND_API_KEY is required in production",
              path: ["RESEND_API_KEY"],
            });
          }
          if (!process.env.EMAIL_FROM) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "EMAIL_FROM is required in production",
              path: ["EMAIL_FROM"],
            });
          }
        }
      }),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    BETTER_AUTH_GITHUB_CLIENT_ID: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
    BETTER_AUTH_GITHUB_CLIENT_SECRET:
      process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
    BETTER_AUTH_GOOGLE_CLIENT_ID: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID,
    BETTER_AUTH_GOOGLE_CLIENT_SECRET:
      process.env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ONE_TIME_BASIC: process.env.STRIPE_PRICE_ONE_TIME_BASIC,
    STRIPE_PRICE_ONE_TIME_PRO: process.env.STRIPE_PRICE_ONE_TIME_PRO,
    STRIPE_PRICE_SUB_MONTHLY: process.env.STRIPE_PRICE_SUB_MONTHLY,
    STRIPE_PRICE_SUB_YEARLY: process.env.STRIPE_PRICE_SUB_YEARLY,
    NODE_ENV: process.env.NODE_ENV,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

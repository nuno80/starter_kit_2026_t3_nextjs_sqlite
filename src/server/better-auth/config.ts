import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
  }),
  plugins: [admin()],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(env.BETTER_AUTH_GITHUB_CLIENT_ID && env.BETTER_AUTH_GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: env.BETTER_AUTH_GITHUB_CLIENT_ID,
            clientSecret: env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
            redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
          },
        }
      : {}),
    ...(env.BETTER_AUTH_GOOGLE_CLIENT_ID && env.BETTER_AUTH_GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.BETTER_AUTH_GOOGLE_CLIENT_ID,
            clientSecret: env.BETTER_AUTH_GOOGLE_CLIENT_SECRET,
            redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
          },
        }
      : {}),
  },
});

export type Session = typeof auth.$Infer.Session;

import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "~/server/better-auth";

export const { GET, POST } = toNextJsHandler(auth.handler);

// Ensure Next.js doesn't statically render auth routes during build
export const dynamic = "force-dynamic";

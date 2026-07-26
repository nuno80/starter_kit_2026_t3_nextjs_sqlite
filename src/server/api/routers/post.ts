import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";

export const postRouter = createTRPCRouter({
  adminCheck: adminProcedure.query(() => {
    return "admin secret message";
  }),

  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(posts).values({
        name: input.name,
        createdById: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
      limit: 20,
    });
  }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { eq } = await import("drizzle-orm");
      const targetPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!targetPost) {
        const { TRPCError } = await import("@trpc/server");
        throw new TRPCError({ code: "NOT_FOUND", message: "Post non trovato" });
      }

      const isAdmin = (role?: string | null) => role ? role.split(",").map((r) => r.trim()).includes("admin") : false;
      const isOwner = targetPost.createdById === ctx.session.user.id;

      if (!isOwner && !isAdmin((ctx.session.user as { role?: string }).role)) {
        const { TRPCError } = await import("@trpc/server");
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Non hai i permessi per modificare questo post.",
        });
      }

      await ctx.db
        .update(posts)
        .set({ name: input.name })
        .where(eq(posts.id, input.id));
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { eq } = await import("drizzle-orm");
      const targetPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!targetPost) {
        const { TRPCError } = await import("@trpc/server");
        throw new TRPCError({ code: "NOT_FOUND", message: "Post non trovato" });
      }

      const isAdmin = (role?: string | null) => role ? role.split(",").map((r) => r.trim()).includes("admin") : false;
      const isOwner = targetPost.createdById === ctx.session.user.id;

      if (!isOwner && !isAdmin((ctx.session.user as { role?: string }).role)) {
        const { TRPCError } = await import("@trpc/server");
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Non hai i permessi per eliminare questo post.",
        });
      }

      await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id));
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

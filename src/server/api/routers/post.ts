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
      const { eq, and } = await import("drizzle-orm");
      await ctx.db
        .update(posts)
        .set({ name: input.name })
        .where(
          and(
            eq(posts.id, input.id),
            eq(posts.createdById, ctx.session.user.id),
          ),
        );
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { eq, and } = await import("drizzle-orm");
      await ctx.db
        .delete(posts)
        .where(
          and(
            eq(posts.id, input.id),
            eq(posts.createdById, ctx.session.user.id),
          ),
        );
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});

import { z } from "zod";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
      const targetPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!targetPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post non trovato" });
      }

      const isOwner = targetPost.createdById === ctx.session.user.id;

      if (!isOwner && !ctx.isAdmin) {
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
      const targetPost = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
      });

      if (!targetPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post non trovato" });
      }

      const isOwner = targetPost.createdById === ctx.session.user.id;

      if (!isOwner && !ctx.isAdmin) {
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

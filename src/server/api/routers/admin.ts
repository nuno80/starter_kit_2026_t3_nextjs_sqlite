import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { role, user } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
  getUsers: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  getRoles: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.role.findMany({
      orderBy: (roles, { asc }) => [asc(roles.name)],
    });
  }),

  createRole: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Role name is required").toLowerCase(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(role)
        .values({
          name: input.name,
          description: input.description ?? "",
        })
        .onConflictDoNothing();
      return { success: true };
    }),

  deleteRole: adminProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.name === "admin" || input.name === "user") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete system default roles.",
        });
      }
      await ctx.db.delete(role).where(eq(role.name, input.name));
      return { success: true };
    }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id && input.newRole !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot demote your own admin account.",
        });
      }
      await ctx.db
        .update(user)
        .set({ role: input.newRole })
        .where(eq(user.id, input.userId));
      return { success: true };
    }),
});

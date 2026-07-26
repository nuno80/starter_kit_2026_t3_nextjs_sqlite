import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { user, role } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
  getRoles: adminProcedure.query(async ({ ctx }) => {
    const dbRoles = await ctx.db.query.role.findMany();
    if (dbRoles.length === 0) {
      return [
        { name: "admin", description: "Core system administrator role" },
        { name: "user", description: "Core system user role" },
      ];
    }
    return dbRoles;
  }),

  createRole: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(role)
        .values({
          name: input.name,
          description: input.description ?? null,
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
          message: "Cannot delete core system roles.",
        });
      }
      await ctx.db.delete(role).where(eq(role.name, input.name));
      return { success: true };
    }),

  assignRoleByEmail: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const targetUser = await ctx.db.query.user.findFirst({
        where: eq(user.email, input.email),
      });

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User with this email is not registered yet",
        });
      }

      const isAdmin = (r?: string | null) => r?.split(",").map(x => x.trim()).includes("admin") ?? false;
      if (targetUser.id === ctx.session.user.id && !isAdmin(input.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot demote your own admin account.",
        });
      }

      await ctx.db
        .update(user)
        .set({ role: input.role })
        .where(eq(user.id, targetUser.id));

      return { success: true };
    }),

  getUsers: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }),

  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const isAdmin = (r?: string | null) => r?.split(",").map(x => x.trim()).includes("admin") ?? false;
      if (input.userId === ctx.session.user.id && !isAdmin(input.newRole)) {
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

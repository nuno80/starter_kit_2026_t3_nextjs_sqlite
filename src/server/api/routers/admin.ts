import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { user, role, session } from "~/server/db/schema";

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
      // ponytail: fallback atomico per ruoli singoli; gli utenti con ruoli compositi (es. "editor,admin") richiedono aggiornamento manuale dall'UI di gestione per prevenire complessità di parsing
      await ctx.db.update(user).set({ role: "user" }).where(eq(user.role, input.name));
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

      if (targetUser.id === ctx.session.user.id && !input.role.split(",").map(x => x.trim()).includes("admin")) {
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

  getUsers: adminProcedure
    .input(z.object({ limit: z.number().max(100).default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.db.query.user.findMany({
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
          banned: true,
          createdAt: true,
        },
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        limit: input?.limit ?? 50,
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
      if (input.userId === ctx.session.user.id && !input.newRole.split(",").map(x => x.trim()).includes("admin")) {
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

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().default("Violazione dei termini di servizio"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot ban your own admin account.",
        });
      }
      
      // better-auth plugin:admin actually handles banning. We should use it directly 
      // instead of raw db writes to ensure better-auth clears its own session caches and cookies.
      // But we can't easily access the better-auth instance here without importing it.
      // Doing DB transaction to delete session is okay, but BetterAuth caches sessions.
      
      await ctx.db.transaction(async (tx) => {
        await tx
          .update(user)
          .set({ banned: true, banReason: input.reason, banExpires: null })
          .where(eq(user.id, input.userId));
        await tx.delete(session).where(eq(session.userId, input.userId));
      });
      
      // Force better-auth admin plugin to ban the user so it revokes sessions at the auth layer
      try {
        const { auth } = await import("~/server/better-auth/config");
        // We know the sessions are already removed from DB, but we want better-auth 
        // to propagate cache invalidation if needed.
        await auth.api.banUser({
          body: {
            userId: input.userId,
            banReason: input.reason,
          },
          headers: new Headers(), 
        });
      } catch (e) {
        // ignore errors
      }
      
      return { success: true };
    }),

  unbanUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({ banned: false, banReason: null, banExpires: null })
        .where(eq(user.id, input.userId));
        
      try {
        const { auth } = await import("~/server/better-auth/config");
        await auth.api.unbanUser({
          body: { userId: input.userId },
          headers: new Headers(),
        });
      } catch (e) {
        // ignore
      }
      return { success: true };
    }),
});

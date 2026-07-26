import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { user } from "~/server/db/schema";

export const adminRouter = createTRPCRouter({
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

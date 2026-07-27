import { test, expect } from "@playwright/test";

test.describe("Better-Auth Hardening & Email Verification Seams", () => {
  test("password validation rejects passwords shorter than 12 characters and verification link is logged in local dev", async () => {
    process.env.DATABASE_URL = "file:./test-auth-hardening.sqlite";
    process.env.BETTER_AUTH_SECRET = "mock-secret-key-for-testing-purposes-only-1234";
    delete process.env.RESEND_API_KEY;

    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");
    const schema = await import("~/server/db/schema");

    const testClient = createClient({ url: "file:./test-auth-hardening.sqlite" });
    await testClient.executeMultiple(`
      CREATE TABLE IF NOT EXISTS user (id text PRIMARY KEY, name text, email text NOT NULL UNIQUE, emailVerified integer, image text, role text, banned integer, banReason text, banExpires integer, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
      CREATE TABLE IF NOT EXISTS account (id text PRIMARY KEY, userId text NOT NULL REFERENCES user(id) ON DELETE CASCADE, accountId text NOT NULL, providerId text NOT NULL, accessToken text, refreshToken text, accessTokenExpiresAt integer, refreshTokenExpiresAt integer, scope text, idToken text, password text, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
      CREATE TABLE IF NOT EXISTS verification (id text PRIMARY KEY, identifier text NOT NULL, value text NOT NULL, expiresAt integer NOT NULL, createdAt integer, updatedAt integer);
    `);

    const { auth } = await import("~/server/better-auth/config");

    // 1. Check password length validation (< 12 chars rejected)
    const ctx = await auth.$context;
    const resShort = await auth.api.signUpEmail({
      body: {
        email: "test-short@example.com",
        password: "shortpass", // 9 chars -> should fail
        name: "Short Pass User",
      },
      asResponse: true,
    });
    expect(resShort.status).toBe(400);
    const shortData = await resShort.json();
    expect(JSON.stringify(shortData)).toContain("Password");

    // 2. Check valid password & verification email console log in dev
    const logs: string[] = [];
    const origLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" "));
      origLog(...args);
    };

    try {
      const resValid = await auth.api.signUpEmail({
        body: {
          email: "test-valid@example.com",
          password: "validpassword123!", // >= 12 chars -> should succeed
          name: "Valid Pass User",
        },
        asResponse: true,
      });
      expect(resValid.status).toBe(200);

      // Trigger verification email explicitly in test context if sendOnSignUp doesn't fire in direct API calls
      await auth.api.sendVerificationEmail({
        body: {
          email: "test-valid@example.com",
        },
      });

      const logOutput = logs.join("\n");
      expect(logOutput).toContain("=== URL DI VERIFICA EMAIL (DEV LOCALE) ===");
      expect(logOutput).toContain("test-valid@example.com");
      expect(logOutput).toContain("http://");
    } finally {
      console.log = origLog;
    }
  });
});

test.describe("Landing Page and Demo App Bridge Seams", () => {
  test("clicking 'Apri la Demo App' transitions to /posts and renders SQLite workspace", async ({ page }) => {
    await page.goto("/");
    await page.locator("section#quickstart").getByRole("link", { name: /Apri la Demo App/i }).click();
    await expect(page).toHaveURL(/\/posts$/);
    await expect(page.getByRole("heading", { name: /interactive crud workspace/i })).toBeVisible();
  });

  test("clicking language globe selector toggles copy between IT and EN without page reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /dalla clonazione alla produzione/i })).toBeVisible();

    const langBtn = page.getByRole("button", { name: /toggle language/i });
    await langBtn.click();
    await page.getByRole("button", { name: "English" }).click();

    await expect(page.getByRole("heading", { name: /from cloning to production/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /dalla clonazione alla produzione/i })).not.toBeVisible();
  });

  test("clicking 'Accedi' in navbar opens Better-Auth login overlay without navigating away", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-login-btn").click();

    await expect(page.getByTestId("auth-overlay")).toBeVisible();
    await expect(page.getByRole("heading", { name: /crea un account|bentornato/i })).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/");
  });
});

test.describe("Admin Dashboard & Guard Seams", () => {
  test("unauthenticated visitor accessing /admin-dashboard is redirected to /", async ({ page }) => {
    await page.goto("/admin-dashboard");
    await expect(page).toHaveURL("http://localhost:3000/");
  });

  test("tRPC adminProcedure rejects unauthenticated request with UNAUTHORIZED", async ({ request }) => {
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "mock-secret-key-for-testing-purposes-only-1234";
    const res = await request.get("http://localhost:3000/api/trpc/post.adminCheck");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(JSON.stringify(body)).toContain("UNAUTHORIZED");

    const usersRes = await request.get("http://localhost:3000/api/trpc/admin.getUsers");
    expect(usersRes.status()).toBe(401);

    const rolesRes = await request.get("http://localhost:3000/api/trpc/admin.getRoles");
    expect(rolesRes.status()).toBe(401);
  });

  test("tRPC role catalog procedures enforce admin rights and protect system roles", async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./db.sqlite";
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "mock-secret-key-for-testing-purposes-only-1234";
    process.env.BETTER_AUTH_GITHUB_CLIENT_ID = process.env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "mock";
    process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "mock";

    const { adminRouter } = await import("~/server/api/routers/admin");
    const { TRPCError } = await import("@trpc/server");

    let deletedRole: string | null = null;
    const mockCtx = {
      db: {
        query: {
          user: {
            findFirst: () => Promise.resolve({ role: "admin" }),
          },
        },
        delete: () => ({
          where: () => {
            deletedRole = "mock-deleted";
            return Promise.resolve();
          },
        }),
      } as any,
      session: {
        user: {
          id: "admin-user-id",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
        },
      } as any,
      headers: new Headers(),
    };

    const caller = adminRouter.createCaller(mockCtx);

    try {
      await caller.deleteRole({ name: "admin" });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
      expect(err.message).toBe("Cannot delete core system roles.");
    }

    try {
      await caller.deleteRole({ name: "user" });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
    }

    const res = await caller.deleteRole({ name: "custom-role" });
    expect(res.success).toBe(true);
    expect(deletedRole).toBe("mock-deleted");
  });

  test("assignRoleByEmail assigns role to existing user and throws NOT_FOUND for unregistered email", async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./db.sqlite";
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "mock-secret-key-for-testing-purposes-only-1234";
    process.env.BETTER_AUTH_GITHUB_CLIENT_ID = process.env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "mock";
    process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "mock";

    const { adminRouter } = await import("~/server/api/routers/admin");
    const { TRPCError } = await import("@trpc/server");

    let updatedRole: string | null = null;
    let updatedId: string | null = null;

    const mockCtx = {
      db: {
        query: {
          user: {
            findFirst: ({ where }: any) => {
              // Simulating Drizzle eq check behavior
              return Promise.resolve(where ? { id: "target-user-id", email: "existing@example.com", role: "user" } : undefined);
            },
          },
        },
        update: () => ({
          set: ({ role }: any) => ({
            where: () => {
              updatedRole = role;
              updatedId = "target-user-id";
              return Promise.resolve();
            },
          }),
        }),
      } as any,
      session: {
        user: {
          id: "admin-user-id",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
        },
      } as any,
      headers: new Headers(),
    };

    // Override findFirst for testing both found and not found branches
    const mockCtxNotFound = {
      ...mockCtx,
      db: {
        ...mockCtx.db,
        query: {
          user: {
            findFirst: () => Promise.resolve(undefined),
          },
        },
      },
    };

    const caller = adminRouter.createCaller(mockCtx);
    const callerNotFound = adminRouter.createCaller(mockCtxNotFound);

    const res = await caller.assignRoleByEmail({ email: "existing@example.com", role: "editor" });
    expect(res.success).toBe(true);
    expect(updatedRole).toBe("editor");
    expect(updatedId).toBe("target-user-id");

    try {
      await callerNotFound.assignRoleByEmail({ email: "missing@example.com", role: "editor" });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("User with this email is not registered yet");
    }
  });

  test("post update and delete mutations enforce owner or admin permissions", async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./db.sqlite";
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "mock-secret-key-for-testing-purposes-only-1234";
    process.env.BETTER_AUTH_GITHUB_CLIENT_ID = process.env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "mock";
    process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "mock";

    const { postRouter } = await import("~/server/api/routers/post");
    const { TRPCError } = await import("@trpc/server");

    let updatedName: string | null = null;
    let deletedId: number | null = null;

    const createMockCtx = (userId: string, role: string) => ({
      db: {
        query: {
          posts: {
            findFirst: ({ where }: any) => {
              return Promise.resolve({ id: 1, name: "Original Post", createdById: "owner-id" });
            },
          },
        },
        update: () => ({
          set: ({ name }: any) => ({
            where: () => {
              updatedName = name;
              return Promise.resolve();
            },
          }),
        }),
        delete: () => ({
          where: () => {
            deletedId = 1;
            return Promise.resolve();
          },
        }),
      } as any,
      session: {
        user: {
          id: userId,
          role,
        },
      } as any,
      headers: new Headers(),
    });

    const ownerCaller = postRouter.createCaller(createMockCtx("owner-id", "user"));
    const adminCaller = postRouter.createCaller(createMockCtx("admin-id", "admin"));
    const otherCaller = postRouter.createCaller(createMockCtx("other-id", "user"));

    // Owner can update
    await ownerCaller.update({ id: 1, name: "Updated by Owner" });
    expect(updatedName).toBe("Updated by Owner");

    // Admin can update someone else's post
    await adminCaller.update({ id: 1, name: "Updated by Admin" });
    expect(updatedName).toBe("Updated by Admin");

    // Other user cannot update
    try {
      await otherCaller.update({ id: 1, name: "Hacked" });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
    }

    // Other user cannot delete
    try {
      await otherCaller.delete({ id: 1 });
      expect(true).toBe(false);
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
    }

    // Admin can delete
    await adminCaller.delete({ id: 1 });
    expect(deletedId).toBe(1);
  });

  test("updateUserRole mutation rejects self-demotion when userId === session.user.id and newRole !== 'admin'", async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL ?? "file:./db.sqlite";
    process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? "mock-secret-key-for-testing-purposes-only-1234";
    process.env.BETTER_AUTH_GITHUB_CLIENT_ID = process.env.BETTER_AUTH_GITHUB_CLIENT_ID ?? "mock";
    process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET ?? "mock";

    const { adminRouter } = await import("~/server/api/routers/admin");
    const { TRPCError } = await import("@trpc/server");

    const mockCtx = {
      db: {
        query: {
          user: {
            findFirst: () => Promise.resolve({ role: "admin" }),
          },
        },
        update: () => ({
          set: () => ({
            where: () => Promise.resolve(),
          }),
        }),
      } as any,
      session: {
        user: {
          id: "admin-user-id",
          email: "admin@example.com",
          name: "Admin User",
          role: "admin",
          banned: false,
          banReason: null,
          banExpires: null,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        session: {
          id: "session-id",
          userId: "admin-user-id",
          token: "token",
          expiresAt: new Date(Date.now() + 86400000),
          createdAt: new Date(),
          updatedAt: new Date(),
          ipAddress: null,
          userAgent: null,
        },
      },
      headers: new Headers(),
    };

    const caller = adminRouter.createCaller(mockCtx);

    try {
      await caller.updateUserRole({
        userId: "admin-user-id",
        newRole: "user",
      });
      expect(true).toBe(false); // should not reach here
    } catch (err: any) {
      expect(err).toBeInstanceOf(TRPCError);
      expect(err.code).toBe("FORBIDDEN");
      expect(err.message).toBe("Cannot demote your own admin account.");
    }
  });

  test("deleting a user cascades to remove their sessions, accounts, and posts", async () => {
    process.env.DATABASE_URL = "file:./test-cascade.sqlite";
    process.env.BETTER_AUTH_SECRET = "mock-secret-key-for-testing-purposes-only-1234";
    process.env.BETTER_AUTH_GITHUB_CLIENT_ID = "mock";
    process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET = "mock";

    const { createClient } = await import("@libsql/client");
    const { drizzle } = await import("drizzle-orm/libsql");
    const { eq } = await import("drizzle-orm");
    const schema = await import("~/server/db/schema");

    const testClient = createClient({ url: "file:./test-cascade.sqlite" });
    await testClient.executeMultiple(`
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS user (id text PRIMARY KEY, name text, email text NOT NULL UNIQUE, emailVerified integer, image text, role text, banned integer, banReason text, banExpires integer, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
      CREATE TABLE IF NOT EXISTS account (id text PRIMARY KEY, userId text NOT NULL REFERENCES user(id) ON DELETE CASCADE, accountId text NOT NULL, providerId text NOT NULL, accessToken text, refreshToken text, accessTokenExpiresAt integer, refreshTokenExpiresAt integer, scope text, idToken text, password text, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
      CREATE TABLE IF NOT EXISTS session (id text PRIMARY KEY, userId text NOT NULL REFERENCES user(id) ON DELETE CASCADE, token text NOT NULL UNIQUE, expiresAt integer NOT NULL, ipAddress text, userAgent text, impersonatedBy text, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
      CREATE TABLE IF NOT EXISTS post (id integer PRIMARY KEY AUTOINCREMENT, name text, createdById text NOT NULL REFERENCES user(id) ON DELETE CASCADE, createdAt integer NOT NULL DEFAULT 0, updatedAt integer);
    `);
    const testDb = drizzle(testClient, { schema });

    await testClient.executeMultiple(`
      INSERT OR REPLACE INTO user (id, email) VALUES ('u1', 'u1@test.com');
      INSERT OR REPLACE INTO account (id, userId, accountId, providerId) VALUES ('a1', 'u1', 'acc1', 'prov1');
      INSERT OR REPLACE INTO session (id, userId, token, expiresAt) VALUES ('s1', 'u1', 'tok1', 9999999999);
      INSERT OR REPLACE INTO post (id, createdById) VALUES (100, 'u1');
    `);

    await testDb.delete(schema.user).where(eq(schema.user.id, "u1"));

    const accs = await testDb.select().from(schema.account).where(eq(schema.account.userId, "u1"));
    const sess = await testDb.select().from(schema.session).where(eq(schema.session.userId, "u1"));
    const psts = await testDb.select().from(schema.posts).where(eq(schema.posts.createdById, "u1"));

    expect(accs.length).toBe(0);
    expect(sess.length).toBe(0);
    expect(psts.length).toBe(0);
  });
});


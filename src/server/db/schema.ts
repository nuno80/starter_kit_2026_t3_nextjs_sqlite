import { relations, sql } from "drizzle-orm";
import { index, sqliteTable } from "drizzle-orm/sqlite-core";

/**
 * Multi-project schema prefix helper
 */

// Posts example table
export const posts = sqliteTable(
  "post",
  (d) => ({
    id: d.integer({ mode: "number" }).primaryKey({ autoIncrement: true }),
    name: d.text({ length: 256 }),
    createdById: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [
    index("created_by_idx").on(t.createdById),
    index("name_idx").on(t.name),
  ],
);

export const role = sqliteTable("role", (d) => ({
  name: d.text({ length: 255 }).primaryKey(),
  description: d.text({ length: 1024 }),
}));

export const user = sqliteTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull().unique(),
  emailVerified: d.integer({ mode: "boolean" }).default(false),
  image: d.text({ length: 255 }),
  role: d
    .text({ length: 255 })
    .default("user"),
  banned: d.integer({ mode: "boolean" }).default(false),
  banReason: d.text({ length: 1024 }),
  banExpires: d.integer({ mode: "timestamp" }),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
}));

export const userRelations = relations(user, ({ many, one }) => ({
  account: many(account),
  session: many(session),
  posts: many(posts),
  stripeCustomer: one(stripeCustomer, {
    fields: [user.id],
    references: [stripeCustomer.userId],
  }),
  payments: many(payment),
  subscriptions: many(subscription),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  createdBy: one(user, { fields: [posts.createdById], references: [user.id] }),
}));

export const account = sqliteTable(
  "account",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: d.text({ length: 255 }).notNull(),
    providerId: d.text({ length: 255 }).notNull(),
    accessToken: d.text(),
    refreshToken: d.text(),
    accessTokenExpiresAt: d.integer({ mode: "timestamp" }),
    refreshTokenExpiresAt: d.integer({ mode: "timestamp" }),
    scope: d.text({ length: 255 }),
    idToken: d.text(),
    password: d.text(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const session = sqliteTable(
  "session",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: d.text({ length: 255 }).notNull().unique(),
    expiresAt: d.integer({ mode: "timestamp" }).notNull(),
    ipAddress: d.text({ length: 255 }),
    userAgent: d.text({ length: 255 }),
    impersonatedBy: d.text({ length: 255 }),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

/**
 * Stripe integration tables
 *
 * - stripeCustomer: 1:1 mapping between our `user` and a Stripe Customer object.
 * - payment: records of one-time (mode: "payment") Checkout Sessions.
 * - subscription: records of recurring (mode: "subscription") Checkout Sessions, kept in
 *   sync via the /api/webhooks/stripe handler.
 */
export const stripeCustomer = sqliteTable("stripe_customer", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: d
    .text({ length: 255 })
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: d.text({ length: 255 }).notNull().unique(),
  createdAt: d
    .integer({ mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
}));

export const stripeCustomerRelations = relations(
  stripeCustomer,
  ({ one }) => ({
    user: one(user, {
      fields: [stripeCustomer.userId],
      references: [user.id],
    }),
  }),
);

export const payment = sqliteTable(
  "payment",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeCheckoutSessionId: d.text({ length: 255 }).notNull().unique(),
    stripePaymentIntentId: d.text({ length: 255 }),
    productKey: d.text({ length: 255 }).notNull(),
    amountTotal: d.integer(), // in minor units (e.g. cents)
    currency: d.text({ length: 10 }),
    // pending -> created, checkout not completed yet
    // paid -> payment succeeded (webhook: checkout.session.completed / payment_intent.succeeded)
    // failed -> payment failed (webhook: payment_intent.payment_failed)
    status: d.text({ length: 32 }).notNull().default("pending"),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("payment_user_id_idx").on(t.userId)],
);

export const paymentRelations = relations(payment, ({ one }) => ({
  user: one(user, { fields: [payment.userId], references: [user.id] }),
}));

export const subscription = sqliteTable(
  "subscription",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    stripeCustomerId: d.text({ length: 255 }).notNull(),
    stripeSubscriptionId: d.text({ length: 255 }).notNull().unique(),
    stripePriceId: d.text({ length: 255 }).notNull(),
    planKey: d.text({ length: 255 }).notNull(),
    // mirrors Stripe subscription.status: trialing | active | past_due | canceled |
    // incomplete | incomplete_expired | unpaid | paused
    status: d.text({ length: 32 }).notNull().default("incomplete"),
    currentPeriodEnd: d.integer({ mode: "timestamp" }),
    cancelAtPeriodEnd: d.integer({ mode: "boolean" }).default(false),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("subscription_user_id_idx").on(t.userId)],
);

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, { fields: [subscription.userId], references: [user.id] }),
}));

export const verification = sqliteTable(
  "verification",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    identifier: d.text({ length: 255 }).notNull(),
    value: d.text({ length: 255 }).notNull(),
    expiresAt: d.integer({ mode: "timestamp" }).notNull(),
    createdAt: d
      .integer({ mode: "timestamp" })
      .default(sql`(unixepoch())`)
      .notNull(),
    updatedAt: d.integer({ mode: "timestamp" }).$onUpdate(() => new Date()),
  }),
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

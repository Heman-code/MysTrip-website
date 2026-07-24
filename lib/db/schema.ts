import {
  pgTable, uuid, varchar, text, numeric, integer, timestamp,
  pgEnum, boolean, jsonb, index, date
} from "drizzle-orm/pg-core";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const userRoleEnum       = pgEnum("user_role",         ["user", "admin"]);
export const adminRoleEnum      = pgEnum("admin_role",        ["super_admin", "sundarone_admin"]);
export const tripSourceEnum     = pgEnum("trip_source",       ["mystrip", "sundarone"]);
export const tripCategoryEnum   = pgEnum("trip_category",     ["day_exploration", "parents_event", "trek", "weekend_escape", "post_midterm", "post_endterm"]);
export const tripStatusEnum     = pgEnum("trip_status",       ["draft", "open", "closed", "confirmed", "executed", "canceled", "postponed"]);
export const bookingStatusEnum  = pgEnum("booking_status",    ["pending_payment", "confirmed", "canceled", "refunded", "partial_refund", "chargeback"]);
export const paymentStatusEnum  = pgEnum("payment_status",    ["pending", "paid", "failed", "refunded"]);
export const refundTypeEnum     = pgEnum("refund_type",       ["trip_canceled", "exception", "postponement_optout", "chargeback"]);
export const refundStatusEnum   = pgEnum("refund_status",     ["pending", "approved", "rejected", "processed"]);
export const expenseTypeEnum    = pgEnum("expense_type",      ["trip_cost", "operational"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["transport", "accommodation", "food", "guide", "marketing", "salary", "freelancer", "software", "misc"]);
export const membershipTierEnum = pgEnum("membership_tier",   ["explorer", "adventurer", "summit"]);
export const billingPeriodEnum  = pgEnum("billing_period",    ["monthly", "annual"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "canceled", "expired"]);

// ─── ADMIN USERS ──────────────────────────────────────────────────────────────
// Separate from regular users. Hemant's team + Sundarone hostel owner login.

export const adminUsers = pgTable("admin_users", {
  id:           uuid("id").defaultRandom().primaryKey(),
  name:         varchar("name", { length: 255 }).notNull(),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role:         adminRoleEnum("role").default("super_admin"),
  lastLoginAt:  timestamp("last_login_at"),
  createdAt:    timestamp("created_at").defaultNow(),
});

// ─── USERS ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id:                   uuid("id").defaultRandom().primaryKey(),
  fullName:             varchar("full_name", { length: 255 }).notNull(),
  email:                varchar("email", { length: 255 }).notNull().unique(),
  phone:                varchar("phone", { length: 20 }),
  passwordHash:         varchar("password_hash", { length: 255 }),
  role:                 userRoleEnum("role").default("user"),
  college:              varchar("college", { length: 255 }),
  avatarUrl:            varchar("avatar_url", { length: 500 }),
  isSundaroneResident:  boolean("is_sundarone_resident").default(false),
  lastActiveAt:         timestamp("last_active_at"),
  createdAt:            timestamp("created_at").defaultNow(),
}, (t) => ({
  emailIdx: index("users_email_idx").on(t.email),
}));

// ─── PASSWORD RESET TOKENS ─────────────────────────────────────────────────────
// Only the SHA-256 hash of the token is stored — the raw token only ever exists
// in the emailed link, so a DB leak alone can't be used to reset accounts.

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id:        uuid("id").defaultRandom().primaryKey(),
  userId:    uuid("user_id").references(() => users.id).notNull(),
  tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt:    timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (t) => ({
  tokenIdx: index("prt_token_idx").on(t.tokenHash),
  userIdx:  index("prt_user_idx").on(t.userId),
}));

// ─── TRIPS ────────────────────────────────────────────────────────────────────

export const trips = pgTable("trips", {
  id:                uuid("id").defaultRandom().primaryKey(),
  slug:              varchar("slug", { length: 255 }).notNull().unique(),
  title:             varchar("title", { length: 255 }).notNull(),
  shortTitle:        varchar("short_title", { length: 100 }),
  destination:       varchar("destination", { length: 255 }).notNull(),
  state:             varchar("state", { length: 100 }),
  source:            tripSourceEnum("source").default("mystrip"),
  category:          tripCategoryEnum("category").default("day_exploration"),
  status:            tripStatusEnum("status").default("draft"),

  // Dates & timing
  tripDate:          date("trip_date").notNull(),         // start date
  returnDate:        date("return_date"),                  // end date (same as tripDate for day trips)
  departureTime:     varchar("departure_time", { length: 100 }),
  returnTime:        varchar("return_time", { length: 100 }),

  // Pricing
  basePrice:         numeric("base_price", { precision: 10, scale: 2 }).notNull(),

  // Slots
  maxSlots:          integer("max_slots").notNull(),
  minSlots:          integer("min_slots").default(10),    // trip cancels if confirmed < minSlots on trip day
  bookedSlots:       integer("booked_slots").default(0),

  // Content
  shortDescription:  varchar("short_description", { length: 500 }),
  description:       text("description"),
  highlights:        jsonb("highlights"),                  // string[]
  inclusions:        jsonb("inclusions"),                  // string[]
  exclusions:        jsonb("exclusions"),                  // string[]
  difficulty:        varchar("difficulty", { length: 50 }),

  // Multi-track itinerary (Jaipur exploration has 2 tracks)
  tracks:            jsonb("tracks"),    // [{ name, tagline, highlights[] }]

  // Media
  coverImage:        varchar("cover_image", { length: 500 }),
  gallery:           jsonb("gallery"),                     // string[] of image URLs
  itineraryPdfUrl:   varchar("itinerary_pdf_url", { length: 500 }), // stored path — never exposed directly

  // State flags
  registrationOpen:  boolean("registration_open").default(true),
  expenseEntered:    boolean("expense_entered").default(false), // flips true after team enters post-trip expenses
  cancellationReason: text("cancellation_reason"),

  // Metadata
  tag:               varchar("tag", { length: 50 }),
  tagColor:          varchar("tag_color", { length: 20 }),
  accentColor:       varchar("accent_color", { length: 20 }),

  createdAt:         timestamp("created_at").defaultNow(),
  updatedAt:         timestamp("updated_at").defaultNow(),
}, (t) => ({
  sourceIdx:  index("trips_source_idx").on(t.source),
  dateIdx:    index("trips_date_idx").on(t.tripDate),
  statusIdx:  index("trips_status_idx").on(t.status),
}));

// ─── REGISTRATIONS / BOOKINGS ─────────────────────────────────────────────────

export const registrations = pgTable("registrations", {
  id:              uuid("id").defaultRandom().primaryKey(),
  userId:          uuid("user_id").references(() => users.id).notNull(),
  tripId:          uuid("trip_id").references(() => trips.id).notNull(),

  // Booking state (richer than old simple status)
  bookingStatus:   bookingStatusEnum("booking_status").default("pending_payment"),

  // Amount actually charged (may differ from basePrice if membership discount applied)
  amount:          numeric("amount", { precision: 10, scale: 2 }).notNull(),
  discountApplied: boolean("discount_applied").default(false),
  discountAmount:  numeric("discount_amount", { precision: 10, scale: 2 }).default("0"),

  // Razorpay references
  razorpayOrderId:   varchar("razorpay_order_id", { length: 255 }),
  razorpayPaymentId: varchar("razorpay_payment_id", { length: 255 }),
  razorpaySignature: varchar("razorpay_signature", { length: 500 }),

  // Refund tracking
  refundAmount:    numeric("refund_amount", { precision: 10, scale: 2 }),

  // Participant info collected at booking
  emergencyContact: varchar("emergency_contact", { length: 255 }),
  emergencyPhone:   varchar("emergency_phone", { length: 20 }),
  medicalInfo:      text("medical_info"),
  selectedTrack:    varchar("selected_track", { length: 100 }), // for multi-track trips

  // In-app registration form (UPI + manual review flow)
  whatsappNumber:    varchar("whatsapp_number", { length: 20 }),
  guardianPhone:     varchar("guardian_phone", { length: 20 }),
  collegeRegNumber:  varchar("college_reg_number", { length: 100 }),
  paymentScreenshot: text("payment_screenshot"), // base64 data URL, verified manually by an admin
  referralCode:      varchar("referral_code", { length: 50 }),

  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
}, (t) => ({
  userIdx:   index("reg_user_idx").on(t.userId),
  tripIdx:   index("reg_trip_idx").on(t.tripId),
  statusIdx: index("reg_status_idx").on(t.bookingStatus),
}));

// ─── REFUNDS ─────────────────────────────────────────────────────────────────
// Full refund ledger. Every refund — automatic or manual exception — logged here.

export const refunds = pgTable("refunds", {
  id:               uuid("id").defaultRandom().primaryKey(),
  registrationId:   uuid("registration_id").references(() => registrations.id).notNull(),
  userId:           uuid("user_id").references(() => users.id).notNull(),
  tripId:           uuid("trip_id").references(() => trips.id).notNull(),

  amount:           numeric("amount", { precision: 10, scale: 2 }).notNull(),
  type:             refundTypeEnum("type").notNull(),           // why refund happened
  status:           refundStatusEnum("status").default("pending"),

  reason:           text("reason"),                            // admin note
  approvedBy:       uuid("approved_by").references(() => adminUsers.id),

  razorpayRefundId: varchar("razorpay_refund_id", { length: 255 }),

  requestedAt:      timestamp("requested_at").defaultNow(),
  approvedAt:       timestamp("approved_at"),
  processedAt:      timestamp("processed_at"),
}, (t) => ({
  registrationIdx: index("refund_reg_idx").on(t.registrationId),
  tripIdx:         index("refund_trip_idx").on(t.tripId),
  statusIdx:       index("refund_status_idx").on(t.status),
}));

// ─── EXPENSES ────────────────────────────────────────────────────────────────
// Two types:
// 1. trip_cost — entered manually by admin after each trip (transport, stay, food, guide)
// 2. operational — monthly expenses (marketing, salaries, freelancer fees)
// Operational expenses belong to MysTrip only, NOT Sundarone Tribe P&L.

export const expenses = pgTable("expenses", {
  id:          uuid("id").defaultRandom().primaryKey(),
  tripId:      uuid("trip_id").references(() => trips.id),  // null for operational expenses
  source:      tripSourceEnum("source").notNull(),           // mystrip | sundarone
  type:        expenseTypeEnum("type").notNull(),
  category:    expenseCategoryEnum("category").notNull(),
  amount:      numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  monthYear:   varchar("month_year", { length: 7 }),          // "2026-07" for monthly tally
  enteredBy:   uuid("entered_by").references(() => adminUsers.id),
  createdAt:   timestamp("created_at").defaultNow(),
}, (t) => ({
  tripIdx:   index("expense_trip_idx").on(t.tripId),
  sourceIdx: index("expense_source_idx").on(t.source),
  monthIdx:  index("expense_month_idx").on(t.monthYear),
}));

// ─── MEMBERSHIPS ─────────────────────────────────────────────────────────────

export const memberships = pgTable("memberships", {
  id:                   uuid("id").defaultRandom().primaryKey(),
  userId:               uuid("user_id").references(() => users.id).notNull().unique(),
  tier:                 membershipTierEnum("tier").notNull(),
  status:               membershipStatusEnum("status").default("active"),
  billingPeriod:        billingPeriodEnum("billing_period").notNull(),
  price:                numeric("price", { precision: 10, scale: 2 }).notNull(),
  discountPct:          integer("discount_pct").default(0),     // % off trip base price
  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 255 }),
  startedAt:            timestamp("started_at").defaultNow(),
  expiresAt:            timestamp("expires_at").notNull(),
  canceledAt:           timestamp("canceled_at"),
  createdAt:            timestamp("created_at").defaultNow(),
}, (t) => ({
  userIdx: index("membership_user_idx").on(t.userId),
}));

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
// Only users with a confirmed (executed) booking on that trip can post.

export const reviews = pgTable("reviews", {
  id:             uuid("id").defaultRandom().primaryKey(),
  userId:         uuid("user_id").references(() => users.id).notNull(),
  tripId:         uuid("trip_id").references(() => trips.id).notNull(),
  registrationId: uuid("registration_id").references(() => registrations.id).notNull(),
  rating:         integer("rating").notNull(),    // 1–5
  title:          varchar("title", { length: 255 }),
  body:           text("body").notNull(),
  isApproved:     boolean("is_approved").default(false),
  createdAt:      timestamp("created_at").defaultNow(),
}, (t) => ({
  tripIdx: index("reviews_trip_idx").on(t.tripId),
  userIdx: index("reviews_user_idx").on(t.userId),
}));

// ─── BLOG POSTS ──────────────────────────────────────────────────────────────

export const blogPosts = pgTable("blog_posts", {
  id:          uuid("id").defaultRandom().primaryKey(),
  slug:        varchar("slug", { length: 255 }).notNull().unique(),
  title:       varchar("title", { length: 500 }).notNull(),
  excerpt:     text("excerpt"),
  body:        text("body").notNull(),
  coverImage:  varchar("cover_image", { length: 500 }),
  authorId:    uuid("author_id").references(() => users.id),
  isPublished: boolean("is_published").default(false),
  publishedAt: timestamp("published_at"),
  tags:        jsonb("tags"),                     // string[]
  createdAt:   timestamp("created_at").defaultNow(),
}, (t) => ({
  slugIdx: index("blog_slug_idx").on(t.slug),
}));

// ─── INFERRED TYPES ──────────────────────────────────────────────────────────

export type AdminUser    = typeof adminUsers.$inferSelect;
export type User         = typeof users.$inferSelect;
export type Trip         = typeof trips.$inferSelect;
export type Registration = typeof registrations.$inferSelect;
export type Refund       = typeof refunds.$inferSelect;
export type Expense      = typeof expenses.$inferSelect;
export type Membership   = typeof memberships.$inferSelect;
export type Review       = typeof reviews.$inferSelect;
export type BlogPost     = typeof blogPosts.$inferSelect;

export type NewTrip         = typeof trips.$inferInsert;
export type NewRegistration = typeof registrations.$inferInsert;
export type NewRefund       = typeof refunds.$inferInsert;
export type NewExpense      = typeof expenses.$inferInsert;

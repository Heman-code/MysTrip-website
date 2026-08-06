import {
  pgTable, uuid, varchar, text, numeric, integer, timestamp,
  pgEnum, boolean, jsonb, index, uniqueIndex, date, type AnyPgColumn
} from "drizzle-orm/pg-core";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const userRoleEnum       = pgEnum("user_role",         ["user", "admin", "super_admin"]);
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
export const couponTypeEnum       = pgEnum("coupon_type",       ["welcome_new", "welcome_returning"]);
export const poiCategoryEnum      = pgEnum("poi_category",      ["fort", "palace", "temple", "market", "lake", "museum", "garden", "viewpoint", "food", "other"]);
export const poiSourceEnum        = pgEnum("poi_source",        ["google_places", "manual"]);
export const itineraryStatusEnum  = pgEnum("itinerary_status",  ["draft", "active", "completed"]);
export const stopStatusEnum       = pgEnum("stop_status",       ["pending", "visited", "skipped"]);
export const ambassadorTierEnum   = pgEnum("ambassador_tier",   ["micro", "mid", "anchor"]);
export const ambassadorStatusEnum = pgEnum("ambassador_status", ["active", "paused"]);
export const amountKindEnum       = pgEnum("amount_kind",       ["flat", "percentage"]); // shared by discount & commission
export const commissionBaseEnum   = pgEnum("commission_base",   ["pre_discount", "post_discount"]);
export const payoutStatusEnum     = pgEnum("payout_status",     ["pending", "paid"]);

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
  hasTraveledBefore:    boolean("has_traveled_before").default(false), // self-declared at signup, drives welcome coupon tier
  isAmbassador:         boolean("is_ambassador").default(false),
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

// ─── COUPONS ───────────────────────────────────────────────────────────────────
// One welcome coupon is auto-issued per user at signup (5%/₹500 cap for new
// travelers, 10%/₹1000 cap for self-declared returning ones). One-time use.

export const coupons = pgTable("coupons", {
  id:                   uuid("id").defaultRandom().primaryKey(),
  userId:               uuid("user_id").references(() => users.id).notNull(),
  code:                 varchar("code", { length: 30 }).notNull().unique(),
  type:                 couponTypeEnum("type").notNull(),
  discountPercent:      integer("discount_percent").notNull(),
  maxDiscountAmount:    numeric("max_discount_amount", { precision: 10, scale: 2 }).notNull(),
  isUsed:               boolean("is_used").default(false),
  usedAt:               timestamp("used_at"),
  usedOnRegistrationId: uuid("used_on_registration_id").references((): AnyPgColumn => registrations.id),
  createdAt:            timestamp("created_at").defaultNow(),
}, (t) => ({
  codeIdx: index("coupons_code_idx").on(t.code),
  userIdx: index("coupons_user_idx").on(t.userId),
}));

// ─── AMBASSADORS ──────────────────────────────────────────────────────────────
// Student creators promoting trips with a referral code. Added manually by the
// admin — no public self-registration. Discount/commission terms are set per
// ambassador and only ever apply to bookings made after they're set (past
// bookings/payouts snapshot their own amounts, see registrations/payouts below).

export const ambassadors = pgTable("ambassadors", {
  id:                 uuid("id").defaultRandom().primaryKey(),
  userId:             uuid("user_id").references(() => users.id).notNull().unique(),
  referralCode:       varchar("referral_code", { length: 50 }).notNull().unique(), // stored uppercase for case-insensitive uniqueness
  tier:               ambassadorTierEnum("tier").default("micro"),
  instagramHandle:    varchar("instagram_handle", { length: 255 }),
  upiId:              varchar("upi_id", { length: 255 }),
  status:             ambassadorStatusEnum("status").default("active"),

  discountType:       amountKindEnum("discount_type").notNull(),
  discountValue:      numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  discountMaxCap:     numeric("discount_max_cap", { precision: 10, scale: 2 }),

  commissionType:     amountKindEnum("commission_type").notNull(),
  commissionValue:    numeric("commission_value", { precision: 10, scale: 2 }).notNull(),
  commissionBase:     commissionBaseEnum("commission_base").default("post_discount"),

  notes:              text("notes"), // admin-only, e.g. negotiated terms
  createdBy:          text("created_by"), // admin identifier, audit trail
  createdAt:          timestamp("created_at").defaultNow(),
}, (t) => ({
  codeIdx: index("ambassador_code_idx").on(t.referralCode),
  userIdx: index("ambassador_user_idx").on(t.userId),
}));

// ─── REFERRAL CLICKS ───────────────────────────────────────────────────────────
// Click-volume visibility only — no PII stored here.

export const referralClicks = pgTable("referral_clicks", {
  id:           uuid("id").defaultRandom().primaryKey(),
  ambassadorId: uuid("ambassador_id").references(() => ambassadors.id).notNull(),
  tripSlug:     varchar("trip_slug", { length: 255 }),
  clickedAt:    timestamp("clicked_at").defaultNow(),
}, (t) => ({
  ambassadorIdx: index("referral_click_ambassador_idx").on(t.ambassadorId),
}));

// ─── REGISTRATIONS / BOOKINGS ─────────────────────────────────────────────────

export const registrations = pgTable("registrations", {
  id:              uuid("id").defaultRandom().primaryKey(),
  userId:          uuid("user_id").references(() => users.id).notNull(),
  tripId:          uuid("trip_id").references(() => trips.id).notNull(),

  // Booking state (richer than old simple status)
  bookingStatus:   bookingStatusEnum("booking_status").default("pending_payment"),

  // Amount actually charged (may differ from basePrice if a coupon was applied)
  amount:          numeric("amount", { precision: 10, scale: 2 }).notNull(),
  discountApplied: boolean("discount_applied").default(false),
  discountAmount:  numeric("discount_amount", { precision: 10, scale: 2 }).default("0"),
  couponId:        uuid("coupon_id").references(() => coupons.id),

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

  // Ambassador referral attribution. referralCode is the code string at time of
  // booking (not a live FK, stays accurate if the code is later changed); the
  // FK below is a stable internal pointer for resolving the payout at confirm
  // time. referralCommissionSnapshot is the commission ₹ computed from the
  // ambassador's terms as of THIS booking — an admin editing those terms later
  // must never change what an already-placed booking owes.
  referralCode:      varchar("referral_code", { length: 50 }),
  referredAmbassadorId: uuid("referred_ambassador_id").references(() => ambassadors.id),
  referralCommissionSnapshot: numeric("referral_commission_snapshot", { precision: 10, scale: 2 }),

  // GA4 client id captured at submission time, so the server-side "purchase"
  // event fired when an admin confirms payment can be attributed to the
  // same browser session as the rest of that user's funnel.
  gaClientId:      varchar("ga_client_id", { length: 100 }),

  createdAt:       timestamp("created_at").defaultNow(),
  updatedAt:       timestamp("updated_at").defaultNow(),
}, (t) => ({
  userIdx:   index("reg_user_idx").on(t.userId),
  tripIdx:   index("reg_trip_idx").on(t.tripId),
  statusIdx: index("reg_status_idx").on(t.bookingStatus),
}));

// ─── PAYOUTS ─────────────────────────────────────────────────────────────────
// Ambassador commission ledger. Created when an admin confirms a referred
// booking's payment (mirrors the GA4 "purchase" event timing below) — never at
// booking submission, so a rejected/fraudulent screenshot never owes a payout.
// registrationId is nullable because early/manual entries (WhatsApp-only trips)
// may not be tied to one exact registration row.

export const payouts = pgTable("payouts", {
  id:             uuid("id").defaultRandom().primaryKey(),
  ambassadorId:   uuid("ambassador_id").references(() => ambassadors.id).notNull(),
  registrationId: uuid("registration_id").references(() => registrations.id),
  amount:         numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status:         payoutStatusEnum("status").default("pending"),
  paidAt:         timestamp("paid_at"),
  createdAt:      timestamp("created_at").defaultNow(),
}, (t) => ({
  ambassadorIdx: index("payout_ambassador_idx").on(t.ambassadorId),
  statusIdx:     index("payout_status_idx").on(t.status),
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

// ─── POIS (AI Trip Planner — Jaipur pilot) ────────────────────────────────────
// citySlug is on the row from day one so a second city is additive, not a migration.

export const pois = pgTable("pois", {
  id:                      uuid("id").defaultRandom().primaryKey(),
  citySlug:                varchar("city_slug", { length: 100 }).notNull().default("jaipur"),
  slug:                    varchar("slug", { length: 255 }).notNull().unique(),
  name:                    varchar("name", { length: 255 }).notNull(),
  category:                poiCategoryEnum("category").default("other"),

  latitude:                numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude:               numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  address:                 varchar("address", { length: 500 }),
  googlePlaceId:           varchar("google_place_id", { length: 255 }).unique(),

  shortDescription:        varchar("short_description", { length: 280 }),   // 2-line pin/card popup text
  longDescription:         text("long_description"),                        // full detail page
  interestTags:            jsonb("interest_tags"),                          // string[]

  photos:                  jsonb("photos"),                                 // string[]
  coverImage:              varchar("cover_image", { length: 500 }),

  openingHours:            jsonb("opening_hours"),  // { mon: [{open,close}], tue: [...], ... }; [] = closed that day
  avgVisitDurationMinutes: integer("avg_visit_duration_minutes").notNull().default(60),
  entryFees:               jsonb("entry_fees"),  // { adult?, student?, child?, foreigner?, foreignerStudent? } INR, any field omitted = not applicable
  googleRating:            numeric("google_rating", { precision: 2, scale: 1 }),

  isActive:                boolean("is_active").default(true),
  source:                  poiSourceEnum("source").default("manual"),

  createdAt:               timestamp("created_at").defaultNow(),
  updatedAt:               timestamp("updated_at").defaultNow(),
}, (t) => ({
  citySlugIdx: index("poi_city_slug_idx").on(t.citySlug),
  slugIdx:     index("poi_slug_idx").on(t.slug),
}));

// ─── POI SPECIAL EVENTS ────────────────────────────────────────────────────────
// Fixed-time windows (e.g. an evening light-and-sound show) that the itinerary
// sequencing algorithm schedules a visit around. Separate table, not jsonb on
// pois, because a POI can have more than one and the algorithm queries these
// directly.

export const poiSpecialEvents = pgTable("poi_special_events", {
  id:          uuid("id").defaultRandom().primaryKey(),
  poiId:       uuid("poi_id").references(() => pois.id).notNull(),
  name:        varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  daysOfWeek:  jsonb("days_of_week"),                    // string[] | null — null = every day
  startTime:   varchar("start_time", { length: 5 }).notNull(),  // "HH:MM" 24h
  endTime:     varchar("end_time", { length: 5 }).notNull(),
  isMustSee:   boolean("is_must_see").default(true),
  createdAt:   timestamp("created_at").defaultNow(),
}, (t) => ({
  poiIdx: index("poi_special_event_poi_idx").on(t.poiId),
}));

// ─── ITINERARIES ───────────────────────────────────────────────────────────────
// One user's planned day in a city.

export const itineraries = pgTable("itineraries", {
  id:         uuid("id").defaultRandom().primaryKey(),
  userId:     uuid("user_id").references(() => users.id).notNull(),
  citySlug:   varchar("city_slug", { length: 100 }).notNull().default("jaipur"),
  planDate:   date("plan_date").notNull(),   // resolves day-of-week against openingHours/daysOfWeek
  startTime:  varchar("start_time", { length: 5 }),   // "HH:MM"
  startLat:   numeric("start_lat", { precision: 10, scale: 7 }),
  startLng:   numeric("start_lng", { precision: 10, scale: 7 }),
  startLabel: varchar("start_label", { length: 255 }),   // e.g. "Hotel near Hawa Mahal"
  status:     itineraryStatusEnum("status").default("draft"),
  createdAt:  timestamp("created_at").defaultNow(),
  updatedAt:  timestamp("updated_at").defaultNow(),
}, (t) => ({
  userIdx: index("itinerary_user_idx").on(t.userId),
  dateIdx: index("itinerary_date_idx").on(t.planDate),
}));

// ─── ITINERARY STOPS ────────────────────────────────────────────────────────────
// Doubles as the shortlist and, once sequenced, the computed visit order.

export const itineraryStops = pgTable("itinerary_stops", {
  id:                uuid("id").defaultRandom().primaryKey(),
  itineraryId:       uuid("itinerary_id").references(() => itineraries.id).notNull(),
  poiId:             uuid("poi_id").references(() => pois.id).notNull(),
  sequenceOrder:     integer("sequence_order").notNull().default(0),
  plannedArrival:    varchar("planned_arrival", { length: 5 }),    // "HH:MM", null until first sequenced
  plannedDeparture:  varchar("planned_departure", { length: 5 }),
  status:            stopStatusEnum("status").default("pending"),
  addedAt:           timestamp("added_at").defaultNow(),
  visitedAt:         timestamp("visited_at"),
}, (t) => ({
  itineraryIdx: index("stop_itinerary_idx").on(t.itineraryId),
  itineraryPoiIdx: uniqueIndex("stop_itinerary_poi_idx").on(t.itineraryId, t.poiId),
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
export type Coupon       = typeof coupons.$inferSelect;
export type Poi              = typeof pois.$inferSelect;
export type PoiSpecialEvent  = typeof poiSpecialEvents.$inferSelect;
export type Itinerary        = typeof itineraries.$inferSelect;
export type ItineraryStop    = typeof itineraryStops.$inferSelect;
export type Ambassador       = typeof ambassadors.$inferSelect;
export type ReferralClick    = typeof referralClicks.$inferSelect;
export type Payout           = typeof payouts.$inferSelect;

export type NewTrip         = typeof trips.$inferInsert;
export type NewRegistration = typeof registrations.$inferInsert;
export type NewRefund       = typeof refunds.$inferInsert;
export type NewExpense      = typeof expenses.$inferInsert;
export type NewPoi            = typeof pois.$inferInsert;
export type NewPoiSpecialEvent = typeof poiSpecialEvents.$inferInsert;
export type NewItinerary      = typeof itineraries.$inferInsert;
export type NewItineraryStop  = typeof itineraryStops.$inferInsert;
export type NewAmbassador     = typeof ambassadors.$inferInsert;
export type NewReferralClick  = typeof referralClicks.$inferInsert;
export type NewPayout         = typeof payouts.$inferInsert;

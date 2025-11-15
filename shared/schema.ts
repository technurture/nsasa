import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Extended for Nsasa platform
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Nsasa-specific fields
  matricNumber: varchar("matric_number").unique(),
  gender: varchar("gender"),
  location: varchar("location"), // OnCampus/OffCampus
  address: text("address"),
  phoneNumber: varchar("phone_number"),
  level: varchar("level"),
  occupation: varchar("occupation"),
  
  // User status and role
  role: varchar("role").default("student"), // student, admin, super_admin
  approvalStatus: varchar("approval_status").default("pending"), // pending, approved, rejected
  profileCompletion: integer("profile_completion").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: varchar("category").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  
  authorId: varchar("author_id").references(() => users.id).notNull(),
  
  published: boolean("published").default(false),
  featured: boolean("featured").default(false),
  
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  readTime: integer("read_time").default(5),
  
  imageUrl: varchar("image_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blog comments (forward declaration resolved)
export const blogComments: any = pgTable("blog_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  
  authorId: varchar("author_id").references(() => users.id).notNull(),
  blogPostId: varchar("blog_post_id").references(() => blogPosts.id).notNull(),
  parentCommentId: varchar("parent_comment_id").references((): any => blogComments.id),
  
  likes: integer("likes").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  
  date: timestamp("date").notNull(),
  time: varchar("time").notNull(),
  location: varchar("location").notNull(),
  
  type: varchar("type").notNull(), // workshop, seminar, conference, social, academic
  capacity: integer("capacity").notNull(),
  price: integer("price").default(0), // Price in cents, 0 for free
  
  organizerId: varchar("organizer_id").references(() => users.id).notNull(),
  
  tags: jsonb("tags").$type<string[]>().default([]),
  imageUrl: varchar("image_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event registrations
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  eventId: varchar("event_id").references(() => events.id).notNull(),
  
  status: varchar("status").default("registered"), // registered, attended, cancelled
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning resources
export const learningResources = pgTable("learning_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  
  type: varchar("type").notNull(), // pdf, video, image, document
  category: varchar("category").notNull(),
  
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name").notNull(),
  fileSize: varchar("file_size").notNull(),
  
  uploadedById: varchar("uploaded_by_id").references(() => users.id).notNull(),
  
  downloads: integer("downloads").default(0),
  rating: integer("rating").default(0), // Average rating * 10 (for precision)
  ratingCount: integer("rating_count").default(0),
  
  difficulty: varchar("difficulty").notNull(), // 100l, 200l, 300l, 400l
  tags: jsonb("tags").$type<string[]>().default([]),
  
  previewAvailable: boolean("preview_available").default(false),
  thumbnailUrl: varchar("thumbnail_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resource downloads tracking
export const resourceDownloads = pgTable("resource_downloads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceId: varchar("resource_id").references(() => learningResources.id).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Resource ratings
export const resourceRatings = pgTable("resource_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  resourceId: varchar("resource_id").references(() => learningResources.id).notNull(),
  
  rating: integer("rating").notNull(), // 1-5 stars
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Staff profiles
export const staffProfiles = pgTable("staff_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  title: varchar("title").notNull(),
  department: varchar("department").notNull(),
  specializations: jsonb("specializations").$type<string[]>().default([]),
  
  office: varchar("office"),
  bio: text("bio"),
  
  courses: jsonb("courses").$type<string[]>().default([]),
  publications: integer("publications").default(0),
  experience: varchar("experience"),
  education: jsonb("education").$type<string[]>().default([]),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Badges/Achievements
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  
  criteria: jsonb("criteria"), // JSON describing how to earn this badge
  
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  userId: varchar("user_id").references(() => users.id).notNull(),
  badgeId: varchar("badge_id").references(() => badges.id).notNull(),
  
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  category: varchar("category").notNull(),
  message: text("message").notNull(),
  
  status: varchar("status").default("new"), // new, read, responded, closed
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  status: varchar("status").default("active"), // active, unsubscribed
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  matricNumber: true,
  gender: true,
  location: true,
  address: true,
  phoneNumber: true,
  level: true,
  occupation: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  excerpt: true,
  content: true,
  category: true,
  tags: true,
  imageUrl: true,
});

export const insertBlogCommentSchema = createInsertSchema(blogComments).pick({
  content: true,
  parentCommentId: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  time: true,
  location: true,
  type: true,
  capacity: true,
  price: true,
  tags: true,
  imageUrl: true,
});

export const insertLearningResourceSchema = createInsertSchema(learningResources).pick({
  title: true,
  description: true,
  type: true,
  category: true,
  difficulty: true,
  tags: true,
});

export const insertStaffProfileSchema = createInsertSchema(staffProfiles).pick({
  title: true,
  department: true,
  specializations: true,
  office: true,
  bio: true,
  courses: true,
  publications: true,
  experience: true,
  education: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  category: true,
  message: true,
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type BlogComment = typeof blogComments.$inferSelect;
export type InsertBlogComment = z.infer<typeof insertBlogCommentSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;

export type LearningResource = typeof learningResources.$inferSelect;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;

export type ResourceDownload = typeof resourceDownloads.$inferSelect;
export type ResourceRating = typeof resourceRatings.$inferSelect;

export type StaffProfile = typeof staffProfiles.$inferSelect;
export type InsertStaffProfile = z.infer<typeof insertStaffProfileSchema>;

export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
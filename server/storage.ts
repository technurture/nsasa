import {
  users,
  blogPosts,
  blogComments,
  events,
  eventRegistrations,
  learningResources,
  resourceDownloads,
  resourceRatings,
  staffProfiles,
  badges,
  userBadges,
  contactSubmissions,
  newsletterSubscriptions,
  type User,
  type UpsertUser,
  type BlogPost,
  type InsertBlogPost,
  type BlogComment,
  type InsertBlogComment,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type LearningResource,
  type InsertLearningResource,
  type StaffProfile,
  type InsertStaffProfile,
  type ContactSubmission,
  type InsertContactSubmission,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, sql, count } from "drizzle-orm";
import { randomUUID } from "crypto";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these are mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Additional user operations
  getUserByMatricNumber(matricNumber: string): Promise<User | undefined>;
  getUsersByApprovalStatus(status: string): Promise<User[]>;
  updateUserApprovalStatus(id: string, status: string): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  completeUserProfile(id: string, profileData: Partial<User>): Promise<User>;

  // Blog operations
  createBlogPost(authorId: string, post: InsertBlogPost): Promise<BlogPost>;
  getBlogPosts(limit?: number, offset?: number): Promise<BlogPost[]>;
  getBlogPost(id: string): Promise<BlogPost | undefined>;
  updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: string): Promise<void>;
  getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]>;
  incrementBlogViews(id: string): Promise<void>;

  // Comment operations
  createBlogComment(authorId: string, blogPostId: string, comment: InsertBlogComment): Promise<BlogComment>;
  getBlogComments(blogPostId: string): Promise<BlogComment[]>;
  deleteComment(id: string): Promise<void>;

  // Event operations
  createEvent(organizerId: string, event: InsertEvent): Promise<Event>;
  getEvents(limit?: number, offset?: number): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  registerForEvent(userId: string, eventId: string): Promise<EventRegistration>;
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: string): Promise<EventRegistration[]>;

  // Learning resource operations
  createLearningResource(uploadedById: string, resource: InsertLearningResource & { fileUrl: string; fileName: string; fileSize: string }): Promise<LearningResource>;
  getLearningResources(limit?: number, offset?: number): Promise<LearningResource[]>;
  getLearningResource(id: string): Promise<LearningResource | undefined>;
  updateLearningResource(id: string, resource: Partial<LearningResource>): Promise<LearningResource>;
  deleteLearningResource(id: string): Promise<void>;
  recordResourceDownload(userId: string, resourceId: string): Promise<void>;
  rateResource(userId: string, resourceId: string, rating: number): Promise<void>;

  // Staff operations
  createStaffProfile(userId: string, profile: InsertStaffProfile): Promise<StaffProfile>;
  getStaffProfiles(): Promise<StaffProfile[]>;
  getStaffProfile(userId: string): Promise<StaffProfile | undefined>;
  updateStaffProfile(userId: string, profile: Partial<InsertStaffProfile>): Promise<StaffProfile>;

  // Contact operations
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(status?: string): Promise<ContactSubmission[]>;
  updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission>;

  // Newsletter operations
  subscribeNewsletter(email: string): Promise<void>;
  unsubscribeNewsletter(email: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these are mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Additional user operations
  async getUserByMatricNumber(matricNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.matricNumber, matricNumber));
    return user;
  }

  async getUsersByApprovalStatus(status: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.approvalStatus, status));
  }

  async updateUserApprovalStatus(id: string, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ approvalStatus: status, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async completeUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profileData,
        profileCompletion: this.calculateProfileCompletion(profileData),
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  private calculateProfileCompletion(user: Partial<User>): number {
    const fields = ['email', 'firstName', 'lastName', 'matricNumber', 'gender', 'location', 'address', 'phoneNumber', 'level'];
    const completedFields = fields.filter(field => user[field as keyof User]);
    return Math.round((completedFields.length / fields.length) * 100);
  }

  // Blog operations
  async createBlogPost(authorId: string, post: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values({ ...post, authorId, id: randomUUID() } as any)
      .returning();
    return blogPost;
  }

  async getBlogPosts(limit = 20, offset = 0): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.published, true))
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updatedPost] = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() } as any)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedPost;
  }

  async deleteBlogPost(id: string): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
    return await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.authorId, authorId))
      .orderBy(desc(blogPosts.createdAt));
  }

  async incrementBlogViews(id: string): Promise<void> {
    await db
      .update(blogPosts)
      .set({ views: sql`${blogPosts.views} + 1` })
      .where(eq(blogPosts.id, id));
  }

  // Comment operations
  async createBlogComment(authorId: string, blogPostId: string, comment: InsertBlogComment): Promise<BlogComment> {
    const [blogComment] = await db
      .insert(blogComments)
      .values({ ...comment, authorId, blogPostId, id: randomUUID() } as any)
      .returning() as any;
    return blogComment;
  }

  async getBlogComments(blogPostId: string): Promise<BlogComment[]> {
    return await db
      .select()
      .from(blogComments)
      .where(eq(blogComments.blogPostId, blogPostId))
      .orderBy(desc(blogComments.createdAt));
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(blogComments).where(eq(blogComments.id, id));
  }

  // Event operations
  async createEvent(organizerId: string, event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values({ ...event, organizerId, id: randomUUID() } as any)
      .returning();
    return newEvent;
  }

  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .orderBy(desc(events.date))
      .limit(limit)
      .offset(offset);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const updateData = { ...event, updatedAt: new Date() };
    // Remove any array fields that might cause type issues
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== undefined)
    );
    const [updatedEvent] = await db
      .update(events)
      .set(cleanUpdateData as any)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async registerForEvent(userId: string, eventId: string): Promise<EventRegistration> {
    const [registration] = await db
      .insert(eventRegistrations)
      .values({ userId, eventId })
      .returning();
    return registration;
  }

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, eventId));
  }

  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    return await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.userId, userId));
  }

  // Learning resource operations
  async createLearningResource(uploadedById: string, resource: InsertLearningResource & { fileUrl: string; fileName: string; fileSize: string }): Promise<LearningResource> {
    const [newResource] = await db
      .insert(learningResources)
      .values({ ...resource, uploadedById, id: randomUUID() } as any)
      .returning();
    return newResource;
  }

  async getLearningResources(limit = 20, offset = 0): Promise<LearningResource[]> {
    return await db
      .select()
      .from(learningResources)
      .orderBy(desc(learningResources.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getLearningResource(id: string): Promise<LearningResource | undefined> {
    const [resource] = await db.select().from(learningResources).where(eq(learningResources.id, id));
    return resource;
  }

  async updateLearningResource(id: string, resource: Partial<LearningResource>): Promise<LearningResource> {
    const [updatedResource] = await db
      .update(learningResources)
      .set({ ...resource, updatedAt: new Date() } as any)
      .where(eq(learningResources.id, id))
      .returning();
    return updatedResource;
  }

  async deleteLearningResource(id: string): Promise<void> {
    await db.delete(learningResources).where(eq(learningResources.id, id));
  }

  async recordResourceDownload(userId: string, resourceId: string): Promise<void> {
    // Record the download
    await db.insert(resourceDownloads).values({ userId, resourceId });

    // Increment download count
    await db
      .update(learningResources)
      .set({ downloads: sql`${learningResources.downloads} + 1` })
      .where(eq(learningResources.id, resourceId));
  }

  async rateResource(userId: string, resourceId: string, rating: number): Promise<void> {
    // Upsert rating
    await db
      .insert(resourceRatings)
      .values({ userId, resourceId, rating })
      .onConflictDoUpdate({
        target: [resourceRatings.userId, resourceRatings.resourceId],
        set: { rating, updatedAt: new Date() },
      });

    // Recalculate average rating
    const [avgResult] = await db
      .select({
        avgRating: sql<number>`AVG(${resourceRatings.rating})`,
        count: count(resourceRatings.rating)
      })
      .from(resourceRatings)
      .where(eq(resourceRatings.resourceId, resourceId));

    await db
      .update(learningResources)
      .set({
        rating: Math.round((avgResult.avgRating || 0) * 10), // Store as integer * 10 for precision
        ratingCount: avgResult.count
      })
      .where(eq(learningResources.id, resourceId));
  }

  // Staff operations
  async createStaffProfile(userId: string, profile: InsertStaffProfile): Promise<StaffProfile> {
    const [staffProfile] = await db
      .insert(staffProfiles)
      .values({ ...profile, userId, id: randomUUID() } as any)
      .returning();
    return staffProfile;
  }

  async getStaffProfiles(): Promise<StaffProfile[]> {
    return await db
      .select()
      .from(staffProfiles)
      .orderBy(staffProfiles.title);
  }

  async getStaffProfile(userId: string): Promise<StaffProfile | undefined> {
    const [profile] = await db
      .select()
      .from(staffProfiles)
      .where(eq(staffProfiles.userId, userId));
    return profile;
  }

  async updateStaffProfile(userId: string, profile: Partial<InsertStaffProfile>): Promise<StaffProfile> {
    const updateData = { ...profile, updatedAt: new Date() };
    // Remove any array fields that might cause type issues
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => value !== undefined)
    );
    const [updatedProfile] = await db
      .update(staffProfiles)
      .set(cleanUpdateData as any)
      .where(eq(staffProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contactSubmission] = await db
      .insert(contactSubmissions)
      .values(submission)
      .returning();
    return contactSubmission;
  }

  async getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
    const query = db.select().from(contactSubmissions);

    if (status) {
      return await query.where(eq(contactSubmissions.status, status)).orderBy(desc(contactSubmissions.createdAt));
    }

    return await query.orderBy(desc(contactSubmissions.createdAt));
  }

  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission> {
    const [submission] = await db
      .update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id))
      .returning();
    return submission;
  }

  // Newsletter operations
  async subscribeNewsletter(email: string): Promise<void> {
    await db
      .insert(newsletterSubscriptions)
      .values({ email })
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: { status: 'active' },
      });
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db
      .update(newsletterSubscriptions)
      .set({ status: 'unsubscribed' })
      .where(eq(newsletterSubscriptions.email, email));
  }
}

export const storage = new DatabaseStorage();
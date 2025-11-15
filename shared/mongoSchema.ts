import { z } from "zod";

// User schema for MongoDB
export const userSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  profileImageUrl: z.string().optional(),
  
  // Authentication fields
  passwordHash: z.string(),
  
  // Nsasa-specific fields
  matricNumber: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  location: z.enum(['OnCampus', 'OffCampus']).optional(),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  level: z.string().optional(),
  occupation: z.string().optional(),
  
  // User status and role
  role: z.enum(['student', 'admin', 'super_admin']).default('student'),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  profileCompletion: z.number().default(0),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Blog post schema
export const blogPostSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  
  authorId: z.string(),
  
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  
  likes: z.number().default(0),
  views: z.number().default(0),
  readTime: z.number().default(5),
  
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Base comment schema (without refinement) - used for creating insert schema
const baseCommentSchema = z.object({
  _id: z.string().optional(),
  content: z.string(),
  
  authorId: z.string(),
  
  // Resource identifiers - at least one must be provided
  blogPostId: z.string().optional(),  // For blog post comments
  eventId: z.string().optional(),     // For event comments
  resourceId: z.string().optional(),  // For learning resource comments
  
  parentCommentId: z.string().optional(),
  
  likes: z.number().default(0),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Comment schema - supports comments on blogs, events, and learning resources
// Apply refinement to ensure exactly one resource ID is provided
export const commentSchema = baseCommentSchema.refine(
  (data) => {
    // Count how many resource IDs are provided
    const resourceIds = [data.blogPostId, data.eventId, data.resourceId].filter(Boolean);
    return resourceIds.length === 1;
  },
  {
    message: "Exactly one resource ID (blogPostId, eventId, or resourceId) must be provided"
  }
);

// Event schema
export const eventSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  
  date: z.date(),
  time: z.string(),
  location: z.string(),
  
  type: z.enum(['workshop', 'seminar', 'conference', 'social', 'academic']),
  capacity: z.number(),
  price: z.number().default(0), // Price in cents, 0 for free
  
  organizerId: z.string(),
  
  tags: z.array(z.string()).default([]),
  imageUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Event registration schema
export const eventRegistrationSchema = z.object({
  _id: z.string().optional(),
  
  userId: z.string(),
  eventId: z.string(),
  
  status: z.enum(['registered', 'attended', 'cancelled']).default('registered'),
  
  createdAt: z.date().default(() => new Date()),
});

// Learning resource schema
export const learningResourceSchema = z.object({
  _id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  
  type: z.enum(['pdf', 'video', 'image', 'document']),
  category: z.string(),
  
  fileUrl: z.string(),
  fileName: z.string(),
  fileSize: z.string(),
  
  uploadedById: z.string(),
  
  downloads: z.number().default(0),
  rating: z.number().default(0), // Average rating * 10 (for precision)
  ratingCount: z.number().default(0),
  
  difficulty: z.enum(['100l', '200l', '300l', '400l']),
  tags: z.array(z.string()).default([]),
  
  previewAvailable: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  imageUrls: z.array(z.string()).optional().default([]),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Staff profile schema
export const staffProfileSchema = z.object({
  _id: z.string().optional(),
  
  userId: z.string(),
  
  title: z.string(),
  department: z.string(),
  specializations: z.array(z.string()).default([]),
  
  office: z.string().optional(),
  bio: z.string().optional(),
  
  courses: z.array(z.string()).default([]),
  publications: z.number().default(0),
  experience: z.string().optional(),
  education: z.array(z.string()).default([]),
  
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Contact submission schema
export const contactSubmissionSchema = z.object({
  _id: z.string().optional(),
  
  name: z.string(),
  email: z.string().email(),
  subject: z.string(),
  category: z.string(),
  message: z.string(),
  
  status: z.enum(['new', 'read', 'responded', 'closed']).default('new'),
  
  createdAt: z.date().default(() => new Date()),
});

// Newsletter subscription schema
export const newsletterSubscriptionSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  status: z.enum(['active', 'unsubscribed']).default('active'),
  createdAt: z.date().default(() => new Date()),
});

// Insert schemas (for validation)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertBlogPostSchema = blogPostSchema.omit({ _id: true, createdAt: true, updatedAt: true, authorId: true });
export const insertCommentSchema = baseCommentSchema.omit({ _id: true, createdAt: true, updatedAt: true, authorId: true, blogPostId: true });
export const insertEventSchema = eventSchema.omit({ _id: true, createdAt: true, updatedAt: true, organizerId: true });
export const insertLearningResourceSchema = learningResourceSchema.omit({ _id: true, createdAt: true, updatedAt: true, uploadedById: true });
export const insertStaffProfileSchema = staffProfileSchema.omit({ _id: true, createdAt: true, updatedAt: true, userId: true });
export const insertContactSubmissionSchema = contactSubmissionSchema.omit({ _id: true, createdAt: true });

// Type exports
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = Omit<InsertUser, 'passwordHash'> & { password: string };

export type BlogPost = z.infer<typeof blogPostSchema>;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type Comment = z.infer<typeof commentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventRegistration = z.infer<typeof eventRegistrationSchema>;

export type LearningResource = z.infer<typeof learningResourceSchema>;
export type InsertLearningResource = z.infer<typeof insertLearningResourceSchema>;

export type StaffProfile = z.infer<typeof staffProfileSchema>;
export type InsertStaffProfile = z.infer<typeof insertStaffProfileSchema>;

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;

export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>;
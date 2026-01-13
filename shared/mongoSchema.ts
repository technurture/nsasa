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
  guardianPhoneNumber: z.string().optional(),
  level: z.string().optional(),
  occupation: z.string().optional(),

  // User status and role
  role: z.enum(['student', 'admin', 'super_admin', 'alumnus']).default('student'),
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

  approvalStatus: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  rejectionReason: z.string().optional(),

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
  videoUrl: z.string().optional(), // Video URL for event recordings

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

// Staff profile schema (base without refinement for omit)
export const staffProfileBaseSchema = z.object({
  _id: z.string().optional(),

  // Either userId (existing user) OR customName (custom profile) must be provided
  userId: z.string().optional(),
  customName: z.string().optional(), // For staff members not in the user system

  title: z.string(),
  department: z.string(),
  specializations: z.array(z.string()).default([]),

  office: z.string().optional(),
  bio: z.string().optional(),

  courses: z.array(z.string()).default([]),
  publications: z.number().default(0),
  experience: z.string().optional(),
  education: z.array(z.string()).default([]),

  // Additional fields for custom profiles
  phone: z.string().optional(),
  avatar: z.string().optional(),

  // Landing page display
  showOnLanding: z.boolean().default(false),
  position: z.string().optional(), // e.g., "President", "V.President", "Financial Secretary"
  displayOrder: z.number().default(999), // Lower numbers appear first

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Add refinement for validation
export const staffProfileSchema = staffProfileBaseSchema.refine(
  (data) => data.userId || data.customName,
  { message: "Either userId or customName must be provided" }
);

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

// Poll option schema
export const pollOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  votes: z.number().default(0),
});

// Poll schema
export const pollSchema = z.object({
  _id: z.string().optional(),
  question: z.string().min(1, "Poll question is required"),
  options: z.array(pollOptionSchema).min(2, "At least 2 options are required"),

  createdById: z.string(),

  allowMultipleVotes: z.boolean().default(false),
  expiresAt: z.date().optional(),

  // Target specific levels (e.g., ["100", "200", "300", "400"]) - empty array means all levels
  targetLevels: z.array(z.string()).default([]),

  status: z.enum(['active', 'closed']).default('active'),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Poll vote schema - tracks who voted for which options
export const pollVoteSchema = z.object({
  _id: z.string().optional(),
  pollId: z.string(),
  userId: z.string(),
  optionId: z.string(),

  createdAt: z.date().default(() => new Date()),
});

// Insert schemas (for validation)
export const insertUserSchema = userSchema.omit({ _id: true, createdAt: true, updatedAt: true });
export const insertBlogPostSchema = blogPostSchema.omit({ _id: true, createdAt: true, updatedAt: true, authorId: true });
export const insertCommentSchema = baseCommentSchema.omit({ _id: true, createdAt: true, updatedAt: true, authorId: true, blogPostId: true });
export const insertEventSchema = eventSchema.omit({ _id: true, createdAt: true, updatedAt: true, organizerId: true });
export const insertLearningResourceSchema = learningResourceSchema.omit({ _id: true, createdAt: true, updatedAt: true, uploadedById: true });
// Use base schema for omit, then add refinement
export const insertStaffProfileSchema = staffProfileBaseSchema
  .omit({ _id: true, createdAt: true, updatedAt: true })
  .refine(
    (data) => data.userId || data.customName,
    { message: "Either userId or customName must be provided" }
  );
export const insertContactSubmissionSchema = contactSubmissionSchema.omit({ _id: true, createdAt: true });
export const insertPollSchema = pollSchema.omit({ _id: true, createdAt: true, updatedAt: true, createdById: true, status: true });
export const insertPollVoteSchema = pollVoteSchema.omit({ _id: true, createdAt: true });

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

export type Poll = z.infer<typeof pollSchema>;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollOption = z.infer<typeof pollOptionSchema>;

export type PollVote = z.infer<typeof pollVoteSchema>;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;
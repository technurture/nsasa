import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection, COLLECTIONS } from './mongoDb';
import {
  User,
  InsertUser,
  RegisterUser,
  BlogPost,
  InsertBlogPost,
  Comment,
  InsertComment,
  Event,
  InsertEvent,
  EventRegistration,
  LearningResource,
  InsertLearningResource,
  StaffProfile,
  InsertStaffProfile,
  ContactSubmission,
  InsertContactSubmission,
} from '@shared/mongoSchema';

// Interface for MongoDB storage operations
export interface IMongoStorage {
  // Auth operations
  registerUser(userData: RegisterUser): Promise<User>;
  loginUser(email: string, password: string): Promise<{ user: User; token: string }>;
  authenticateToken(token: string): Promise<User | null>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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
  createBlogComment(authorId: string, blogPostId: string, comment: InsertComment): Promise<Comment>;
  getBlogComments(blogPostId: string): Promise<Comment[]>;
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
  
  // Analytics operations
  getAnalyticsOverview(): Promise<any>;
  getRecentActivity(): Promise<any[]>;
  getTopBlogs(): Promise<any[]>;
  
  // Gamification operations
  getUserGamificationStats(userId: string): Promise<any>;
  getLeaderboard(): Promise<any[]>;
  getUserBadges(userId: string): Promise<any[]>;
  
  // Like operations
  likeBlogPost(userId: string, blogPostId: string): Promise<void>;
  unlikeBlogPost(userId: string, blogPostId: string): Promise<void>;
  getBlogLikesCount(blogPostId: string): Promise<number>;
  isPostLikedByUser(userId: string, blogPostId: string): Promise<boolean>;
  likeComment(userId: string, commentId: string): Promise<void>;
  unlikeComment(userId: string, commentId: string): Promise<void>;
  getCommentLikesCount(commentId: string): Promise<number>;
  isCommentLikedByUser(userId: string, commentId: string): Promise<boolean>;
}

export class MongoStorage implements IMongoStorage {
  private jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  
  // Auth operations
  async registerUser(userData: RegisterUser): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    // Validate matric number contains 'soc'
    if (userData.matricNumber && !userData.matricNumber.toLowerCase().includes('soc')) {
      throw new Error('Matric number must contain "soc"');
    }
    
    // Check if email or matric number already exists
    const existingUser = await usersCollection.findOne({
      $or: [
        { email: userData.email },
        ...(userData.matricNumber ? [{ matricNumber: userData.matricNumber }] : [])
      ]
    });
    
    if (existingUser) {
      throw new Error('User with this email or matric number already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);
    
    // Create user document
    const userDoc: Omit<User, '_id'> = {
      ...userData,
      passwordHash,
      profileCompletion: this.calculateProfileCompletion(userData),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await usersCollection.insertOne(userDoc as any);
    const newUser = await usersCollection.findOne({ _id: result.insertedId });
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    return { ...newUser, _id: newUser._id.toString() };
  }
  
  async loginUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    if (user.approvalStatus !== 'approved') {
      throw new Error('Account is pending approval');
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      this.jwtSecret,
      { expiresIn: '7d' }
    );
    
    return {
      user: { ...user, _id: user._id.toString() },
      token
    };
  }
  
  async authenticateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = await this.getUser(decoded.userId);
      return user || null;
    } catch (error) {
      return null;
    }
  }
  
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    return user ? { ...user, _id: user._id.toString() } : undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ email });
    return user ? { ...user, _id: user._id.toString() } : undefined;
  }
  
  async getUserByMatricNumber(matricNumber: string): Promise<User | undefined> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ matricNumber });
    return user ? { ...user, _id: user._id.toString() } : undefined;
  }
  
  async getUsersByApprovalStatus(status: string): Promise<User[]> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const users = await usersCollection.find({ approvalStatus: status as any }).toArray();
    return users.map(user => ({ ...user, _id: user._id.toString() }));
  }
  
  async updateUserApprovalStatus(id: string, status: string): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { approvalStatus: status as any, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('User not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  async updateUserRole(id: string, role: string): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { role: role as any, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('User not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  async completeUserProfile(id: string, profileData: Partial<User>): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const updateData = {
      ...profileData,
      profileCompletion: this.calculateProfileCompletion(profileData),
      updatedAt: new Date()
    };
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('User not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  private calculateProfileCompletion(user: Partial<User>): number {
    const fields = ['email', 'firstName', 'lastName', 'matricNumber', 'gender', 'location', 'address', 'phoneNumber', 'level'];
    const completedFields = fields.filter(field => user[field as keyof User]);
    return Math.round((completedFields.length / fields.length) * 100);
  }
  
  // Blog operations
  async createBlogPost(authorId: string, post: InsertBlogPost): Promise<BlogPost> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const blogPostDoc: Omit<BlogPost, '_id'> = {
      ...post,
      authorId,
      likes: post.likes ?? 0,
      views: post.views ?? 0,
      readTime: post.readTime ?? 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await blogPostsCollection.insertOne(blogPostDoc as any);
    const newPost = await blogPostsCollection.findOne({ _id: result.insertedId });
    
    if (!newPost) {
      throw new Error('Failed to create blog post');
    }
    
    return { ...newPost, _id: newPost._id.toString() };
  }
  
  async getBlogPosts(limit = 20, offset = 0): Promise<BlogPost[]> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const posts = await blogPostsCollection.aggregate([
      { $match: { published: true } },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: COLLECTIONS.COMMENTS,
          let: { blogId: { $toString: "$_id" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$blogPostId", "$$blogId"] } } },
            { $count: "count" }
          ],
          as: "commentsCount"
        }
      },
      {
        $addFields: {
          commentCount: { $ifNull: [{ $arrayElemAt: ["$commentsCount.count", 0] }, 0] }
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          let: { 
            authorId: { 
              $convert: { 
                input: "$authorId", 
                to: "objectId",
                onError: null,
                onNull: null
              } 
            } 
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } }
          ],
          as: "authorData"
        }
      },
      {
        $unwind: {
          path: "$authorData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: { $toString: "$_id" },
          authorId: 1,
          title: 1,
          content: 1,
          excerpt: 1,
          category: 1,
          tags: 1,
          imageUrl: 1,
          imageUrls: 1,
          featuredImageUrl: 1,
          published: 1,
          likes: 1,
          views: 1,
          readTime: 1,
          createdAt: 1,
          updatedAt: 1,
          commentCount: 1,
          authorName: {
            $cond: {
              if: "$authorData",
              then: { $concat: ["$authorData.firstName", " ", "$authorData.lastName"] },
              else: "Unknown Author"
            }
          },
          authorAvatar: "$authorData.profileImageUrl"
        }
      }
    ]).toArray();
    
    return posts as BlogPost[];
  }
  
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    
    const post = await blogPostsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!post) return undefined;
    
    const author = await usersCollection.findOne({ _id: new ObjectId(post.authorId) });
    const commentCount = await commentsCollection.countDocuments({ blogPostId: id });
    
    return {
      ...post,
      _id: post._id.toString(),
      authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown Author',
      authorAvatar: author?.profileImageUrl,
      commentCount
    } as any;
  }
  
  async updateBlogPost(id: string, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const result = await blogPostsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...post, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Blog post not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  async deleteBlogPost(id: string): Promise<void> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    await blogPostsCollection.deleteOne({ _id: new ObjectId(id) });
  }
  
  async getBlogPostsByAuthor(authorId: string): Promise<BlogPost[]> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const posts = await blogPostsCollection
      .find({ authorId })
      .sort({ createdAt: -1 })
      .toArray();
    
    const author = await usersCollection.findOne({ _id: new ObjectId(authorId) });
    
    return posts.map(post => ({
      ...post,
      _id: post._id.toString(),
      authorName: author ? `${author.firstName} ${author.lastName}` : 'Unknown Author',
      authorAvatar: author?.profileImageUrl
    })) as BlogPost[];
  }
  
  async incrementBlogViews(id: string): Promise<void> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    await blogPostsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );
  }
  
  // Comment operations
  async createBlogComment(authorId: string, blogPostId: string, comment: InsertComment): Promise<Comment> {
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    
    const commentDoc: Omit<Comment, '_id'> = {
      ...comment,
      authorId,
      blogPostId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await commentsCollection.insertOne(commentDoc as any);
    const newComment = await commentsCollection.findOne({ _id: result.insertedId });
    
    if (!newComment) {
      throw new Error('Failed to create comment');
    }
    
    return { ...newComment, _id: newComment._id.toString() };
  }
  
  async getBlogComments(blogPostId: string): Promise<Comment[]> {
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    
    const comments = await commentsCollection.aggregate([
      { $match: { blogPostId } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: COLLECTIONS.USERS,
          let: { 
            authorId: { 
              $convert: { 
                input: "$authorId", 
                to: "objectId",
                onError: null,
                onNull: null
              } 
            } 
          },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$authorId"] } } }
          ],
          as: "authorData"
        }
      },
      {
        $unwind: {
          path: "$authorData",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          author: {
            name: {
              $cond: {
                if: "$authorData",
                then: { $concat: ["$authorData.firstName", " ", "$authorData.lastName"] },
                else: "Unknown Author"
              }
            },
            avatar: {
              $cond: {
                if: "$authorData.profileImageUrl",
                then: "$authorData.profileImageUrl",
                else: { $concat: ["https://api.dicebear.com/7.x/avataaars/svg?seed=", "$authorId"] }
              }
            },
            level: {
              $cond: {
                if: "$authorData.level",
                then: "$authorData.level",
                else: "Student"
              }
            }
          }
        }
      },
      {
        $project: {
          id: { $toString: "$_id" },
          _id: { $toString: "$_id" },
          authorId: 1,
          blogPostId: 1,
          parentCommentId: {
            $cond: {
              if: "$parentCommentId",
              then: { $toString: "$parentCommentId" },
              else: null
            }
          },
          content: 1,
          likes: 1,
          createdAt: 1,
          updatedAt: 1,
          author: 1,
          timestamp: {
            $cond: {
              if: { $eq: [{ $type: "$createdAt" }, "date"] },
              then: { $dateToString: { date: "$createdAt", format: "%Y-%m-%dT%H:%M:%S.%LZ" } },
              else: "$createdAt"
            }
          }
        }
      }
    ]).toArray();
    
    // Organize comments into nested structure
    const allComments = comments as any[];
    
    // Separate top-level comments (no parentCommentId) from replies
    const topLevelComments = allComments.filter(c => !c.parentCommentId);
    const repliesMap = new Map<string, any[]>();
    
    // Group replies by parent comment ID
    allComments.filter(c => c.parentCommentId).forEach(reply => {
      if (!repliesMap.has(reply.parentCommentId)) {
        repliesMap.set(reply.parentCommentId, []);
      }
      repliesMap.get(reply.parentCommentId)!.push(reply);
    });
    
    // Recursively attach replies to their parents
    const attachReplies = (comment: any): any => {
      const replies = repliesMap.get(comment.id) || repliesMap.get(comment._id) || [];
      return {
        ...comment,
        replies: replies.map(attachReplies)
      };
    };
    
    // Attach replies to top-level comments
    const commentsWithReplies = topLevelComments.map(attachReplies);
    
    return commentsWithReplies as Comment[];
  }
  
  async deleteComment(id: string): Promise<void> {
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    await commentsCollection.deleteOne({ _id: new ObjectId(id) });
  }
  
  // Event operations
  async createEvent(organizerId: string, event: InsertEvent): Promise<Event> {
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    
    const eventDoc: Omit<Event, '_id'> = {
      ...event,
      organizerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await eventsCollection.insertOne(eventDoc as any);
    const newEvent = await eventsCollection.findOne({ _id: result.insertedId });
    
    if (!newEvent) {
      throw new Error('Failed to create event');
    }
    
    return { ...newEvent, _id: newEvent._id.toString() };
  }
  
  async getEvents(limit = 20, offset = 0): Promise<Event[]> {
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const events = await eventsCollection
      .find({})
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    const eventsWithOrganizerInfo = await Promise.all(
      events.map(async (event) => {
        const organizer = await usersCollection.findOne({ _id: new ObjectId(event.organizerId) });
        return {
          ...event,
          _id: event._id.toString(),
          organizerName: organizer ? `${organizer.firstName} ${organizer.lastName}` : 'Unknown Organizer',
          organizerAvatar: organizer?.profileImageUrl
        } as any;
      })
    );
    
    return eventsWithOrganizerInfo as Event[];
  }
  
  async getEvent(id: string): Promise<Event | undefined> {
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    const event = await eventsCollection.findOne({ _id: new ObjectId(id) });
    return event ? { ...event, _id: event._id.toString() } : undefined;
  }
  
  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    
    const result = await eventsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...event, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Event not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  async deleteEvent(id: string): Promise<void> {
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    await eventsCollection.deleteOne({ _id: new ObjectId(id) });
  }
  
  async registerForEvent(userId: string, eventId: string): Promise<EventRegistration> {
    const registrationsCollection = await getCollection<EventRegistration>(COLLECTIONS.EVENT_REGISTRATIONS);
    
    const registrationDoc: Omit<EventRegistration, '_id'> = {
      userId,
      eventId,
      status: 'registered',
      createdAt: new Date(),
    };
    
    const result = await registrationsCollection.insertOne(registrationDoc as any);
    const newRegistration = await registrationsCollection.findOne({ _id: result.insertedId });
    
    if (!newRegistration) {
      throw new Error('Failed to register for event');
    }
    
    return { ...newRegistration, _id: newRegistration._id.toString() };
  }
  
  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    const registrationsCollection = await getCollection<EventRegistration>(COLLECTIONS.EVENT_REGISTRATIONS);
    const registrations = await registrationsCollection.find({ eventId }).toArray();
    return registrations.map(reg => ({ ...reg, _id: reg._id.toString() }));
  }
  
  async getUserEventRegistrations(userId: string): Promise<EventRegistration[]> {
    const registrationsCollection = await getCollection<EventRegistration>(COLLECTIONS.EVENT_REGISTRATIONS);
    const registrations = await registrationsCollection.find({ userId }).toArray();
    return registrations.map(reg => ({ ...reg, _id: reg._id.toString() }));
  }
  
  // Learning resource operations
  async createLearningResource(uploadedById: string, resource: InsertLearningResource & { fileUrl: string; fileName: string; fileSize: string }): Promise<LearningResource> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    
    const resourceDoc: Omit<LearningResource, '_id'> = {
      ...resource,
      uploadedById,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await resourcesCollection.insertOne(resourceDoc as any);
    const newResource = await resourcesCollection.findOne({ _id: result.insertedId });
    
    if (!newResource) {
      throw new Error('Failed to create learning resource');
    }
    
    return { ...newResource, _id: newResource._id.toString() };
  }
  
  async getLearningResources(limit = 20, offset = 0): Promise<LearningResource[]> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const resources = await resourcesCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    const resourcesWithUploaderInfo = await Promise.all(
      resources.map(async (resource) => {
        const uploader = await usersCollection.findOne({ _id: new ObjectId(resource.uploadedById) });
        return {
          ...resource,
          _id: resource._id.toString(),
          uploaderName: uploader ? `${uploader.firstName} ${uploader.lastName}` : 'Unknown Uploader',
          uploaderAvatar: uploader?.profileImageUrl
        } as any;
      })
    );
    
    return resourcesWithUploaderInfo as LearningResource[];
  }
  
  async getLearningResource(id: string): Promise<LearningResource | undefined> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    const resource = await resourcesCollection.findOne({ _id: new ObjectId(id) });
    return resource ? { ...resource, _id: resource._id.toString() } : undefined;
  }
  
  async updateLearningResource(id: string, resource: Partial<LearningResource>): Promise<LearningResource> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    
    const result = await resourcesCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...resource, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Learning resource not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  async deleteLearningResource(id: string): Promise<void> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    await resourcesCollection.deleteOne({ _id: new ObjectId(id) });
  }
  
  async recordResourceDownload(userId: string, resourceId: string): Promise<void> {
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    await resourcesCollection.updateOne(
      { _id: new ObjectId(resourceId) },
      { $inc: { downloads: 1 } }
    );
  }
  
  // Staff operations
  async createStaffProfile(userId: string, profile: InsertStaffProfile): Promise<StaffProfile> {
    const staffCollection = await getCollection<StaffProfile>(COLLECTIONS.STAFF_PROFILES);
    
    const profileDoc: Omit<StaffProfile, '_id'> = {
      ...profile,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await staffCollection.insertOne(profileDoc as any);
    const newProfile = await staffCollection.findOne({ _id: result.insertedId });
    
    if (!newProfile) {
      throw new Error('Failed to create staff profile');
    }
    
    return { ...newProfile, _id: newProfile._id.toString() };
  }
  
  async getStaffProfiles(): Promise<StaffProfile[]> {
    const staffCollection = await getCollection<StaffProfile>(COLLECTIONS.STAFF_PROFILES);
    const profiles = await staffCollection.find({}).sort({ title: 1 }).toArray();
    return profiles.map(profile => ({ ...profile, _id: profile._id.toString() }));
  }
  
  async getStaffProfile(userId: string): Promise<StaffProfile | undefined> {
    const staffCollection = await getCollection<StaffProfile>(COLLECTIONS.STAFF_PROFILES);
    const profile = await staffCollection.findOne({ userId });
    return profile ? { ...profile, _id: profile._id.toString() } : undefined;
  }
  
  async updateStaffProfile(userId: string, profile: Partial<InsertStaffProfile>): Promise<StaffProfile> {
    const staffCollection = await getCollection<StaffProfile>(COLLECTIONS.STAFF_PROFILES);
    
    const result = await staffCollection.findOneAndUpdate(
      { userId },
      { $set: { ...profile, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Staff profile not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  // Contact operations
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const contactCollection = await getCollection<ContactSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS);
    
    const submissionDoc: Omit<ContactSubmission, '_id'> = {
      ...submission,
      createdAt: new Date(),
    };
    
    const result = await contactCollection.insertOne(submissionDoc as any);
    const newSubmission = await contactCollection.findOne({ _id: result.insertedId });
    
    if (!newSubmission) {
      throw new Error('Failed to create contact submission');
    }
    
    return { ...newSubmission, _id: newSubmission._id.toString() };
  }
  
  async getContactSubmissions(status?: string): Promise<ContactSubmission[]> {
    const contactCollection = await getCollection<ContactSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS);
    const query = status ? { status } : {};
    
    const submissions = await contactCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    return submissions.map(submission => ({ ...submission, _id: submission._id.toString() }));
  }
  
  async updateContactSubmissionStatus(id: string, status: string): Promise<ContactSubmission> {
    const contactCollection = await getCollection<ContactSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS);
    
    const result = await contactCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      throw new Error('Contact submission not found');
    }
    
    return { ...result, _id: result._id.toString() };
  }
  
  // Newsletter operations
  async subscribeNewsletter(email: string): Promise<void> {
    const newsletterCollection = await getCollection(COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS);
    
    await newsletterCollection.updateOne(
      { email },
      { $set: { email, status: 'active', createdAt: new Date() } },
      { upsert: true }
    );
  }
  
  async unsubscribeNewsletter(email: string): Promise<void> {
    const newsletterCollection = await getCollection(COLLECTIONS.NEWSLETTER_SUBSCRIPTIONS);
    
    await newsletterCollection.updateOne(
      { email },
      { $set: { status: 'unsubscribed' } }
    );
  }

  // Analytics operations
  async getAnalyticsOverview(): Promise<any> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);

    const [
      totalUsers,
      approvedUsers, 
      pendingUsers,
      totalBlogs,
      totalEvents,
      totalResources,
      totalBlogViews,
      totalDownloads
    ] = await Promise.all([
      usersCollection.countDocuments({}),
      usersCollection.countDocuments({ approvalStatus: 'approved' }),
      usersCollection.countDocuments({ approvalStatus: 'pending' }),
      blogsCollection.countDocuments({}),
      eventsCollection.countDocuments({}),
      resourcesCollection.countDocuments({}),
      blogsCollection.aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]).toArray(),
      // Calculate total downloads - sum of downloads from all resources
      resourcesCollection.aggregate([{ $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }]).toArray()
    ]);

    const blogViews = totalBlogViews[0]?.totalViews || 0;
    const resourceDownloads = totalDownloads[0]?.totalDownloads || 0;
    const activeUsers = Math.floor(approvedUsers * 0.75); // Approximate active users

    return {
      totalUsers,
      activeUsers,
      pendingApprovals: pendingUsers,
      totalBlogs,
      totalEvents,
      totalResources,
      totalDownloads: resourceDownloads,
      blogViews,
      eventAttendance: 84 // Placeholder - would need registration tracking
    };
  }

  async getRecentActivity(): Promise<any[]> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const eventsCollection = await getCollection<Event>(COLLECTIONS.EVENTS);
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);

    const [recentUsers, recentBlogs, recentEvents, recentResources] = await Promise.all([
      usersCollection.find({}).sort({ createdAt: -1 }).limit(3).toArray(),
      blogsCollection.find({}).sort({ createdAt: -1 }).limit(2).toArray(),
      eventsCollection.find({}).sort({ createdAt: -1 }).limit(2).toArray(),
      resourcesCollection.find({}).sort({ createdAt: -1 }).limit(2).toArray()
    ]);

    const activities: any[] = [];

    recentUsers.forEach(user => {
      if (user.approvalStatus === 'approved') {
        activities.push({
          action: 'Student registration approved',
          user: `${user.firstName} ${user.lastName}`,
          time: new Date(user.updatedAt).toISOString()
        });
      }
    });

    recentBlogs.forEach(blog => {
      activities.push({
        action: 'New blog post published',
        author: blog.title,
        time: new Date(blog.createdAt).toISOString()
      });
    });

    recentEvents.forEach(event => {
      activities.push({
        action: 'Event created',
        title: event.title,
        time: new Date(event.createdAt).toISOString()
      });
    });

    recentResources.forEach(resource => {
      activities.push({
        action: 'Resource uploaded',
        title: resource.fileName,
        time: new Date(resource.createdAt).toISOString()
      });
    });

    return activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10);
  }

  async getTopBlogs(): Promise<any[]> {
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const topBlogs = await blogsCollection
      .find({})
      .sort({ views: -1 })
      .limit(5)
      .toArray();

    return topBlogs.map(blog => ({
      title: blog.title,
      views: blog.views || 0,
      likes: blog.likes || 0
    }));
  }

  // Gamification operations
  async getUserGamificationStats(userId: string): Promise<any> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      throw new Error('User not found');
    }

    // Calculate user stats
    const [userBlogs, userComments, userDownloads] = await Promise.all([
      blogsCollection.countDocuments({ authorId: userId }),
      commentsCollection.countDocuments({ authorId: userId }),
      // Placeholder for downloads - would need download tracking
      Promise.resolve(Math.floor(Math.random() * 50) + 10)
    ]);

    const totalActions = userBlogs * 50 + userComments * 15 + userDownloads * 5;
    const level = Math.floor(totalActions / 200) + 1;
    const xp = totalActions % 1000;
    const xpToNext = 1000 - xp;

    return {
      level,
      xp,
      xpToNext,
      totalBadges: this.calculateUserBadges(userBlogs, userComments, userDownloads).length,
      totalComments: userComments,
      totalDownloads: userDownloads,
      blogLikes: userBlogs * 5, // Approximate
      streak: Math.floor(Math.random() * 14) + 1 // Placeholder
    };
  }

  async getLeaderboard(): Promise<any[]> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);

    const users = await usersCollection
      .find({ approvalStatus: 'approved', role: 'student' })
      .limit(10)
      .toArray();

    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const [userBlogs, userComments] = await Promise.all([
          blogsCollection.countDocuments({ authorId: user._id.toString() }),
          commentsCollection.countDocuments({ authorId: user._id.toString() })
        ]);

        const totalActions = userBlogs * 50 + userComments * 15;
        const level = Math.floor(totalActions / 200) + 1;
        const xp = totalActions;

        return {
          name: `${user.firstName} ${user.lastName}`,
          level,
          xp,
          avatar: `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`
        };
      })
    );

    return leaderboard
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);
  }

  async getUserBadges(userId: string): Promise<any[]> {
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    const eventsCollection = await getCollection<EventRegistration>(COLLECTIONS.EVENT_REGISTRATIONS);

    const [userBlogs, userComments, userEvents] = await Promise.all([
      blogsCollection.countDocuments({ authorId: userId }),
      commentsCollection.countDocuments({ authorId: userId }),
      eventsCollection.countDocuments({ userId: userId })
    ]);

    return this.calculateUserBadges(userBlogs, userComments, userEvents);
  }

  // Like operations
  async likeBlogPost(userId: string, blogPostId: string): Promise<void> {
    const likesCollection = await getCollection(COLLECTIONS.BLOG_LIKES);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const existingLike = await likesCollection.findOne({ userId, blogPostId });
    
    if (!existingLike) {
      await likesCollection.insertOne({
        userId,
        blogPostId,
        createdAt: new Date(),
      });
      
      await blogsCollection.updateOne(
        { _id: new ObjectId(blogPostId) },
        { $inc: { likes: 1 } }
      );
    }
  }
  
  async unlikeBlogPost(userId: string, blogPostId: string): Promise<void> {
    const likesCollection = await getCollection(COLLECTIONS.BLOG_LIKES);
    const blogsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    
    const result = await likesCollection.deleteOne({ userId, blogPostId });
    
    if (result.deletedCount > 0) {
      await blogsCollection.updateOne(
        { _id: new ObjectId(blogPostId) },
        { $inc: { likes: -1 } }
      );
    }
  }
  
  async getBlogLikesCount(blogPostId: string): Promise<number> {
    const likesCollection = await getCollection(COLLECTIONS.BLOG_LIKES);
    return await likesCollection.countDocuments({ blogPostId });
  }
  
  async isPostLikedByUser(userId: string, blogPostId: string): Promise<boolean> {
    const likesCollection = await getCollection(COLLECTIONS.BLOG_LIKES);
    const like = await likesCollection.findOne({ userId, blogPostId });
    return !!like;
  }
  
  async likeComment(userId: string, commentId: string): Promise<void> {
    const likesCollection = await getCollection(COLLECTIONS.COMMENT_LIKES);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    
    const existingLike = await likesCollection.findOne({ userId, commentId });
    
    if (!existingLike) {
      await likesCollection.insertOne({
        userId,
        commentId,
        createdAt: new Date(),
      });
      
      await commentsCollection.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { likes: 1 } }
      );
    }
  }
  
  async unlikeComment(userId: string, commentId: string): Promise<void> {
    const likesCollection = await getCollection(COLLECTIONS.COMMENT_LIKES);
    const commentsCollection = await getCollection<Comment>(COLLECTIONS.COMMENTS);
    
    const result = await likesCollection.deleteOne({ userId, commentId });
    
    if (result.deletedCount > 0) {
      await commentsCollection.updateOne(
        { _id: new ObjectId(commentId) },
        { $inc: { likes: -1 } }
      );
    }
  }
  
  async getCommentLikesCount(commentId: string): Promise<number> {
    const likesCollection = await getCollection(COLLECTIONS.COMMENT_LIKES);
    return await likesCollection.countDocuments({ commentId });
  }
  
  async isCommentLikedByUser(userId: string, commentId: string): Promise<boolean> {
    const likesCollection = await getCollection(COLLECTIONS.COMMENT_LIKES);
    const like = await likesCollection.findOne({ userId, commentId });
    return !!like;
  }

  private calculateUserBadges(blogCount: number, commentCount: number, eventCount: number): any[] {
    const badges = [
      { name: "First Comment", earned: commentCount > 0, description: "Made your first comment" },
      { name: "Resource Explorer", earned: true, description: "Downloaded 10+ resources" },
      { name: "Active Participant", earned: eventCount >= 3, description: "Participated in 3+ events" },
      { name: "Popular Contributor", earned: blogCount >= 2, description: "Published 2+ blog posts" },
      { name: "Streak Master", earned: commentCount >= 10, description: "Made 10+ comments" },
      { name: "Scholar", earned: blogCount >= 5, description: "Published 5+ high-quality posts" },
    ];

    return badges;
  }
}

export const mongoStorage = new MongoStorage();
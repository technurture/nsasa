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
    const users = await usersCollection.find({ approvalStatus: status }).toArray();
    return users.map(user => ({ ...user, _id: user._id.toString() }));
  }
  
  async updateUserApprovalStatus(id: string, status: string): Promise<User> {
    const usersCollection = await getCollection<User>(COLLECTIONS.USERS);
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { approvalStatus: status, updatedAt: new Date() } },
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
      { $set: { role, updatedAt: new Date() } },
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
    const posts = await blogPostsCollection
      .find({ published: true })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return posts.map(post => ({ ...post, _id: post._id.toString() }));
  }
  
  async getBlogPost(id: string): Promise<BlogPost | undefined> {
    const blogPostsCollection = await getCollection<BlogPost>(COLLECTIONS.BLOG_POSTS);
    const post = await blogPostsCollection.findOne({ _id: new ObjectId(id) });
    return post ? { ...post, _id: post._id.toString() } : undefined;
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
    const posts = await blogPostsCollection
      .find({ authorId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return posts.map(post => ({ ...post, _id: post._id.toString() }));
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
    const comments = await commentsCollection
      .find({ blogPostId })
      .sort({ createdAt: -1 })
      .toArray();
    
    return comments.map(comment => ({ ...comment, _id: comment._id.toString() }));
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
    const events = await eventsCollection
      .find({})
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return events.map(event => ({ ...event, _id: event._id.toString() }));
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
    const resources = await resourcesCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return resources.map(resource => ({ ...resource, _id: resource._id.toString() }));
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
}

export const mongoStorage = new MongoStorage();
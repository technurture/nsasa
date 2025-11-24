import { MongoClient, Db, Collection, Document } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB connection
let client: MongoClient;
let db: Db;

// Try different common environment variable names for MongoDB URL
const getMongoUrl = (): string => {
  const possibleUrls = [
    process.env.DATABASE_URL,
    process.env.MONGODB_URL,
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    process.env.MONGODB_CONNECTION_STRING,
    process.env.MONGO_DATABASE_URL
  ];

  const mongoUrl = possibleUrls.find(url => url);
  
  if (!mongoUrl) {
    throw new Error('MongoDB connection URL not found. Please add DATABASE_URL or one of these environment variables: MONGODB_URL, MONGO_URL, MONGODB_URI, MONGO_URI, MONGODB_CONNECTION_STRING, or MONGO_DATABASE_URL');
  }
  
  return mongoUrl;
};

export async function connectToMongoDB(): Promise<Db> {
  if (!client || !db) {
    try {
      const mongoUrl = getMongoUrl();
      console.log('Attempting to connect to MongoDB...');
      
      client = new MongoClient(mongoUrl);
      await client.connect();
      
      // Get database name from URL or use default
      let dbName;
      try {
        const url = new URL(mongoUrl);
        dbName = url.pathname.slice(1) || 'nsasa_platform';
      } catch (e) {
        console.warn('Could not parse database name from URL, using default');
        dbName = 'nsasa_platform';
      }
      
      db = client.db(dbName);
      
      // Test the connection
      await db.admin().ping();
      
      console.log(`Successfully connected to MongoDB database: ${dbName}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  
  return db;
}

export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  if (!db) {
    await connectToMongoDB();
  }
  return db.collection<T>(collectionName);
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BLOG_POSTS: 'blogPosts',
  BLOG_LIKES: 'blogLikes',
  BLOG_VIEWS: 'blogViews',
  COMMENT_LIKES: 'commentLikes',
  COMMENTS: 'comments', 
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'eventRegistrations',
  LEARNING_RESOURCES: 'learningResources',
  RESOURCE_RATINGS: 'resourceRatings',
  STAFF_PROFILES: 'staffProfiles',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  NEWSLETTER_SUBSCRIPTIONS: 'newsletterSubscriptions',
  POLLS: 'polls',
  POLL_VOTES: 'pollVotes',
} as const;

// Close connection (for cleanup)
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
  }
}

// Initialize database with indexes
export async function initializeMongoDB(): Promise<void> {
  try {
    console.log('Initializing MongoDB...');
    const database = await connectToMongoDB();
    
    if (!database) {
      throw new Error('Failed to get database connection');
    }
    
    console.log('Creating MongoDB indexes...');
    
    // Create indexes for better performance
    try {
      await database.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
      await database.collection(COLLECTIONS.USERS).createIndex({ matricNumber: 1 }, { unique: true, sparse: true });
      await database.collection(COLLECTIONS.BLOG_POSTS).createIndex({ authorId: 1 });
      await database.collection(COLLECTIONS.BLOG_POSTS).createIndex({ published: 1, createdAt: -1 });
      await database.collection(COLLECTIONS.BLOG_LIKES).createIndex({ userId: 1, blogPostId: 1 }, { unique: true });
      await database.collection(COLLECTIONS.BLOG_LIKES).createIndex({ blogPostId: 1 });
      await database.collection(COLLECTIONS.BLOG_VIEWS).createIndex({ userId: 1, blogPostId: 1 }, { unique: true });
      await database.collection(COLLECTIONS.BLOG_VIEWS).createIndex({ blogPostId: 1 });
      await database.collection(COLLECTIONS.COMMENT_LIKES).createIndex({ userId: 1, commentId: 1 }, { unique: true });
      await database.collection(COLLECTIONS.COMMENT_LIKES).createIndex({ commentId: 1 });
      await database.collection(COLLECTIONS.COMMENTS).createIndex({ blogPostId: 1 });
      await database.collection(COLLECTIONS.EVENTS).createIndex({ date: 1 });
      await database.collection(COLLECTIONS.EVENT_REGISTRATIONS).createIndex({ userId: 1, eventId: 1 }, { unique: true });
      await database.collection(COLLECTIONS.LEARNING_RESOURCES).createIndex({ category: 1, createdAt: -1 });
      await database.collection(COLLECTIONS.STAFF_PROFILES).createIndex({ userId: 1 }, { unique: true });
      
      console.log('MongoDB indexes created successfully');
    } catch (indexError: any) {
      // Index creation failures should not stop the app from starting
      console.warn('Some indexes failed to create:', indexError.message);
    }
  } catch (error) {
    console.error('MongoDB initialization error:', error);
    throw error;
  }
}
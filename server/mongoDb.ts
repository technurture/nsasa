import { MongoClient, Db, Collection } from 'mongodb';

// MongoDB connection
let client: MongoClient;
let db: Db;

// Try different common environment variable names for MongoDB URL
const getMongoUrl = (): string => {
  const possibleUrls = [
    process.env.MONGODB_URL,
    process.env.MONGO_URL,
    process.env.MONGODB_URI,
    process.env.MONGO_URI,
    process.env.MONGODB_CONNECTION_STRING,
    process.env.MONGO_DATABASE_URL
  ];

  const mongoUrl = possibleUrls.find(url => url);
  
  if (!mongoUrl) {
    throw new Error('MongoDB connection URL not found. Please add one of these environment variables: MONGODB_URL, MONGO_URL, MONGODB_URI, MONGO_URI, MONGODB_CONNECTION_STRING, or MONGO_DATABASE_URL');
  }
  
  return mongoUrl;
};

export async function connectToMongoDB(): Promise<Db> {
  if (!client) {
    const mongoUrl = getMongoUrl();
    client = new MongoClient(mongoUrl);
    await client.connect();
    
    // Get database name from URL or use default
    const dbName = new URL(mongoUrl).pathname.slice(1) || 'nsasa_platform';
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB database: ${dbName}`);
  }
  
  return db;
}

export async function getCollection<T = any>(collectionName: string): Promise<Collection<T>> {
  if (!db) {
    await connectToMongoDB();
  }
  return db.collection<T>(collectionName);
}

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  BLOG_POSTS: 'blogPosts',
  COMMENTS: 'comments', 
  EVENTS: 'events',
  EVENT_REGISTRATIONS: 'eventRegistrations',
  LEARNING_RESOURCES: 'learningResources',
  STAFF_PROFILES: 'staffProfiles',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  NEWSLETTER_SUBSCRIPTIONS: 'newsletterSubscriptions',
} as const;

// Close connection (for cleanup)
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
  }
}

// Initialize database with indexes
export async function initializeMongoDB(): Promise<void> {
  const database = await connectToMongoDB();
  
  // Create indexes for better performance
  await database.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true });
  await database.collection(COLLECTIONS.USERS).createIndex({ matricNumber: 1 }, { unique: true, sparse: true });
  await database.collection(COLLECTIONS.BLOG_POSTS).createIndex({ authorId: 1 });
  await database.collection(COLLECTIONS.BLOG_POSTS).createIndex({ published: 1, createdAt: -1 });
  await database.collection(COLLECTIONS.COMMENTS).createIndex({ blogPostId: 1 });
  await database.collection(COLLECTIONS.EVENTS).createIndex({ date: 1 });
  await database.collection(COLLECTIONS.EVENT_REGISTRATIONS).createIndex({ userId: 1, eventId: 1 }, { unique: true });
  await database.collection(COLLECTIONS.LEARNING_RESOURCES).createIndex({ category: 1, createdAt: -1 });
  await database.collection(COLLECTIONS.STAFF_PROFILES).createIndex({ userId: 1 }, { unique: true });
  
  console.log('MongoDB indexes created successfully');
}
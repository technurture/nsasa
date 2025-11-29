const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.DATABASE_URL || process.env.MONGODB_URL || process.env.MONGO_URL;

async function fixIndex() {
  const client = new MongoClient(url);
  try {
    await client.connect();
    const dbName = new URL(url).pathname.slice(1) || 'nsasa_platform';
    const db = client.db(dbName);
    
    // Drop the existing non-sparse index
    try {
      await db.collection('staffProfiles').dropIndex('userId_1');
      console.log('Dropped existing userId_1 index');
    } catch (e) {
      console.log('Index did not exist or already dropped:', e.message);
    }
    
    // Create the new sparse unique index
    await db.collection('staffProfiles').createIndex(
      { userId: 1 }, 
      { unique: true, sparse: true }
    );
    console.log('Created new sparse unique index on userId');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixIndex();

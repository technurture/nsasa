import { getCollection, COLLECTIONS, initializeMongoDB } from './mongoDb';
import { LearningResource } from '@shared/mongoSchema';

async function checkResources() {
  try {
    await initializeMongoDB();
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    const resources = await resourcesCollection.find({}).toArray();
    
    console.log(`\nTotal resources: ${resources.length}\n`);
    
    resources.forEach((r, i) => {
      console.log(`Resource ${i + 1}:`);
      console.log(`  Title: ${r.title}`);
      console.log(`  File URL: ${r.fileUrl}`);
      console.log(`  Uploaded: ${r.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkResources();

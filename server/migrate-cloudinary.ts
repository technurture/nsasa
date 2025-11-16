import { v2 as cloudinary } from 'cloudinary';
import { getCollection, COLLECTIONS, initializeMongoDB } from './mongoDb';
import { LearningResource } from '@shared/mongoSchema';
import { ObjectId } from 'mongodb';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

async function migrateCloudinaryFiles() {
  try {
    console.log('🔄 Starting Cloudinary file migration...\n');
    
    // Initialize MongoDB
    await initializeMongoDB();
    console.log('✅ Connected to MongoDB\n');
    
    // Get ALL learning resources (no pagination)
    const resourcesCollection = await getCollection<LearningResource>(COLLECTIONS.LEARNING_RESOURCES);
    const allResources = await resourcesCollection.find({}).toArray();
    
    console.log(`📊 Found ${allResources.length} total resources\n`);
    
    // Check ALL resources because they might have public URLs but authenticated access mode
    const resourcesToCheck = allResources.filter(r => r.fileUrl);
    
    console.log(`🔍 Checking ${resourcesToCheck.length} resources for access mode\n`);
    
    if (resourcesToCheck.length === 0) {
      console.log('✅ No files to migrate!\n');
      process.exit(0);
    }
    
    const migratedFiles: Array<{title: string, oldUrl: string, newUrl: string}> = [];
    const errors: Array<{title: string, error: string}> = [];
    
    for (const resource of resourcesToCheck) {
      try {
        console.log(`\n📝 Processing: ${resource.title}`);
        console.log(`   Current URL: ${resource.fileUrl}`);
        
        // Extract public ID from Cloudinary URL
        // URL formats:
        // - https://res.cloudinary.com/{cloud}/authenticated/upload/{version}/{public_id}
        // - https://res.cloudinary.com/{cloud}/raw/upload/{version}/{public_id}
        let publicId: string;
        let currentType: 'authenticated' | 'upload' = 'upload';
        
        if (resource.fileUrl.includes('/authenticated/upload/')) {
          const urlMatch = resource.fileUrl.match(/\/authenticated\/upload\/(?:v\d+\/)?(.*)/);
          if (!urlMatch) {
            console.error(`   ❌ Could not parse authenticated URL`);
            errors.push({ title: resource.title, error: 'Could not parse URL' });
            continue;
          }
          publicId = urlMatch[1];
          currentType = 'authenticated';
        } else if (resource.fileUrl.includes('/raw/upload/') || resource.fileUrl.includes('/image/upload/')) {
          const urlMatch = resource.fileUrl.match(/\/(raw|image)\/upload\/(?:v\d+\/)?(.*)/);
          if (!urlMatch) {
            console.error(`   ❌ Could not parse URL`);
            errors.push({ title: resource.title, error: 'Could not parse URL' });
            continue;
          }
          publicId = urlMatch[2];
          currentType = 'upload';
        } else {
          console.error(`   ❌ Unrecognized URL format`);
          errors.push({ title: resource.title, error: 'Unrecognized URL format' });
          continue;
        }
        
        console.log(`   Public ID: ${publicId}`);
        console.log(`   Current type: ${currentType}`);
        
        // Use Cloudinary Admin API to ensure the file has public access
        try {
          console.log(`   🔄 Setting access mode to public...`);
          
          await cloudinary.uploader.explicit(publicId, {
            type: currentType,
            resource_type: 'raw',
            access_mode: 'public'
          });
          
          console.log(`   ✅ Access mode set to public`);
        } catch (explicitError: any) {
          console.error(`   ❌ Explicit method failed:`, explicitError.message);
          errors.push({
            title: resource.title,
            error: `Failed to set access mode: ${explicitError.message}`
          });
          continue;
        }
        
        // Generate the public URL (should be the same if already public)
        const newUrl = cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          secure: true
        });
        
        console.log(`   New URL: ${newUrl}`);
        
        // Update the resource in MongoDB if URL changed
        if (newUrl !== resource.fileUrl) {
          await resourcesCollection.updateOne(
            { _id: resource._id },
            { $set: { fileUrl: newUrl } }
          );
          console.log(`   ✅ Database updated`);
        } else {
          console.log(`   ℹ️  URL unchanged (already public format)`);
        }
        
        migratedFiles.push({
          title: resource.title,
          oldUrl: resource.fileUrl,
          newUrl
        });
        
      } catch (error: any) {
        console.error(`   ❌ Error migrating ${resource.title}:`, error.message);
        errors.push({
          title: resource.title,
          error: error.message
        });
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedFiles.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log('='.repeat(60) + '\n');
    
    if (migratedFiles.length > 0) {
      console.log('✅ Migrated files:');
      migratedFiles.forEach(file => {
        console.log(`   • ${file.title}`);
      });
      console.log('');
    }
    
    if (errors.length > 0) {
      console.log('❌ Errors:');
      errors.forEach(err => {
        console.log(`   • ${err.title}: ${err.error}`);
      });
      console.log('');
    }
    
    process.exit(errors.length > 0 ? 1 : 0);
    
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateCloudinaryFiles();


import { mongoStorage } from '../server/mongoStorage';
import { initializeMongoDB, closeMongoDB } from '../server/mongoDb';
import { ObjectId } from 'mongodb';

async function testGamification() {
    try {
        console.log('--- Gamification Debug Script ---');
        await initializeMongoDB();

        // 1. Create a dummy user
        const email = `test.gamification.${Date.now()}@example.com`;
        const user = await mongoStorage.registerUser({
            email,
            password: 'password123',
            firstName: 'Gamification',
            lastName: 'Tester',
            role: 'student'
        });
        console.log(`Created test user: ${user.email} (${user._id})`);

        // 2. Get initial stats
        const initialStats = await mongoStorage.getUserGamificationStats(user._id.toString());
        console.log('Initial Stats:', initialStats);

        if (initialStats.totalDownloads !== 0) {
            console.error('FAIL: Initial downloads should be 0');
        }

        // 3. Create a dummy resource
        const resource = await mongoStorage.createLearningResource(user._id.toString(), {
            title: 'Test Resource',
            description: 'A resource for testing',
            type: 'pdf',
            category: 'Test',
            tags: ['test'],
            fileUrl: 'http://example.com/file.pdf',
            fileName: 'file.pdf',
            fileSize: '1MB',
            difficulty: '100l',
            imageUrls: [],
            rating: 0,
            ratingCount: 0,
            downloads: 0,
            previewAvailable: false
        });
        console.log(`Created test resource: ${resource._id}`);

        // 4. Simulate download
        console.log('Simulating download...');
        await mongoStorage.recordResourceDownload(user._id.toString(), resource._id.toString());

        // 5. Get updated stats
        const updatedStats = await mongoStorage.getUserGamificationStats(user._id.toString());
        console.log('Updated Stats:', updatedStats);

        // 6. Verification
        if (updatedStats.totalDownloads === 1) {
            console.log('SUCCESS: Download count incremented correctly.');
        } else {
            console.error(`FAIL: Download count is ${updatedStats.totalDownloads}, expected 1.`);
        }

        // Points check: 5 points per download
        // Initial points might be 0.
        // Updated points should be Initial + 5.
        const expectedPoints = initialStats.xp + 5;
        // Note: xp is mod 1000, so we should check totalActions really, but simplistic check is ok for 0 start

        // totalActions formula: blogs*50 + comments*15 + downloads*5
        // user has 0 blogs, 0 comments, 1 download => 5 points.
        if (updatedStats.xp === 5) {
            console.log('SUCCESS: Points calculated correctly (5 pts).');
        } else {
            console.error(`FAIL: XP is ${updatedStats.xp}, expected 5.`);
        }

        // Cleanup
        // (Optional: User deletion logic if needed, but for dev db it's usually fine to leave test data or wipe db)

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await closeMongoDB();
    }
}

testGamification();

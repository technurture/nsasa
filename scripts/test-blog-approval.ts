
import { mongoStorage } from '../server/mongoStorage';
import { initializeMongoDB, closeMongoDB } from '../server/mongoDb';
import { ObjectId } from 'mongodb';

async function testBlogApproval() {
    try {
        console.log('--- Blog Approval Gamification Debug Script ---');
        await initializeMongoDB();

        // 1. Create a dummy student
        const email = `test.student.${Date.now()}@example.com`;
        const user = await mongoStorage.registerUser({
            email,
            password: 'password123',
            firstName: 'Student',
            lastName: 'Tester',
            role: 'student'
        });
        console.log(`Created test student: ${user.email} (${user._id})`);

        // 2. Create a PENDING blog post
        console.log('Creating PENDING blog post...');
        const blog = await mongoStorage.createBlogPost(user._id.toString(), {
            title: 'My Pending Blog',
            content: 'This is a test blog content.',
            category: 'Test',
            excerpt: 'Test excerpt',
            approvalStatus: 'pending',
            published: false
        } as any);
        console.log(`Created blog: ${blog._id} [Status: ${blog.approvalStatus}]`);

        // 3. Check stats (Should be 0 points for blogs)
        const statsPending = await mongoStorage.getUserGamificationStats(user._id.toString());
        console.log('Stats (Pending):', statsPending);

        // Expected: 0 xp (assuming no other actions), or at least blog count contribution is 0
        // totalActions = userBlogs * 50 ...
        // If statsPending.xp represents blog points, it should be 0.
        // Let's check statsPending.totalBlogs? No, getUserGamificationStats doesn't return totalBlogs directly in root
        // But it uses it for calculation.
        // XP = totalActions % 1000.
        // Level = totalActions / 200 + 1.

        if (statsPending.xp === 0 && statsPending.level === 1) {
            console.log('SUCCESS: Pending blog awarded 0 points.');
        } else {
            console.error(`FAIL: Pending blog awarded points! XP: ${statsPending.xp}`);
        }

        // 4. Approve the blog
        console.log('Approving blog post...');
        await mongoStorage.updateBlogPost(blog._id.toString(), {
            approvalStatus: 'approved',
            published: true
        } as any);

        // 5. Check stats (Should be 50 points)
        const statsApproved = await mongoStorage.getUserGamificationStats(user._id.toString());
        console.log('Stats (Approved):', statsApproved);

        if (statsApproved.xp === 50) {
            console.log('SUCCESS: Approved blog awarded 50 points.');
        } else {
            console.error(`FAIL: Approved blog did not award correct points. XP: ${statsApproved.xp}, Expected: 50`);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await closeMongoDB();
    }
}

testBlogApproval();

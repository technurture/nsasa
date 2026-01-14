import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { randomUUID } from 'crypto';
import { mongoStorage } from "./mongoStorage";
import { authenticateToken, requireAdmin, requireSuperAdmin, requireRole, optionalAuth } from "./customAuth";
import authRoutes from "./authRoutes";
import { initializeMongoDB } from "./mongoDb";
import { insertBlogPostSchema, insertCommentSchema, insertPollSchema, pollOptionSchema } from "../shared/mongoSchema";
import { z } from "zod";
import { v2 as cloudinary } from 'cloudinary';

// Use insertBlogPostSchema directly for validation
const blogRequestSchema = insertBlogPostSchema;

// Create comment request schemas for each resource type
const blogCommentRequestSchema = insertCommentSchema.extend({
  content: z.string().min(1),
  parentCommentId: z.string().optional()
});

const eventCommentRequestSchema = insertCommentSchema.extend({
  content: z.string().min(1),
  parentCommentId: z.string().optional()
});

const resourceCommentRequestSchema = insertCommentSchema.extend({
  content: z.string().min(1),
  parentCommentId: z.string().optional()
});

// Poll creation schema that accepts only option text from client
const pollCreationSchema = z.object({
  question: z.string().min(1, "Poll question is required"),
  options: z.array(z.string().min(1, "Option text cannot be empty")).min(2, "At least 2 options are required"),
  allowMultipleVotes: z.boolean().optional().default(false),
  expiresAt: z.coerce.date().optional(),
  targetLevels: z.array(z.string()).optional().default([]),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB
  await initializeMongoDB();

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  // Add cookie parser middleware
  app.use(cookieParser());

  // Mount auth routes
  app.use('/api/auth', authRoutes);

  // Analytics routes (Admin and Super Admin only)
  app.get('/api/analytics/overview', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const analytics = await mongoStorage.getAnalyticsOverview();
      res.json(analytics);
    } catch (error: any) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  });

  app.get('/api/analytics/recent-activity', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const activities = await mongoStorage.getRecentActivity();
      res.json(activities);
    } catch (error: any) {
      console.error('Get recent activity error:', error);
      res.status(500).json({ message: 'Failed to get recent activity', error: error.message });
    }
  });

  app.get('/api/analytics/top-blogs', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const topBlogs = await mongoStorage.getTopBlogs();
      res.json(topBlogs);
    } catch (error: any) {
      console.error('Get top blogs error:', error);
      res.status(500).json({ message: 'Failed to get top blogs', error: error.message });
    }
  });

  // Gamification routes (Students only)
  app.get('/api/gamification/user-stats/:userId', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;

      // Users can only access their own stats unless they're admin
      if (req.user?.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const userStats = await mongoStorage.getUserGamificationStats(userId);
      res.json(userStats);
    } catch (error: any) {
      console.error('Get user stats error:', error);
      res.status(500).json({ message: 'Failed to get user stats', error: error.message });
    }
  });

  app.get('/api/gamification/leaderboard', authenticateToken, async (req, res) => {
    try {
      const leaderboard = await mongoStorage.getLeaderboard();
      res.json(leaderboard);
    } catch (error: any) {
      console.error('Get leaderboard error:', error);
      res.status(500).json({ message: 'Failed to get leaderboard', error: error.message });
    }
  });

  app.get('/api/gamification/badges/:userId', authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;

      // Users can only access their own badges unless they're admin
      if (req.user?.userId !== userId && req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const badges = await mongoStorage.getUserBadges(userId);
      res.json(badges);
    } catch (error: any) {
      console.error('Get user badges error:', error);
      res.status(500).json({ message: 'Failed to get user badges', error: error.message });
    }
  });

  // Blog routes
  app.get('/api/blogs', optionalAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const search = req.query.search as string;
      const blogs = await mongoStorage.getBlogPosts(limit, offset, search);

      // Add isLikedByUser field to each blog
      const userId = req.user?.userId;
      const blogsWithLikeStatus = await Promise.all(
        blogs.map(async (blog) => {
          const isLikedByUser = userId && blog._id
            ? await mongoStorage.isPostLikedByUser(userId as string, blog._id as string)
            : false;
          return { ...blog, isLikedByUser };
        })
      );

      res.json(blogsWithLikeStatus);
    } catch (error: any) {
      console.error('Get blogs error:', error);
      res.status(500).json({ message: 'Failed to get blogs', error: error.message });
    }
  });

  // Get current user's own blog posts
  app.get('/api/user/blogs', authenticateToken, async (req, res) => {
    console.log('🔍 DEBUG: Hit /api/user/blogs route');
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const blogs = await mongoStorage.getBlogPostsByAuthor(req.user.userId);
      res.json(blogs);
    } catch (error: any) {
      console.error('Get user blogs error:', error);
      res.status(500).json({ message: 'Failed to fetch your blogs', error: error.message });
    }
  });


  app.get('/api/blogs/:id', optionalAuth, async (req, res) => {
    console.log(`🔍 DEBUG: Hit /api/blogs/:id route with id=${req.params.id}`);
    try {
      const blog = await mongoStorage.getBlogPost(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Increment views and track user if authenticated
      const userId = req.user?.userId;
      await mongoStorage.incrementBlogViews(req.params.id, userId as string | undefined);

      // Add isLikedByUser field
      const isLikedByUser = userId && blog._id
        ? await mongoStorage.isPostLikedByUser(userId as string, blog._id as string)
        : false;

      res.json({ ...blog, isLikedByUser });
    } catch (error: any) {
      console.error('Get blog error:', error);
      res.status(500).json({ message: 'Failed to get blog', error: error.message });
    }
  });

  app.post('/api/blogs', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Validate request body against schema
      const validationResult = blogRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid blog data',
          errors: validationResult.error.issues
        });
      }

      // Determine status based on role
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const blogData = {
        ...validationResult.data,
        // Students: Forced to pending & unpublished
        // Admins: Respect their choice or default to approved
        approvalStatus: isAdmin ? (validationResult.data.approvalStatus || 'approved') : 'pending',
        published: isAdmin ? (validationResult.data.published ?? true) : false
      };

      const blog = await mongoStorage.createBlogPost(req.user.userId, blogData as any);
      res.status(201).json(blog);
    } catch (error: any) {
      console.error('Create blog error:', error);
      res.status(500).json({ message: 'Failed to create blog', error: error.message });
    }
  });

  // Admin endpoints for blogs
  app.get('/api/admin/blogs', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const blogs = await mongoStorage.getAdminBlogPosts(status, limit, offset);
      res.json(blogs);
    } catch (error: any) {
      console.error('Get admin blogs error:', error);
      res.status(500).json({ message: 'Failed to get blogs', error: error.message });
    }
  });

  // Admin approval endpoint
  app.put('/api/admin/blogs/:id/approval', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Must be approved or rejected.' });
      }

      const blog = await mongoStorage.getBlogPost(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const updatedBlog = await mongoStorage.updateBlogPost(id, {
        approvalStatus: status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        published: status === 'approved' // Auto-publish on approval? Or keep as draft? Let's say auto-publish for now to simplify
      } as any);

      res.json(updatedBlog);
    } catch (error: any) {
      console.error('Update blog approval error:', error);
      res.status(500).json({ message: 'Failed to update blog approval', error: error.message });
    }
  });

  app.put('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Validate request body against schema (partial update)
      const updateSchema = blogRequestSchema.partial();
      const validationResult = updateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid blog update data',
          errors: validationResult.error.issues
        });
      }

      // Check if user owns the blog or is admin
      const existingBlog = await mongoStorage.getBlogPost(req.params.id);
      if (!existingBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      if (existingBlog.authorId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Permission denied' });
      }

      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      const updateData: any = {
        ...validationResult.data,
        // If not admin, force status to pending and unpublished on update
        ...(!isAdmin ? { approvalStatus: 'pending', published: false } : {})
      };

      const blog = await mongoStorage.updateBlogPost(req.params.id, updateData);
      res.json(blog);
    } catch (error: any) {
      console.error('Update blog error:', error);
      res.status(500).json({ message: 'Failed to update blog', error: error.message });
    }
  });

  app.delete('/api/blogs/:id', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user owns the blog or is admin
      const existingBlog = await mongoStorage.getBlogPost(req.params.id);
      if (!existingBlog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      if (existingBlog.authorId !== req.user.userId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ message: 'Permission denied' });
      }

      await mongoStorage.deleteBlogPost(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete blog error:', error);
      res.status(500).json({ message: 'Failed to delete blog', error: error.message });
    }
  });

  // Comments routes
  app.get('/api/blogs/:id/comments', optionalAuth, async (req, res) => {
    try {
      const comments = await mongoStorage.getBlogComments(req.params.id);

      // Add isLikedByUser field to each comment
      const userId = req.user?.userId;
      const commentsWithLikeStatus = await Promise.all(
        comments.map(async (comment) => {
          const isLikedByUser = userId && comment._id
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id as string)
            : false;
          return { ...comment, isLikedByUser };
        })
      );

      res.json(commentsWithLikeStatus);
    } catch (error: any) {
      console.error('Get comments error:', error);
      res.status(500).json({ message: 'Failed to get comments', error: error.message });
    }
  });

  app.post('/api/blogs/:id/comments', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }



      // Validate request body against schema
      const validationResult = blogCommentRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid comment data',
          errors: validationResult.error.issues
        });
      }

      const comment = await mongoStorage.createBlogComment(
        req.user.userId,
        req.params.id,
        validationResult.data
      );
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Create comment error:', error);
      res.status(500).json({ message: 'Failed to create comment', error: error.message });
    }
  });

  // Like/Unlike blog routes
  app.post('/api/blogs/:id/like', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.likeBlogPost(req.user.userId, req.params.id);
      const likesCount = await mongoStorage.getBlogLikesCount(req.params.id);
      res.json({ message: 'Blog liked successfully', likesCount });
    } catch (error: any) {
      console.error('Like blog error:', error);
      res.status(500).json({ message: 'Failed to like blog', error: error.message });
    }
  });

  app.delete('/api/blogs/:id/like', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.unlikeBlogPost(req.user.userId, req.params.id);
      const likesCount = await mongoStorage.getBlogLikesCount(req.params.id);
      res.json({ message: 'Blog unliked successfully', likesCount });
    } catch (error: any) {
      console.error('Unlike blog error:', error);
      res.status(500).json({ message: 'Failed to unlike blog', error: error.message });
    }
  });

  // Get users who liked a blog (requires authentication)
  app.get('/api/blogs/:id/likes/users', authenticateToken, async (req, res) => {
    try {
      const users = await mongoStorage.getBlogLikedByUsers(req.params.id);

      // Only return safe public data
      const safeUsers = users.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        level: user.level,
      }));

      res.json(safeUsers);
    } catch (error: any) {
      console.error('Get blog likes users error:', error);
      res.status(500).json({ message: 'Failed to get users who liked the blog', error: error.message });
    }
  });

  // Get users who viewed a blog (requires authentication)
  app.get('/api/blogs/:id/views/users', authenticateToken, async (req, res) => {
    try {
      const users = await mongoStorage.getBlogViewedByUsers(req.params.id);

      // Only return safe public data
      const safeUsers = users.map(user => ({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        level: user.level,
      }));

      res.json(safeUsers);
    } catch (error: any) {
      console.error('Get blog views users error:', error);
      res.status(500).json({ message: 'Failed to get users who viewed the blog', error: error.message });
    }
  });

  // Like/Unlike comment routes
  app.post('/api/comments/:id/like', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.likeComment(req.user.userId, req.params.id);
      const likesCount = await mongoStorage.getCommentLikesCount(req.params.id);
      res.json({ message: 'Comment liked successfully', likesCount });
    } catch (error: any) {
      console.error('Like comment error:', error);
      res.status(500).json({ message: 'Failed to like comment', error: error.message });
    }
  });

  app.delete('/api/comments/:id/like', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.unlikeComment(req.user.userId, req.params.id);
      const likesCount = await mongoStorage.getCommentLikesCount(req.params.id);
      res.json({ message: 'Comment unliked successfully', likesCount });
    } catch (error: any) {
      console.error('Unlike comment error:', error);
      res.status(500).json({ message: 'Failed to unlike comment', error: error.message });
    }
  });

  // Event comments routes
  app.get('/api/events/:id/comments', optionalAuth, async (req, res) => {
    try {
      const comments = await mongoStorage.getEventComments(req.params.id);

      // Add isLikedByUser field to each comment
      const userId = req.user?.userId;
      const commentsWithLikeStatus = await Promise.all(
        comments.map(async (comment) => {
          const isLikedByUser = userId && comment._id
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id as string)
            : false;
          return { ...comment, isLikedByUser };
        })
      );

      res.json(commentsWithLikeStatus);
    } catch (error: any) {
      console.error('Get event comments error:', error);
      res.status(500).json({ message: 'Failed to get comments', error: error.message });
    }
  });

  app.post('/api/events/:id/comments', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }



      // Validate request body against schema
      const validationResult = eventCommentRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid comment data',
          errors: validationResult.error.issues
        });
      }

      const comment = await mongoStorage.createEventComment(
        req.user.userId,
        req.params.id,
        validationResult.data
      );
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Create event comment error:', error);
      res.status(500).json({ message: 'Failed to create comment', error: error.message });
    }
  });

  // Learning resource comments routes
  app.get('/api/resources/:id/comments', optionalAuth, async (req, res) => {
    try {
      const comments = await mongoStorage.getResourceComments(req.params.id);

      // Add isLikedByUser field to each comment
      const userId = req.user?.userId;
      const commentsWithLikeStatus = await Promise.all(
        comments.map(async (comment) => {
          const isLikedByUser = userId && comment._id
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id as string)
            : false;
          return { ...comment, isLikedByUser };
        })
      );

      res.json(commentsWithLikeStatus);
    } catch (error: any) {
      console.error('Get resource comments error:', error);
      res.status(500).json({ message: 'Failed to get comments', error: error.message });
    }
  });

  app.post('/api/resources/:id/comments', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }



      // Validate request body against schema
      const validationResult = resourceCommentRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid comment data',
          errors: validationResult.error.issues
        });
      }

      const comment = await mongoStorage.createResourceComment(
        req.user.userId,
        req.params.id,
        validationResult.data
      );
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Create resource comment error:', error);
      res.status(500).json({ message: 'Failed to create comment', error: error.message });
    }
  });

  // Events routes
  app.get('/api/events', optionalAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await mongoStorage.getEvents(limit, offset);
      res.json(events);
    } catch (error: any) {
      console.error('Get events error:', error);
      res.status(500).json({ message: 'Failed to get events', error: error.message });
    }
  });

  app.post('/api/events', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const event = await mongoStorage.createEvent(req.user.userId, req.body);
      res.status(201).json(event);
    } catch (error: any) {
      console.error('Create event error:', error);
      res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
  });

  app.get('/api/events/:id', optionalAuth, async (req, res) => {
    try {
      const event = await mongoStorage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error: any) {
      console.error('Get event error:', error);
      res.status(500).json({ message: 'Failed to get event', error: error.message });
    }
  });

  app.put('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const event = await mongoStorage.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error: any) {
      console.error('Update event error:', error);
      res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
  });

  app.delete('/api/events/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete event error:', error);
      res.status(500).json({ message: 'Failed to delete event', error: error.message });
    }
  });

  // Event registration routes
  app.post('/api/events/:id/register', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const registration = await mongoStorage.registerForEvent(req.user.userId, req.params.id);
      res.status(201).json({
        message: 'Successfully registered for event',
        registration
      });
    } catch (error: any) {
      console.error('Event registration error:', error);
      res.status(500).json({ message: 'Failed to register for event', error: error.message });
    }
  });

  app.get('/api/events/:id/registrations', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const registrations = await mongoStorage.getEventRegistrations(req.params.id);

      // Fetch user details for each registration
      const registrationsWithUsers = await Promise.all(
        registrations.map(async (registration) => {
          const user = await mongoStorage.getUser(registration.userId);
          return {
            ...registration,
            user: user ? {
              _id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl
            } : null
          };
        })
      );

      res.json(registrationsWithUsers);
    } catch (error: any) {
      console.error('Get event registrations error:', error);
      res.status(500).json({ message: 'Failed to get event registrations', error: error.message });
    }
  });

  app.get('/api/user/event-registrations', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const registrations = await mongoStorage.getUserEventRegistrations(req.user.userId);
      res.json(registrations);
    } catch (error: any) {
      console.error('Get user event registrations error:', error);
      res.status(500).json({ message: 'Failed to get user event registrations', error: error.message });
    }
  });

  // Learning resources routes
  app.get('/api/resources', optionalAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const resources = await mongoStorage.getLearningResources(limit, offset);
      res.json(resources);
    } catch (error: any) {
      console.error('Get resources error:', error);
      res.status(500).json({ message: 'Failed to get resources', error: error.message });
    }
  });

  app.get('/api/resources/:id', optionalAuth, async (req, res) => {
    try {
      const resource = await mongoStorage.getLearningResource(req.params.id);
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(resource);
    } catch (error: any) {
      console.error('Get resource error:', error);
      res.status(500).json({ message: 'Failed to get resource', error: error.message });
    }
  });

  // Generate signed download URL for Cloudinary resources
  // Note: No authentication required here because signed URLs are inherently secure
  // (time-limited and cryptographically signed). This allows previews in iframes and
  // downloads to work properly without cookie/authentication issues.
  app.post('/api/cloudinary/signed-url', async (req, res) => {
    try {
      const { publicId, resourceType = 'raw', format, filename } = req.body;

      if (!publicId) {
        return res.status(400).json({ message: 'publicId is required' });
      }

      // Generate signed URL with 1 hour expiration
      const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const urlOptions: any = {
        resource_type: resourceType,
        type: 'upload', // Files uploaded via unsigned preset are stored as 'upload' type
        sign_url: true,
        secure: true,
        expires_at: expiresAt
      };

      // Only add attachment flag if filename is provided
      if (filename) {
        urlOptions.flags = 'attachment';
      }

      if (format) {
        urlOptions.format = format;
      }

      const signedUrl = cloudinary.url(publicId, urlOptions);

      res.json({ url: signedUrl });
    } catch (error: any) {
      console.error('Generate signed URL error:', error);
      res.status(500).json({ message: 'Failed to generate signed URL', error: error.message });
    }
  });

  // Resource download tracking
  app.post('/api/resources/:id/download', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.recordResourceDownload(req.user.userId, req.params.id);
      res.json({ message: 'Download recorded successfully' });
    } catch (error: any) {
      console.error('Record download error:', error);
      res.status(500).json({ message: 'Failed to record download', error: error.message });
    }
  });

  // Resource rating
  app.post('/api/resources/:id/rate', authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { rating } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      await mongoStorage.rateResource(req.user.userId, req.params.id, rating);
      res.json({ message: 'Rating submitted successfully' });
    } catch (error: any) {
      console.error('Rate resource error:', error);
      res.status(500).json({ message: 'Failed to rate resource', error: error.message });
    }
  });

  app.post('/api/resources', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const resource = await mongoStorage.createLearningResource(req.user.userId, req.body);
      res.status(201).json(resource);
    } catch (error: any) {
      console.error('Create resource error:', error);
      res.status(500).json({ message: 'Failed to create resource', error: error.message });
    }
  });

  app.put('/api/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const resource = await mongoStorage.updateLearningResource(req.params.id, req.body);
      res.json(resource);
    } catch (error: any) {
      console.error('Update resource error:', error);
      res.status(500).json({ message: 'Failed to update resource', error: error.message });
    }
  });

  app.delete('/api/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.deleteLearningResource(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete resource error:', error);
      res.status(500).json({ message: 'Failed to delete resource', error: error.message });
    }
  });

  // Staff routes
  app.get('/api/staff', optionalAuth, async (req, res) => {
    try {
      const staffProfiles = await mongoStorage.getStaffProfiles();

      const staffWithUserData = await Promise.all(
        staffProfiles.map(async (profile) => {
          // Handle both userId (existing user) and customName (custom profile) scenarios
          if (profile.userId) {
            const user = await mongoStorage.getUser(profile.userId);
            return {
              ...profile,
              name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
              email: user?.email || '',
              phone: profile.phone || user?.phoneNumber || '',
              avatar: profile.avatar || user?.profileImageUrl || '',
            };
          } else {
            // Custom staff member without userId
            return {
              ...profile,
              name: profile.customName || 'Unknown',
              email: '',
              phone: profile.phone || '',
              avatar: profile.avatar || '',
            };
          }
        })
      );

      res.json(staffWithUserData);
    } catch (error: any) {
      console.error('Get staff error:', error);
      res.status(500).json({ message: 'Failed to get staff', error: error.message });
    }
  });

  app.get('/api/staff/landing-page/featured', optionalAuth, async (req, res) => {
    try {
      const staffProfiles = await mongoStorage.getLandingPageStaff();

      const staffWithUserData = await Promise.all(
        staffProfiles.map(async (profile) => {
          // Handle both userId (existing user) and customName (custom profile) scenarios
          if (profile.userId) {
            const user = await mongoStorage.getUser(profile.userId);
            return {
              ...profile,
              name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
              email: user?.email || '',
              phone: profile.phone || user?.phoneNumber || '',
              avatar: profile.avatar || user?.profileImageUrl || '',
            };
          } else {
            // Custom staff member without userId
            return {
              ...profile,
              name: profile.customName || 'Unknown',
              email: '',
              phone: profile.phone || '',
              avatar: profile.avatar || '',
            };
          }
        })
      );

      res.json(staffWithUserData);
    } catch (error: any) {
      console.error('Get landing page staff error:', error);
      res.status(500).json({ message: 'Failed to get landing page staff', error: error.message });
    }
  });

  app.get('/api/staff/:id', optionalAuth, async (req, res) => {
    try {
      const profile = await mongoStorage.getStaffProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: 'Staff profile not found' });
      }

      // Handle both userId (existing user) and customName (custom profile) scenarios
      let staffWithUserData;
      if (profile.userId) {
        const user = await mongoStorage.getUser(profile.userId);
        staffWithUserData = {
          ...profile,
          name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Unknown',
          email: user?.email || '',
          phone: profile.phone || user?.phoneNumber || '',
          avatar: profile.avatar || user?.profileImageUrl || '',
        };
      } else {
        // Custom staff member without userId
        staffWithUserData = {
          ...profile,
          name: profile.customName || 'Unknown',
          email: '',
          phone: profile.phone || '',
          avatar: profile.avatar || '',
        };
      }

      res.json(staffWithUserData);
    } catch (error: any) {
      console.error('Get staff profile error:', error);
      res.status(500).json({ message: 'Failed to get staff profile', error: error.message });
    }
  });

  app.post('/api/staff', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { userId, customName, ...profileData } = req.body;

      // Either userId or customName must be provided
      if (!userId && !customName) {
        return res.status(400).json({ message: 'Either userId or customName is required' });
      }

      // If userId is provided, validate that the user exists
      if (userId) {
        const user = await mongoStorage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        const existingProfile = await mongoStorage.getStaffProfile(userId);
        if (existingProfile) {
          return res.status(400).json({ message: 'Staff profile already exists for this user' });
        }

        // Create profile for existing user
        const profile = await mongoStorage.createStaffProfile(userId, profileData);
        res.status(201).json(profile);
      } else {
        // Create profile for custom staff member (no userId)
        const profile = await mongoStorage.createStaffProfile(undefined, {
          ...profileData,
          customName,
        });
        res.status(201).json(profile);
      }
    } catch (error: any) {
      console.error('Create staff profile error:', error);
      res.status(500).json({ message: 'Failed to create staff profile', error: error.message });
    }
  });

  app.put('/api/staff/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const profile = await mongoStorage.getStaffProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: 'Staff profile not found' });
      }

      // Update by ID instead of userId to support both userId and customName profiles
      const updatedProfile = await mongoStorage.updateStaffProfileById(req.params.id, req.body);
      res.json(updatedProfile);
    } catch (error: any) {
      console.error('Update staff profile error:', error);
      res.status(500).json({ message: 'Failed to update staff profile', error: error.message });
    }
  });

  app.delete('/api/staff/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      await mongoStorage.deleteStaffProfile(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Delete staff profile error:', error);
      res.status(500).json({ message: 'Failed to delete staff profile', error: error.message });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const submission = await mongoStorage.createContactSubmission(req.body);
      res.status(201).json({
        message: 'Contact form submitted successfully',
        submission
      });
    } catch (error: any) {
      console.error('Contact submission error:', error);
      res.status(500).json({ message: 'Failed to submit contact form', error: error.message });
    }
  });

  // Poll routes
  // Create a new poll (admin only)
  app.post('/api/polls', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      // Validate request body using pollCreationSchema
      const validationResult = pollCreationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: 'Invalid poll data',
          errors: validationResult.error.issues
        });
      }

      const { question, options, allowMultipleVotes, expiresAt, targetLevels } = validationResult.data;

      // Transform option strings into option objects with server-generated UUIDs
      const optionsWithIds = options.map(text => ({
        id: randomUUID(),
        text,
        votes: 0
      }));

      // Create poll with properly formatted options
      const poll = await mongoStorage.createPoll(req.user!.userId, {
        question,
        options: optionsWithIds,
        allowMultipleVotes,
        expiresAt,
        targetLevels
      });

      res.status(201).json(poll);
    } catch (error: any) {
      console.error('Create poll error:', error);
      res.status(400).json({ message: 'Failed to create poll', error: error.message });
    }
  });

  // Get all polls (optionally filter by status)
  app.get('/api/polls', optionalAuth, async (req, res) => {
    try {
      const status = req.query.status as 'active' | 'closed' | undefined;
      const polls = await mongoStorage.getPolls(status);

      // If user is authenticated, add hasVoted flag for each poll
      if (req.user?.userId) {
        const pollsWithVoteStatus = await Promise.all(
          polls.map(async (poll) => {
            const hasVoted = await mongoStorage.hasUserVoted(req.user!.userId, poll._id!);
            const userVote = hasVoted ? await mongoStorage.getUserVote(req.user!.userId, poll._id!) : undefined;
            return {
              ...poll,
              hasVoted,
              userVoteOptionId: userVote?.optionId
            };
          })
        );
        return res.json(pollsWithVoteStatus);
      }

      res.json(polls);
    } catch (error: any) {
      console.error('Get polls error:', error);
      res.status(500).json({ message: 'Failed to get polls', error: error.message });
    }
  });

  // Get a specific poll
  app.get('/api/polls/:id', optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const poll = await mongoStorage.getPoll(id);

      if (!poll) {
        return res.status(404).json({ message: 'Poll not found' });
      }

      // If user is authenticated, add hasVoted flag
      if (req.user?.userId) {
        const hasVoted = await mongoStorage.hasUserVoted(req.user.userId, id);
        const userVote = hasVoted ? await mongoStorage.getUserVote(req.user.userId, id) : undefined;
        return res.json({
          ...poll,
          hasVoted,
          userVoteOptionId: userVote?.optionId
        });
      }

      res.json(poll);
    } catch (error: any) {
      console.error('Get poll error:', error);
      res.status(500).json({ message: 'Failed to get poll', error: error.message });
    }
  });

  // Vote on a poll (authenticated users only)
  app.post('/api/polls/:id/vote', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { optionId } = req.body;

      if (!optionId) {
        return res.status(400).json({ message: 'Option ID is required' });
      }

      await mongoStorage.votePoll(req.user!.userId, id, optionId);

      // Get updated poll with vote counts
      const updatedPoll = await mongoStorage.getPoll(id);

      res.json({
        message: 'Vote recorded successfully',
        poll: updatedPoll
      });
    } catch (error: any) {
      console.error('Vote poll error:', error);
      res.status(400).json({ message: error.message || 'Failed to vote on poll' });
    }
  });

  // Close a poll (admin only)
  app.put('/api/polls/:id/close', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const poll = await mongoStorage.closePoll(id);

      res.json({
        message: 'Poll closed successfully',
        poll
      });
    } catch (error: any) {
      console.error('Close poll error:', error);
      res.status(400).json({ message: 'Failed to close poll', error: error.message });
    }
  });

  // Delete a poll (admin only)
  app.delete('/api/polls/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      await mongoStorage.deletePoll(id);

      res.json({ message: 'Poll deleted successfully' });
    } catch (error: any) {
      console.error('Delete poll error:', error);
      res.status(500).json({ message: 'Failed to delete poll', error: error.message });
    }
  });

  // Get poll voters (admin only)
  app.get('/api/polls/:id/voters', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
    try {
      const { id } = req.params;
      const voters = await mongoStorage.getPollVoters(id);
      res.json(voters);
    } catch (error: any) {
      console.error('Get poll voters error:', error);
      res.status(500).json({ message: 'Failed to get poll voters', error: error.message });
    }
  });

  // Newsletter routes
  app.post('/api/newsletter/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      await mongoStorage.subscribeNewsletter(email);
      res.json({ message: 'Successfully subscribed to newsletter' });
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      res.status(500).json({ message: 'Failed to subscribe to newsletter', error: error.message });
    }
  });

  // Test protected route
  app.get("/api/protected", authenticateToken, async (req, res) => {
    res.json({
      message: "You are authenticated!",
      user: req.user
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

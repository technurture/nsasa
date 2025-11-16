import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { mongoStorage } from "./mongoStorage";
import { authenticateToken, requireAdmin, requireSuperAdmin, requireRole, optionalAuth } from "./customAuth";
import authRoutes from "./authRoutes";
import { initializeMongoDB } from "./mongoDb";
import { insertBlogPostSchema, insertCommentSchema } from "../shared/mongoSchema";
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
      const blogs = await mongoStorage.getBlogPosts(limit, offset);
      
      // Add isLikedByUser field to each blog
      const userId = req.user?.userId;
      const blogsWithLikeStatus = await Promise.all(
        blogs.map(async (blog) => {
          const isLikedByUser = userId
            ? await mongoStorage.isPostLikedByUser(userId as string, blog._id)
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

  app.get('/api/blogs/:id', optionalAuth, async (req, res) => {
    try {
      const blog = await mongoStorage.getBlogPost(req.params.id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Increment views
      await mongoStorage.incrementBlogViews(req.params.id);
      
      // Add isLikedByUser field
      const userId = req.user?.userId;
      const isLikedByUser = userId
        ? await mongoStorage.isPostLikedByUser(userId as string, blog._id)
        : false;
      
      res.json({ ...blog, isLikedByUser });
    } catch (error: any) {
      console.error('Get blog error:', error);
      res.status(500).json({ message: 'Failed to get blog', error: error.message });
    }
  });

  app.post('/api/blogs', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
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
      
      const blog = await mongoStorage.createBlogPost(req.user.userId, validationResult.data);
      res.status(201).json(blog);
    } catch (error: any) {
      console.error('Create blog error:', error);
      res.status(500).json({ message: 'Failed to create blog', error: error.message });
    }
  });

  app.put('/api/blogs/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
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
      
      const blog = await mongoStorage.updateBlogPost(req.params.id, validationResult.data);
      res.json(blog);
    } catch (error: any) {
      console.error('Update blog error:', error);
      res.status(500).json({ message: 'Failed to update blog', error: error.message });
    }
  });

  app.delete('/api/blogs/:id', authenticateToken, requireRole(['admin', 'super_admin']), async (req, res) => {
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
          const isLikedByUser = userId
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id)
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
          const isLikedByUser = userId
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id)
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
          const isLikedByUser = userId
            ? await mongoStorage.isCommentLikedByUser(userId as string, comment._id)
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
  app.post('/api/cloudinary/signed-url', authenticateToken, async (req, res) => {
    try {
      const { publicId, resourceType = 'raw', format, filename } = req.body;
      
      if (!publicId) {
        return res.status(400).json({ message: 'publicId is required' });
      }
      
      // Generate signed URL with 1 hour expiration
      const expiresAt = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const urlOptions: any = {
        resource_type: resourceType,
        type: 'upload',
        sign_url: true,
        secure: true,
        expires_at: expiresAt
      };
      
      // Only add attachment flag if filename is provided
      if (filename) {
        urlOptions.flags = 'attachment';
        urlOptions.attachment = filename;
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
      res.json(staffProfiles);
    } catch (error: any) {
      console.error('Get staff error:', error);
      res.status(500).json({ message: 'Failed to get staff', error: error.message });
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

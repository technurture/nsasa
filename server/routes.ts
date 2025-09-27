import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { mongoStorage } from "./mongoStorage";
import { authenticateToken, requireAdmin, requireSuperAdmin, requireRole, optionalAuth } from "./customAuth";
import authRoutes from "./authRoutes";
import { initializeMongoDB } from "./mongoDb";
import { blogPostSchema } from "../shared/mongoSchema";
import { z } from "zod";

// Create validation schema for blog requests (excluding server-managed fields)
const blogRequestSchema = blogPostSchema.omit({
  _id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true
}).extend({
  // Make some fields optional for updates
  likes: z.number().optional(),
  views: z.number().optional(),
  readTime: z.number().optional()
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB
  await initializeMongoDB();
  
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
      res.json(blogs);
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
      
      res.json(blog);
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
      
      const blog = await mongoStorage.createBlogPost(req.user.userId, validationResult.data);
      res.status(201).json(blog);
    } catch (error: any) {
      console.error('Create blog error:', error);
      res.status(500).json({ message: 'Failed to create blog', error: error.message });
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
      
      const blog = await mongoStorage.updateBlogPost(req.params.id, validationResult.data);
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
      res.json(comments);
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
      
      const comment = await mongoStorage.createBlogComment(
        req.user.userId, 
        req.params.id, 
        req.body
      );
      res.status(201).json(comment);
    } catch (error: any) {
      console.error('Create comment error:', error);
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

  // Learning resources routes
  app.get('/api/resources', authenticateToken, async (req, res) => {
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

  app.get('/api/resources/:id', authenticateToken, async (req, res) => {
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

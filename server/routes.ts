import type { Express } from "express";
import { createServer, type Server } from "http";
import cookieParser from 'cookie-parser';
import { mongoStorage } from "./mongoStorage";
import { authenticateToken, requireAdmin, optionalAuth } from "./customAuth";
import authRoutes from "./authRoutes";
import { initializeMongoDB } from "./mongoDb";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize MongoDB
  await initializeMongoDB();
  
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Mount auth routes
  app.use('/api/auth', authRoutes);

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
      
      const blog = await mongoStorage.createBlogPost(req.user.userId, req.body);
      res.status(201).json(blog);
    } catch (error: any) {
      console.error('Create blog error:', error);
      res.status(500).json({ message: 'Failed to create blog', error: error.message });
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

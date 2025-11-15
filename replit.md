# Nsasa - Department of Sociology Portal

## Overview

Nsasa is a comprehensive student-focused blog and media-sharing platform designed specifically for the Department of Sociology. The platform combines academic engagement with modern social features, providing students with a secure, interactive environment to share knowledge, access learning resources, and participate in departmental activities. Key features include student registration with matric number validation, a personalized dashboard with gamification elements, blog creation and interaction, downloadable learning resources, event management, and robust admin tools for content and user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**Latest Update: November 15, 2025 - Complete Image Gallery & Nested Comments Rollout**

- ✅ **Event Detail Pages with Image Galleries**: Created EventDetailPage with full image gallery support (featured image + swipeable carousel)
- ✅ **Learning Resource Detail Pages**: Created LearningResourceDetailPage with multi-image gallery and full-screen modal viewer
- ✅ **Schema Updates**: Added `imageUrls` array field to both Event and Learning Resource schemas for multiple image support
- ✅ **Nested/Threaded Comments**: Implemented full nested comment functionality allowing users to reply to other comments
- ✅ **Comment Backend Fix**: Fixed parentCommentId conversion in MongoDB aggregation to properly organize parent-child comment relationships
- ✅ **Comment Frontend**: Added reply mutation with proper state management and cache invalidation
- ✅ **Route Integration**: Registered `/events/:id` and `/resources/:id` routes for detail pages
- ✅ **Consistent UX**: All image galleries (Blogs, Events, Resources) now share identical functionality and design patterns

**Previous Update: November 15, 2025 - Blog Image Gallery Enhancement**

- ✅ **Fixed Image Gallery Display**: Resolved issue where only 3 out of 4 uploaded images were showing
- ✅ **Enhanced Gallery Logic**: When a separate featured image exists, all additional images now display in the gallery
- ✅ **Full-Screen Image Viewer**: Added clickable images that open in a full-screen modal
- ✅ **Image Navigation**: Users can now swipe through all images using navigation arrows or click to view full-size
- ✅ **Image Counter**: Modal shows current image position (e.g., "2 / 4")
- ✅ **Responsive Design**: Gallery and modal work seamlessly on all screen sizes

**Previous Update: October 03, 2025 - GitHub Import Successfully Configured**

- ✅ **Successfully Imported from GitHub**: Fresh clone configured for Replit environment
- ✅ **MongoDB Connected**: Connected to technurture619_db database via DATABASE_URL
- ✅ **Workflow Configured**: "Start application" running `npm run dev` on port 5000 with webview output
- ✅ **Vite Dev Server**: Properly configured with allowedHosts: true for Replit proxy support
- ✅ **Server Running**: Express backend and Vite frontend both serving on 0.0.0.0:5000
- ✅ **Deployment Ready**: Autoscale deployment configured with build and start scripts
- ✅ **Application Verified**: Landing page loads successfully with all navigation working
- ✅ **Cloudinary Configured**: Cloud name and upload preset environment variables set

**Previous Update: October 03, 2025 - Navigation and Upload Fixes**

- Fixed Dashboard Navigation: Dashboard dropdown menu now properly navigates to /dashboard
- Fixed Profile/Settings Links: Profile and Settings menu items now navigate to /dashboard/settings
- Cloudinary Upload Working: VITE_CLOUDINARY_UPLOAD_PRESET configured - image uploads now functional
- Updated Header Icons: Changed Dashboard icon to LayoutDashboard for better visual clarity
- All environment variables confirmed: DATABASE_URL, JWT_SECRET, CLOUDINARY credentials, and VITE_CLOUDINARY_UPLOAD_PRESET all set

**Previous Update: October 03, 2025 - File Upload and Logout Improvements**

- Fixed Cloudinary Error Handling with improved error messages
- Added Multiple Image Upload component supporting up to 5 images per blog post
- Updated Blog Schema with imageUrls array field
- Enhanced Logout Flow to properly clear query cache and redirect
- Updated mobile responsiveness for all modals and forms
- Updated BlogCard Component to display multiple images

**October 01, 2025**

- Moved user profile section from dashboard sidebar to top navigation (beside notification icon)
- The user profile now displays in the top-right area with avatar, name, and role
- On mobile (smaller screens), only the avatar is shown to save space

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom design tokens supporting light/dark themes
- **State Management**: TanStack Query for server state management and data fetching
- **Routing**: Wouter for lightweight client-side routing
- **Component Strategy**: Component-based architecture with reusable UI components and examples

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Custom JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API endpoints organized by feature domains (auth, blogs, events, etc.)
- **Middleware**: Custom authentication middleware, cookie parsing, and error handling
- **File Structure**: Modular organization with separate route handlers and business logic

### Data Storage Solutions
- **Primary Database**: MongoDB for document-based storage with flexible schema support
- **Connection Management**: MongoDB native driver with connection pooling
- **Schema Validation**: Zod schemas for runtime type checking and data validation
- **Backup Database**: PostgreSQL with Drizzle ORM configured as alternative/backup option
- **Session Storage**: Session-based authentication with secure cookie handling

### Authentication and Authorization
- **Registration Flow**: Multi-step registration with approval workflow for students
- **Validation**: Matric number validation requiring "soc" prefix for department verification
- **Role-Based Access**: Three-tier system (student, admin, super_admin) with granular permissions
- **Security**: JWT tokens with refresh mechanism, bcrypt password hashing, and secure session management
- **Approval System**: Admin approval required for new student registrations

### Design System and Theming
- **Design Approach**: Reference-based design inspired by academic platforms like Notion and Discord
- **Color System**: Academic blue palette with semantic color tokens for different states
- **Typography**: Inter for headings and UI elements, Open Sans for body text
- **Theme Support**: Full light/dark mode support with CSS custom properties
- **Component Library**: Comprehensive UI component library with consistent spacing and interaction patterns

### Content Management
- **Blog System**: Full CRUD operations for blog posts with categories, tags, and featured content
- **Comments**: Nested comment system with moderation capabilities
- **Learning Resources**: File upload and management system for PDFs, videos, and images
- **Events**: Event creation and registration system with capacity management

### Gamification and Engagement
- **Student Dashboard**: Personalized dashboard showing relevant content and activities
- **Badge System**: Achievement badges for student engagement and milestones
- **Progress Tracking**: Profile completion tracking and activity monitoring
- **Analytics**: Admin dashboard with user engagement and content performance metrics

## External Dependencies

### Database Services
- **MongoDB**: Primary database for user data, blog posts, events, and content management
- **Neon Database**: PostgreSQL service configured as backup database option with Drizzle ORM

### UI and Design
- **Radix UI**: Comprehensive primitive components for accessibility and consistent behavior
- **shadcn/ui**: Pre-built component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Lucide React**: Icon library for consistent iconography throughout the application

### Development and Build Tools
- **Vite**: Fast build tool and development server with TypeScript support
- **TypeScript**: Type safety and enhanced developer experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Authentication and Security
- **bcryptjs**: Password hashing for secure credential storage
- **jsonwebtoken**: JWT token generation and verification for authentication
- **cookie-parser**: HTTP cookie parsing middleware for session management

### State Management and API
- **TanStack Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight routing library for single-page application navigation

### Replit Integration
- **Replit-specific tooling**: Development environment integration with runtime error overlay and cartographer plugin for enhanced debugging
- **Environment Setup**: Configured for Replit with proper host settings (0.0.0.0:5000) and allowedHosts enabled for proxy support
- **Workflow**: Single workflow "Start application" running `npm run dev` which starts both Express backend and Vite frontend on port 5000
- **Database**: Uses DATABASE_URL environment variable for MongoDB connection (currently connected to technurture619_db)
- **Required Secrets**: JWT_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, VITE_CLOUDINARY_UPLOAD_PRESET

### Cloudinary Upload Configuration (IMPORTANT)
**STATUS**: ⚠️ REQUIRES CONFIGURATION

The application uses Cloudinary for file uploads (images for blogs, events, and resources). To enable uploads, you must:

1. **Create an Upload Preset in Cloudinary Dashboard**:
   - Log in to your Cloudinary account at https://cloudinary.com/console
   - Navigate to Settings → Upload → Upload presets
   - Click "Add upload preset"
   - Set **Signing Mode** to "Unsigned" (this is critical for browser-based uploads)
   - Set a preset name (e.g., "nsasa_uploads" or "ml_default")
   - Configure any transformations or settings you want (optional)
   - Save the preset

2. **Set the Environment Variable**:
   - In Replit Secrets, add: `VITE_CLOUDINARY_UPLOAD_PRESET` = `your_preset_name`
   - The preset name must match exactly what you created in Cloudinary
   - Restart the Replit application after adding the secret

3. **Current Error**: 
   - Console shows "Upload preset not found" error
   - This prevents all image uploads from working
   - Once configured, uploads will work for blogs, events, and learning resources

**Note**: The `VITE_` prefix is required for Vite to expose the variable to the frontend.

## Recent Changes

### October 1, 2025 - Replit Environment Setup
- Fixed TypeScript compilation errors in server/routes.ts and server/mongoDb.ts
- Configured workflow to run on port 5000 with webview output
- Verified MongoDB connection and database initialization
- Confirmed frontend is loading correctly with all navigation and hero sections displaying properly
- Application successfully running in Replit environment with proper proxy configuration
# Nsasa - Department of Sociology Portal

## Overview
Nsasa is a comprehensive student-focused blog and media-sharing platform for the Department of Sociology. It aims to combine academic engagement with modern social features, offering a secure environment for students to share knowledge, access learning resources, and participate in departmental activities. Key capabilities include student registration with matric number validation, a personalized dashboard with gamification, blog creation, downloadable learning resources, event management, and administrative tools for content and user management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript (Vite).
- **UI/Styling**: Radix UI components, shadcn/ui design system, and Tailwind CSS for consistent, accessible interfaces and light/dark themes.
- **State Management**: TanStack Query for server state and data fetching.
- **Routing**: Wouter for lightweight client-side routing.
- **Component Strategy**: Reusable, component-based architecture.

### Backend Architecture
- **Runtime**: Node.js with Express.js.
- **Authentication**: Custom JWT-based authentication with bcrypt.
- **API Design**: RESTful API endpoints organized by feature domains.
- **Middleware**: Custom authentication, cookie parsing, and error handling.

### Data Storage Solutions
- **Primary Database**: MongoDB for document-based storage.
- **Schema Validation**: Zod schemas for runtime type checking.
- **Backup Database**: PostgreSQL with Drizzle ORM configured as an alternative.

### Authentication and Authorization
- **Registration**: Multi-step registration with admin approval and matric number validation (e.g., "soc" prefix).
- **Role-Based Access**: Three-tier system (student, admin, super_admin) with granular permissions.
- **Security**: JWT tokens, bcrypt password hashing, and secure session management.

### Design System and Theming
- **Design Approach**: Reference-based, inspired by academic platforms like Notion and Discord.
- **Color System**: Academic blue palette with semantic color tokens.
- **Typography**: Inter for headings, Open Sans for body text.
- **Theme Support**: Full light/dark mode.
- **Component Library**: Comprehensive UI library with consistent patterns.

### Content Management
- **Blog System**: Full CRUD for blog posts with categories, tags, and featured content.
- **Comments**: Nested comment system with moderation.
- **Learning Resources**: File upload and management for PDFs, videos, and images.
- **Events**: Event creation, registration, and capacity management.

### Gamification and Engagement
- **Student Dashboard**: Personalized dashboard.
- **Badge System**: Achievement badges.
- **Progress Tracking**: Profile completion and activity monitoring.
- **Analytics**: Admin dashboard for user engagement and content performance.

## External Dependencies

### Database Services
- **MongoDB**: Primary database.
- **Neon Database**: PostgreSQL service (backup option).

### UI and Design
- **Radix UI**: Primitive components for accessibility.
- **shadcn/ui**: Pre-built component library.
- **Tailwind CSS**: Utility-first CSS framework.
- **Lucide React**: Icon library.

### Development and Build Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Type safety.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS processing with Autoprefixer.

### Authentication and Security
- **bcryptjs**: Password hashing.
- **jsonwebtoken**: JWT token generation and verification.
- **cookie-parser**: HTTP cookie parsing middleware.

### State Management and API
- **TanStack Query**: Server state management.
- **Wouter**: Lightweight routing library.

### Replit Integration
- **Replit-specific tooling**: Development environment integration, runtime error overlay, cartographer plugin.
- **Environment Setup**: Configured for Replit with host settings (0.0.0.0:5000) and allowedHosts.
- **Workflow**: "Start application" runs `npm run dev` for both backend and frontend.
- **Database**: Uses `DATABASE_URL` for MongoDB.
- **Required Secrets**: `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `VITE_CLOUDINARY_UPLOAD_PRESET`.

### Cloudinary Upload Configuration
The application uses Cloudinary for file uploads.
**STATUS**: ⚠️ REQUIRES CONFIGURATION
- Create an "Unsigned" upload preset in Cloudinary (e.g., "nsasa_uploads").
- Set `VITE_CLOUDINARY_UPLOAD_PRESET` environment variable in Replit Secrets to match the preset name.
- This configuration is critical for image uploads to function correctly.
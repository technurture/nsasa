# Nsasa - Department of Social Science Portal

## Overview

Nsasa is a comprehensive student-focused blog and media-sharing platform designed specifically for the Department of Social Science. The platform combines academic engagement with modern social features, providing students with a secure, interactive environment to share knowledge, access learning resources, and participate in departmental activities. Key features include student registration with matric number validation, a personalized dashboard with gamification elements, blog creation and interaction, downloadable learning resources, event management, and robust admin tools for content and user management.

## User Preferences

Preferred communication style: Simple, everyday language.

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
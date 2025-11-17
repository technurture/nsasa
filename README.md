# Nsasa - Department of Sociology Portal

A comprehensive web application for the Department of Sociology, built with Express.js, React, TypeScript, and MongoDB. This platform enables students to connect, learn, and grow through blogs, events, learning resources, and community engagement.

## Features

- **User Authentication** - Secure registration and login with JWT tokens
- **Blog System** - Create, read, update, and delete blog posts with rich content
- **Events Management** - Organize and manage department events
- **Learning Resources** - Share and access educational materials
- **User Profiles** - Customizable student profiles with avatars
- **Admin Dashboard** - Manage users, approve registrations, and oversee content
- **Image Uploads** - Cloudinary integration for file and image management
- **Email Notifications** - Password reset and approval emails via Resend
- **Responsive Design** - Beautiful UI with dark mode support

## Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - High-quality React components
- **Framer Motion** - Smooth animations

### Backend
- **Express.js** - Fast, minimalist web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Resend** - Transactional email service
- **Cloudinary** - Media management

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB Atlas account** - [Sign up here](https://www.mongodb.com/cloud/atlas)
- **Cloudinary account** - [Sign up here](https://cloudinary.com/)
- **Resend account** (optional for email) - [Sign up here](https://resend.com/)

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd nsasa-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying the example file:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your values:

```env
# Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Email (Optional - for password reset and notifications)
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application
NODE_ENV=development
PORT=5000
```

#### Getting Your Credentials

**MongoDB:**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Connect" → "Connect your application"
3. Copy the connection string and replace `<username>`, `<password>`, and `<database_name>`

**Cloudinary:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to find your Cloud Name, API Key, and API Secret
3. Go to Settings → Upload → Upload Presets → Create unsigned preset

**Resend (Optional):**
1. Sign up at [Resend](https://resend.com/)
2. Go to API Keys and create a new key
3. Verify your domain or use the test domain

**JWT Secret:**
Generate a secure random string:
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any password generator
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

The application will be available at:
- **Frontend & API:** http://localhost:5000

### 5. Create an Admin User (Optional)

To create an admin user for testing:

```bash
npm run seed:admin
```

This creates an admin account with:
- Email: `admin@nsasa.com`
- Password: `admin123`

**⚠️ Change the password immediately after first login!**

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (frontend + backend) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run seed:admin` | Create an admin user |

## Project Structure

```
nsasa-portal/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configs
│   │   └── App.tsx        # Main app component
│   └── index.html
├── server/                # Backend Express application
│   ├── authRoutes.ts      # Authentication routes
│   ├── routes.ts          # API routes
│   ├── mongoDb.ts         # MongoDB connection
│   ├── mongoStorage.ts    # Data access layer
│   ├── emailService.ts    # Email functionality
│   ├── config.ts          # Environment configuration
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   ├── mongoSchema.ts     # MongoDB schemas
│   └── config.ts          # Shared configuration
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Deployment on Replit

This application is optimized for deployment on Replit with automatic environment detection.

### Setup on Replit

1. **Import the project** to Replit
2. **Add secrets** via Tools → Secrets:
   - `MONGODB_URL`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `CLOUDINARY_UPLOAD_PRESET`

3. **Set up Resend connector** (recommended):
   - Search for "Resend" in Replit integrations
   - Connect your Resend account
   - This handles email credentials automatically

4. **Run the app** - Click the "Run" button

### Publishing to Production

1. Click the **Deploy** button in Replit
2. Configure your deployment settings:
   - Deployment type: **Autoscale**
   - Build command: `npm run build`
   - Run command: `npm run start`
3. Click **Deploy**

Your app will be available at `https://your-app.replit.app`

### Custom Domain

To use a custom domain:
1. Go to your deployment settings
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `my-cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `abcdef123456` |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | `my_preset` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for emails (local dev) | Uses Replit connector if available |
| `RESEND_FROM_EMAIL` | Email sender address | `onboarding@resend.dev` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `BASE_URL` | Base URL for standalone production (AWS, Heroku, etc.) | Auto-detected from platform |
| `FRONTEND_URL` | Frontend URL (if different from BASE_URL) | Uses BASE_URL |
| `API_URL` | API URL (if different from BASE_URL) | Uses BASE_URL |

### Auto-detected Variables (Replit)

These are automatically set by Replit:
- `REPLIT_DOMAINS` - App domains
- `REPLIT_DEV_DOMAIN` - Development domain
- `REPLIT_DEPLOYMENT` - Deployment flag
- `REPLIT_CONNECTORS_HOSTNAME` - Connectors API host

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "matricNumber": "SOC/2024/001"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

#### Get Current User
```http
GET /api/auth/user
Authorization: Bearer <token>
```

### Blogs

#### Get All Blogs
```http
GET /api/blogs
```

#### Get Single Blog
```http
GET /api/blogs/:id
```

#### Create Blog
```http
POST /api/blogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Blog Title",
  "content": "Blog content...",
  "excerpt": "Short description",
  "coverImage": "cloudinary-url",
  "category": "Technology"
}
```

### Events

#### Get All Events
```http
GET /api/events
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Event Title",
  "description": "Event description",
  "date": "2024-12-25T10:00:00Z",
  "location": "Campus Hall"
}
```

## Troubleshooting

### Application won't start

**Check environment variables:**
```bash
# Verify all required secrets are set
env | grep -E "MONGODB_URL|JWT_SECRET|CLOUDINARY"
```

**Check MongoDB connection:**
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify the connection string is correct
- Check if the database user has proper permissions

### Email not sending

**For local development:**
- Verify `RESEND_API_KEY` is set correctly
- Check that your Resend account is active
- Verify the sender email is from a verified domain

**On Replit:**
- Use the Resend connector for easier setup
- Check connector status in Tools → Integrations

### Images not uploading

**Check Cloudinary setup:**
- Verify all Cloudinary credentials are correct
- Ensure the upload preset exists and is set to "unsigned"
- Check browser console for specific errors

### Port already in use

If port 5000 is in use:
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

## Security Considerations

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ HTTP-only cookies for token storage
- ✅ Environment variables for secrets
- ✅ HTTPS in production (Replit)
- ✅ Input validation with Zod schemas
- ✅ MongoDB injection protection via Mongoose

### Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong JWT secrets** - Minimum 32 characters
3. **Rotate secrets regularly** - Especially in production
4. **Enable 2FA** - On MongoDB, Cloudinary, and Replit accounts
5. **Monitor access logs** - Check for suspicious activity
6. **Keep dependencies updated** - Run `npm audit` regularly

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team
- Check the [Replit documentation](https://docs.replit.com)

## Acknowledgments

- Built with ❤️ for the Department of Sociology
- Powered by Replit, MongoDB, and Cloudinary
- UI components from Shadcn/UI
- Icons from Lucide React

---

**Happy coding! 🚀**

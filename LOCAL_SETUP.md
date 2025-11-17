# Local Development Setup Guide

This guide will help you set up the Nsasa application on your local machine for development and testing.

## Quick Start

### 1. Prerequisites

Make sure you have these installed:
- Node.js v18 or higher ([Download](https://nodejs.org/))
- Git
- A code editor (VS Code recommended)

### 2. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nsasa-portal

# Install dependencies
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Then open `.env` and fill in your values:

```env
# ==============================================
# REQUIRED FOR LOCAL DEVELOPMENT
# ==============================================

# MongoDB Database
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application Settings
NODE_ENV=development
PORT=5000
```

## Detailed Setup Instructions

### Getting MongoDB URL

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account if you don't have one
3. Create a new cluster (free tier available)
4. Click **"Connect"** → **"Connect your application"**
5. Copy the connection string
6. Replace:
   - `<username>` with your database username
   - `<password>` with your database password
   - `<database_name>` with your database name (e.g., `nsasa_db`)

Example:
```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/nsasa_db
```

### Getting JWT Secret

Generate a secure random string (minimum 32 characters):

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**On Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Or use an online generator:**
- https://randomkeygen.com/ (use "Fort Knox Passwords")

Copy the generated string and paste it as your `JWT_SECRET`.

### Getting Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com/) (free tier available)
2. Go to your **Dashboard**
3. Find these values:
   - **Cloud Name** - shown at the top
   - **API Key** - shown in the API credentials section
   - **API Secret** - click "Reveal" to see it

4. **Create an Upload Preset:**
   - Go to **Settings** → **Upload**
   - Scroll to **Upload Presets**
   - Click **"Add upload preset"**
   - Set **Signing Mode** to **"Unsigned"**
   - Give it a name (e.g., `nsasa_uploads`)
   - Click **"Save"**
   - Copy the preset name

### Getting Resend API Key (for Email)

**This is what you need for local development!**

1. Sign up at [Resend](https://resend.com/) (free tier: 100 emails/day)
2. Go to **API Keys** in the dashboard
3. Click **"Create API Key"**
4. Give it a name (e.g., "Development")
5. Copy the API key (starts with `re_`)
6. Paste it as `RESEND_API_KEY` in your `.env` file

**Email address setup:**
- **For testing:** Use `onboarding@resend.dev` (free, no verification needed)
- **For production:** Add and verify your own domain in Resend settings

Example:
```env
RESEND_API_KEY=re_AbCdEf123456_YourActualKeyHere
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### 4. Run the Application

Start the development server:

```bash
npm run dev
```

You should see:
```
Successfully connected to MongoDB database: your_database
MongoDB indexes created successfully
[express] serving on port 5000
```

Open your browser to: **http://localhost:5000**

### 5. Create an Admin User (Optional)

To create a test admin account:

```bash
npm run seed:admin
```

This creates:
- **Email:** `admin@nsasa.com`
- **Password:** `admin123`

**⚠️ Change this password after first login!**

## Testing Email Functionality

To test password reset and approval emails:

1. Make sure `RESEND_API_KEY` is set in your `.env`
2. Register a new user on http://localhost:5000
3. Try the "Forgot Password" feature
4. Check your email inbox (or Resend dashboard logs)

## Common Issues

### "Email service not configured"

**Problem:** Email features don't work
**Solution:** Make sure `RESEND_API_KEY` is set in your `.env` file

```env
RESEND_API_KEY=re_your_actual_key_here
```

### "Cannot connect to MongoDB"

**Problem:** Database connection fails
**Solutions:**
1. Check your MongoDB Atlas IP whitelist (allow your IP or use `0.0.0.0/0` for testing)
2. Verify username/password in connection string
3. Check if the cluster is running

### "Port 5000 already in use"

**Problem:** Another app is using port 5000
**Solution:** Change the port in your `.env`:

```env
PORT=3000
```

Then access: http://localhost:3000

### Images not uploading

**Problem:** Cloudinary uploads fail
**Solutions:**
1. Verify all Cloudinary credentials in `.env`
2. Make sure upload preset is set to "Unsigned"
3. Check browser console for error details

## Development Workflow

```bash
# Start dev server (watches for changes)
npm run dev

# Run TypeScript type checking
npm run check

# Build for production
npm run build

# Start production server
npm run start
```

## File Structure

```
nsasa-portal/
├── .env                    # Your environment variables (DO NOT COMMIT!)
├── .env.example           # Template for environment variables
├── client/                # Frontend code (React)
│   └── src/
├── server/                # Backend code (Express)
│   ├── config.ts         # Environment configuration
│   ├── emailService.ts   # Email functionality
│   └── index.ts          # Server entry point
└── shared/               # Shared types and schemas
```

## Next Steps

1. **Read the main [README.md](./README.md)** for full documentation
2. **Explore the codebase** - start with `server/index.ts` and `client/src/App.tsx`
3. **Try the features** - register, login, create a blog post
4. **Test email** - use password reset to verify email service works

## Need Help?

- Check the main [README.md](./README.md)
- Review error messages in the terminal
- Check browser console (F12) for frontend errors
- Verify all environment variables are set correctly

---

**Happy coding! 🚀**

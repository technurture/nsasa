import { Router } from 'express';
import { mongoStorage } from './mongoStorage';
import { generateToken, authenticateToken } from './customAuth';
import { initializeMongoDB } from './mongoDb';
import {
  insertUserSchema,
  userSchema,
  type RegisterUser
} from '@shared/mongoSchema';
import { sendPasswordResetEmail, sendApprovalEmail, sendRegistrationPendingEmail, sendRoleChangeEmail, sendAccountNotFoundEmail } from './emailService';
import { config } from './config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Initialize MongoDB connection
initializeMongoDB().catch(console.error);

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const userData: RegisterUser = req.body;

    // Validate request body
    const validatedData = insertUserSchema.extend({
      password: userSchema.shape.passwordHash
    }).omit({
      passwordHash: true
    }).extend({
      password: userSchema.shape.passwordHash
    }).parse(userData);

    // Additional validation for matric number
    if (validatedData.matricNumber && !validatedData.matricNumber.toLowerCase().includes('soc')) {
      return res.status(400).json({
        message: 'Matric number must contain "soc" for Department of Sociology students'
      });
    }

    const newUser = await mongoStorage.registerUser(validatedData);

    // Send pending registration email
    try {
      if (newUser.email && newUser.firstName) {
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        await sendRegistrationPendingEmail(newUser.email, newUser.firstName, origin);
        console.log(`Registration pending email sent to ${newUser.email}`);
      }
    } catch (emailError: any) {
      console.error('Failed to send registration pending email:', emailError);
      // Don't fail the registration if email fails
    }

    // Remove password hash from response
    const { passwordHash, ...userResponse } = newUser;

    res.status(201).json({
      message: 'Registration successful! Your account is pending approval.',
      user: userResponse
    });
  } catch (error: any) {
    console.error('Registration error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({ message: error.message });
    }

    if (error.message.includes('matric number')) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const { user, token } = await mongoStorage.loginUser(email, password);

    // Set token in HTTP-only cookie for security
    // Only set secure flag when actually using HTTPS
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isSecure ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/' // Ensure cookie is sent for all paths
    });

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token // Also return token for frontend storage if needed
    });
  } catch (error: any) {
    console.error('Login error:', error);

    if (error.message.includes('Invalid email') || error.message.includes('password')) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (error.message.includes('pending approval')) {
      return res.status(403).json({
        message: 'Your account is pending approval by an administrator'
      });
    }

    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Logout endpoint - support both GET and POST for compatibility
router.all('/logout', (req, res) => {
  // Clear cookie with same options as when it was set
  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'strict' : 'lax',
    path: '/'
  });
  res.json({ message: 'Logged out successfully' });
});

// Get current user endpoint
router.get('/user', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const user = await mongoStorage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user;

    res.json(userResponse);
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Failed to get user information',
      error: error.message
    });
  }
});

// Update user profile endpoint
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const updates = req.body;

    // Don't allow updating certain fields
    delete updates.passwordHash;
    delete updates._id;
    delete updates.email;
    delete updates.role;
    delete updates.approvalStatus;
    delete updates.createdAt;

    const updatedUser = await mongoStorage.completeUserProfile(req.user.userId, updates);

    // Remove password hash from response
    const { passwordHash, ...userResponse } = updatedUser;

    res.json({
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error: any) {
    console.error('Profile update error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Admin endpoints for user management
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const status = req.query.status as string;
    const users = status
      ? await mongoStorage.getUsersByApprovalStatus(status)
      : await mongoStorage.getUsersByApprovalStatus('pending');

    // Remove password hashes from all users
    const usersResponse = users.map(user => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(usersResponse);
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Failed to get users',
      error: error.message
    });
  }
});

router.put('/admin/users/:id/approval', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const updatedUser = await mongoStorage.updateUserApprovalStatus(id, status);

    // Send approval/rejection email
    if (updatedUser.email) {
      try {
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        await sendApprovalEmail(
          updatedUser.email,
          updatedUser.firstName || 'Student',
          updatedUser.lastName || '',
          status === 'approved',
          origin
        );
        console.log(`${status} email sent to ${updatedUser.email}`);
      } catch (emailError: any) {
        console.error('Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Remove password hash from response
    const { passwordHash, ...userResponse } = updatedUser;

    res.json({
      message: `User ${status} successfully`,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Update user approval error:', error);
    res.status(500).json({
      message: 'Failed to update user approval status',
      error: error.message
    });
  }
});

router.put('/admin/users/:id/role', authenticateToken, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Super admin access required' });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be student, admin, or super_admin' });
    }

    const updatedUser = await mongoStorage.updateUserRole(id, role);

    // Send email notification
    if (updatedUser.email) {
      try {
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        await sendRoleChangeEmail(updatedUser.email, updatedUser.firstName || 'User', role, origin);
        console.log(`Role update email sent to ${updatedUser.email}`);
      } catch (emailError: any) {
        console.error('Failed to send role update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Remove password hash from response
    const { passwordHash, ...userResponse } = updatedUser;

    res.json({
      message: `User role updated to ${role} successfully`,
      user: userResponse
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// Forgot password endpoint
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await mongoStorage.getUserByEmail(email);

    if (!user) {
      // Send "Account Not Found" email to prompt registration
      try {
        // Use request origin (frontend URL) or fallback to configured URL
        const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
        await sendAccountNotFoundEmail(email, origin);
        console.log(`Account not found email sent to ${email}`);
      } catch (emailError: any) {
        console.error('Failed to send account not found email:', emailError);
      }

      // Return success even if user doesn't exist (security best practice)
      return res.json({
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate password reset token (expires in 1 hour)
    const resetToken = jwt.sign(
      { userId: user._id?.toString() || '', email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Use request origin (frontend URL) or fallback to configured URL
    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const base = origin; // Or config.frontendUrl if origin is missing/reliable

    // Create reset URL using dynamic base URL
    const resetUrl = `${base}/reset-password?token=${resetToken}`;

    // Send password reset email
    try {
      if (user.email && user.firstName) {
        // Pass "1 hour" explicitly matching the token expiry
        await sendPasswordResetEmail(user.email, resetUrl, user.firstName, "1 hour");
        console.log(`Password reset email sent to ${user.email}`);
      }
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError);
      return res.status(500).json({
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.json({
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// Reset password endpoint
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({ message: 'Password reset link has expired. Please request a new one.' });
      }
      return res.status(400).json({ message: 'Invalid password reset link' });
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await mongoStorage.getUser(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await mongoStorage.updateUserPassword(decoded.userId, hashedPassword);

    res.json({ message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

export default router;
import { Router } from 'express';
import { mongoStorage } from './mongoStorage';
import { generateToken, authenticateToken } from './customAuth';
import { initializeMongoDB } from './mongoDb';
import { 
  insertUserSchema, 
  userSchema,
  type RegisterUser 
} from '@shared/mongoSchema';

const router = Router();

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
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
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

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
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
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const updatedUser = await mongoStorage.updateUserApprovalStatus(id, status);
    
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

export default router;
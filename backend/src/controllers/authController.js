const db = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

/**
 * Login user
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Get user from database
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = users[0];
    
    console.log('Login attempt for:', email);
    console.log('User found:', user.id);
    console.log('Password hash from DB:', user.encrypted_password.substring(0, 20) + '...');
    
    // Verify password
    const isValid = await comparePassword(password, user.encrypted_password);
    
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Get user profile
    const [profiles] = await db.query(
      'SELECT * FROM profiles WHERE id = ?',
      [user.id]
    );
    
    const profile = profiles[0] || {};
    
    // Generate JWT
    const token = generateToken(user.id, user.email, profile.role || 'student');
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
        firstName: profile.first_name,
        lastName: profile.last_name,
        isOnboarded: user.is_onboarded
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register new user
 */
const signup = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      department,
      club,
      professionalSociety,
      phoneNumber
    } = req.body;
    
    // Default password for admin-created users
    const finalPassword = password || 'password';
    
    // Validation
    if (!email || !firstName || !lastName || !role) {
      return res.status(400).json({
        error: 'Email, first name, last name, and role are required'
      });
    }
    
    await connection.beginTransaction();
    
    // Check if user exists
    const [existing] = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(409).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(finalPassword);
    const userId = uuidv4();
    
    // Insert user
    await connection.query(
      'INSERT INTO users (id, email, encrypted_password, is_onboarded, email_confirmed_at) VALUES (?, ?, ?, ?, NOW())',
      [userId, email, hashedPassword, false]
    );
    
    // Insert profile
    await connection.query(
      `INSERT INTO profiles (id, first_name, last_name, role, department, club, professional_society, phone_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, firstName, lastName, role, department, club, professionalSociety, phoneNumber]
    );
    
    await connection.commit();
    
    // Generate JWT
    const token = generateToken(userId, email, role);
    
    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        role,
        firstName,
        lastName,
        isOnboarded: false
      }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res, next) => {
  try {
    const [profiles] = await db.query(
      `SELECT p.*, u.email, u.is_onboarded
       FROM profiles p
       JOIN users u ON p.id = u.id
       WHERE p.id = ?`,
      [req.user.userId]
    );
    
    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(profiles[0]);
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    // Get user to verify old password
    const [users] = await db.query('SELECT encrypted_password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found' });

    const isValid = await comparePassword(oldPassword, users[0].encrypted_password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const hashedPassword = await hashPassword(newPassword);

    await db.query(
      'UPDATE users SET encrypted_password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Onboard user (Self-onboarding password setup)
 */
const onboard = async (req, res, next) => {
  try {
    const { password } = req.body;
    const userId = req.user.userId;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const hashedPassword = await hashPassword(password);

    await db.query(
      'UPDATE users SET encrypted_password = ?, is_onboarded = TRUE WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Onboarding completed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const userId = req.user.userId;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    await db.query(
      `UPDATE profiles 
       SET first_name = ?, last_name = ?
       WHERE id = ?`,
      [firstName, lastName, userId]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Request password reset (Stub)
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    // In a real app, this would send an email. For now, we'll just return success.
    console.log(`Password reset requested for: ${email}`);
    
    res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, signup, getMe, updatePassword, resetPassword, updateProfile, onboard };

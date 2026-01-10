const db = require('../config/db');
const { hashPassword } = require('../utils/password');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all users with profiles
 */
const getUsers = async (req, res, next) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.email, u.created_at, p.first_name, p.last_name, p.role, 
              p.department, p.club, p.professional_society
       FROM users u
       LEFT JOIN profiles p ON u.id = p.id
       ORDER BY u.created_at DESC`
    );
    res.json(users);
  } catch (error) {
    next(error);
  }
};

/**
 * Create single user
 */
const createUser = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const { email, password, firstName, lastName, role, department, club, professionalSociety } = req.body;
    
    await connection.beginTransaction();
    
    const finalPassword = password || 'welcome123';
    const hashedPassword = await hashPassword(finalPassword);
    const userId = uuidv4();
    
    await connection.query(
      'INSERT INTO users (id, email, encrypted_password, email_confirmed_at) VALUES (?, ?, ?, NOW())',
      [userId, email, hashedPassword]
    );
    
    await connection.query(
      `INSERT INTO profiles (id, first_name, last_name, role, department, club, professional_society)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, firstName, lastName, role, department, club, professionalSociety]
    );
    
    await connection.commit();
    res.status(201).json({ id: userId, message: 'User created successfully' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Bulk create users
 */
const bulkCreateUsers = async (req, res, next) => {
  const connection = await db.getConnection();
  
  try {
    const { users } = req.body;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Users array is required' });
    }
    
    await connection.beginTransaction();
    
    const results = [];
    
    for (const user of users) {
      try {
        const hashedPassword = await hashPassword(user.password || 'default123');
        const userId = uuidv4();
        
        await connection.query(
          'INSERT INTO users (id, email, encrypted_password, email_confirmed_at) VALUES (?, ?, ?, NOW())',
          [userId, user.email, hashedPassword]
        );
        
        await connection.query(
          `INSERT INTO profiles (id, first_name, last_name, role, department, club, professional_society)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, user.firstName, user.lastName, user.role, user.department, user.club, user.professionalSociety]
        );
        
        results.push({ email: user.email, success: true });
      } catch (err) {
        results.push({ email: user.email, success: false, error: err.message });
      }
    }
    
    await connection.commit();
    res.json({ results });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Update user
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, department, club, professionalSociety } = req.body;
    
    await db.query(
      `UPDATE profiles 
       SET first_name = ?, last_name = ?, role = ?, department = ?, club = ?, professional_society = ?
       WHERE id = ?`,
      [firstName, lastName, role, department, club, professionalSociety, id]
    );
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, bulkCreateUsers, updateUser };

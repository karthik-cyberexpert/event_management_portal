const db = require('../config/db');

/**
 * Get all clubs
 */
const getClubs = async (req, res, next) => {
  try {
    const [clubs] = await db.query('SELECT * FROM clubs ORDER BY name');
    res.json(clubs);
  } catch (error) {
    next(error);
  }
};

/**
 * Create club
 */
const createClub = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const clubId = uuidv4();
    
    await db.query(
      'INSERT INTO clubs (id, name) VALUES (?, ?)',
      [clubId, name]
    );
    
    res.status(201).json({ id: clubId, message: 'Club created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update club
 */
const updateClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    await db.query('UPDATE clubs SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Club updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete club
 */
const deleteClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM clubs WHERE id = ?', [id]);
    res.json({ message: 'Club deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClubs, createClub, updateClub, deleteClub };

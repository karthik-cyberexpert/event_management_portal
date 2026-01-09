const db = require('../config/db');

/**
 * Get all professional societies
 */
const getSocieties = async (req, res, next) => {
  try {
    const [societies] = await db.query('SELECT * FROM professional_societies ORDER BY name');
    res.json(societies);
  } catch (error) {
    next(error);
  }
};

/**
 * Create professional society
 */
const createSociety = async (req, res, next) => {
  try {
    const { name } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const societyId = uuidv4();
    
    await db.query(
      'INSERT INTO professional_societies (id, name) VALUES (?, ?)',
      [societyId, name]
    );
    
    res.status(201).json({ id: societyId, message: 'Society created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update professional society
 */
const updateSociety = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    await db.query('UPDATE professional_societies SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'Society updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete professional society
 */
const deleteSociety = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM professional_societies WHERE id = ?', [id]);
    res.json({ message: 'Society deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSocieties, createSociety, updateSociety, deleteSociety };

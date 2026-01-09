const db = require('../config/db');

/**
 * Get all venues
 */
const getVenues = async (req, res, next) => {
  try {
    const [venues] = await db.query('SELECT * FROM venues ORDER BY name');
    res.json(venues);
  } catch (error) {
    next(error);
  }
};

/**
 * Create venue
 */
const createVenue = async (req, res, next) => {
  try {
    const { name, capacity, location } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const venueId = uuidv4();
    
    await db.query(
      'INSERT INTO venues (id, name, capacity, location) VALUES (?, ?, ?, ?)',
      [venueId, name, capacity, location]
    );
    
    res.status(201).json({ id: venueId, message: 'Venue created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update venue
 */
const updateVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, capacity, location } = req.body;
    
    await db.query(
      'UPDATE venues SET name = ?, capacity = ?, location = ? WHERE id = ?',
      [name, capacity, location, id]
    );
    
    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete venue
 */
const deleteVenue = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM venues WHERE id = ?', [id]);
    res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVenues, createVenue, updateVenue, deleteVenue };

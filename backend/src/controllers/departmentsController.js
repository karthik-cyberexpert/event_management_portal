const db = require('../config/db');

/**
 * Get all departments
 */
const getDepartments = async (req, res, next) => {
  try {
    const [departments] = await db.query('SELECT * FROM departments ORDER BY name');
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

/**
 * Create department
 */
const createDepartment = async (req, res, next) => {
  try {
    const { name, degree } = req.body;
    const { v4: uuidv4 } = require('uuid');
    const deptId = uuidv4();
    
    await db.query(
      'INSERT INTO departments (id, name, degree) VALUES (?, ?, ?)',
      [deptId, name, degree]
    );
    
    res.status(201).json({ id: deptId, message: 'Department created successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Update department
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, degree } = req.body;
    
    await db.query(
      'UPDATE departments SET name = ?, degree = ? WHERE id = ?',
      [name, degree, id]
    );
    
    res.json({ message: 'Department updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete department
 */
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDepartments, createDepartment, updateDepartment, deleteDepartment };

require('dotenv').config({ path: './backend/.env' });
const db = require('./src/config/db');

const addBudgetRemarksColumn = async () => {
  try {
    console.log('Adding budget_remarks column to events table...');
    
    // Check if column exists first to avoid errors
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'events' 
      AND COLUMN_NAME = 'budget_remarks'
    `);

    if (columns.length > 0) {
      console.log('Column budget_remarks already exists.');
    } else {
      await db.query(`
        ALTER TABLE events 
        ADD COLUMN budget_remarks TEXT DEFAULT NULL
      `);
      console.log('Successfully added budget_remarks column.');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit();
  }
};

addBudgetRemarksColumn();

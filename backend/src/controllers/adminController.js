const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Controller for admin-specific operations
 */
const exportDatabase = async (req, res) => {
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbUser = process.env.DB_USER || 'root';
    const dbPassword = process.env.DB_PASSWORD;
    const dbName = process.env.DB_NAME || 'event_management';
    
    // Create fileName with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `ems_backup_${timestamp}.sql`;
    const filePath = path.join(__dirname, '../../uploads', fileName);
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // mysqldump command
    // Note: --no-tablespaces is often needed if the user doesn't have PROCESS privilege
    let command = `mysqldump -h ${dbHost} -u ${dbUser} `;
    if (dbPassword) {
      command += `-p${dbPassword} `;
    }
    command += `${dbName} --no-tablespaces > "${filePath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error exporting database: ${error.message}`);
        return res.status(500).json({ error: 'Failed to export database' });
      }
      
      // Send the file for download
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error(`Error sending file: ${err.message}`);
          // Don't try to send another response if headers are already sent
        }
        
        // Clean up: delete the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Error deleting backup file: ${err.message}`);
        });
      });
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  exportDatabase
};

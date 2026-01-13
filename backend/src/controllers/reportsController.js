const db = require('../config/db');

/**
 * Get report for an event
 */
const getReport = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    
    const [reports] = await db.query(
      'SELECT * FROM event_reports WHERE event_id = ?',
      [eventId]
    );
    
    if (reports.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Parse JSON fields
    const report = reports[0];
    
    // Auto-generate password if missing (for legacy/existing reports)
    if (!report.report_password) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const newPassword = `ACE-${randomNum}`;
      
      await db.query(
        'UPDATE event_reports SET report_password = ? WHERE event_id = ?',
        [newPassword, eventId]
      );
      report.report_password = newPassword;
      console.log(`Auto-generated password for legacy report: ${eventId}`);
    }

    if (report.social_media_links && typeof report.social_media_links === 'string') {
      report.social_media_links = JSON.parse(report.social_media_links);
    }
    if (report.report_photo_urls && typeof report.report_photo_urls === 'string') {
      report.report_photo_urls = JSON.parse(report.report_photo_urls);
    }
    
    res.json(report);
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update report for an event
 */
const upsertReport = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const {
      final_report_remarks,
      student_participants,
      faculty_participants,
      external_participants,
      social_media_links,
      report_photo_urls,
      activity_lead_by
    } = req.body;

    if (!final_report_remarks) {
      return res.status(400).json({ error: 'Final report remarks are required' });
    }

    // Check if report exists
    const [existing] = await db.query(
      'SELECT event_id, report_password FROM event_reports WHERE event_id = ?',
      [eventId]
    );

    const socialMediaJSON = JSON.stringify(social_media_links || {});
    const photosJSON = JSON.stringify(report_photo_urls || []);
    
    // Generate password if not exists
    let password = existing.length > 0 ? existing[0].report_password : null;
    if (!password) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      password = `ACE-${randomNum}`;
    }

    if (existing.length > 0) {
      // Update
      await db.query(
        `UPDATE event_reports 
         SET final_report_remarks = ?, 
             student_participants = ?, 
             faculty_participants = ?, 
             external_participants = ?, 
             social_media_links = ?, 
             report_photo_urls = ?,
             activity_lead_by = ?,
             submitted_at = NOW()
         WHERE event_id = ?`,
        [
          final_report_remarks,
          student_participants || 0,
          faculty_participants || 0,
          external_participants || 0,
          socialMediaJSON,
          photosJSON,
          activity_lead_by,
          eventId
        ]
      );
    } else {
      // Insert
      await db.query(
        `INSERT INTO event_reports 
         (event_id, final_report_remarks, student_participants, faculty_participants, external_participants, social_media_links, report_photo_urls, activity_lead_by, report_password)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          eventId,
          final_report_remarks,
          student_participants || 0,
          faculty_participants || 0,
          external_participants || 0,
          socialMediaJSON,
          photosJSON,
          activity_lead_by,
          password
        ]
      );
    }

    res.json({ message: 'Report saved successfully', password });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReport,
  upsertReport
};

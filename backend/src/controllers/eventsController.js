const db = require('../config/db');
const { createNotification } = require('./notificationsController');

/**
 * Get all events with filters
 */
const getEvents = async (req, res, next) => {
  try {
    const { status } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    // Fetch requester's profile to get department
    const [profiles] = await db.query('SELECT department FROM profiles WHERE id = ?', [userId]);
    const userDepartment = profiles.length > 0 ? profiles[0].department : null;

    let query = `
      SELECT e.*, v.name as venue_name, v.location as venue_location, 
             p.first_name, p.last_name, p.role, p.department, p.club, p.professional_society
      FROM events e
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN profiles p ON e.submitted_by = p.id
      WHERE 1=1
    `;
    const params = [];
    
    // Role-based visibility logic
    if (userRole === 'admin' || userRole === 'principal' || userRole === 'dean') {
      // Sees everything, no additional filter
    } else {
      // Sees events from their department (HOD, Coordinator, Student, etc.)
      if (userDepartment) {
        query += ` AND p.department = ?`;
        params.push(userDepartment);
      } else {
        // If no department assigned, only show their own events as a fallback
        query += ` AND e.submitted_by = ?`;
        params.push(userId);
      }
    }
    
    // Filter by status (optional query param)
    if (status) {
      query += ` AND e.status = ?`;
      params.push(status);
    }
    
    query += ` ORDER BY e.created_at DESC`;
    
    const [events] = await db.query(query, params);
    
    // Nest venue and profile details for frontend consistency
    const jsonFields = [
      'coordinator_name', 'coordinator_contact', 'category', 'sdg_alignment',
      'target_audience', 'speakers', 'speaker_details', 'speaker_contacts',
      'funding_source', 'promotion_strategy'
    ];

    const mappedEvents = events.map(event => {
      // Parse JSON fields
      jsonFields.forEach(field => {
        if (typeof event[field] === 'string') {
          try {
            event[field] = JSON.parse(event[field]);
          } catch (e) {
            event[field] = [];
          }
        }
      });

      return {
        ...event,
        venues: event.venue_id ? {
          name: event.venue_name,
          location: event.venue_location
        } : null,
        profiles: {
          first_name: event.first_name,
          last_name: event.last_name,
          role: event.role,
          department: event.department,
          club: event.club,
          professional_society: event.professional_society
        }
      };
    });

    res.json(mappedEvents);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single event
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [events] = await db.query(
      `SELECT e.*, v.name as venue_name, v.location as venue_location, 
              p.first_name, p.last_name, p.role, p.department, p.club, p.professional_society
       FROM events e
       LEFT JOIN venues v ON e.venue_id = v.id
       LEFT JOIN profiles p ON e.submitted_by = p.id
       WHERE e.id = ?`,
      [id]
    );
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = events[0];
    
    // Parse JSON fields
    const jsonFields = [
      'coordinator_name', 'coordinator_contact', 'category', 'sdg_alignment',
      'target_audience', 'speakers', 'speaker_details', 'speaker_contacts',
      'funding_source', 'promotion_strategy'
    ];

    jsonFields.forEach(field => {
      if (typeof event[field] === 'string') {
        try {
          event[field] = JSON.parse(event[field]);
        } catch (e) {
          event[field] = [];
        }
      }
    });

    const mappedEvent = {
      ...event,
      venues: event.venue_id ? {
        name: event.venue_name,
        location: event.venue_location
      } : null,
      profiles: {
        first_name: event.first_name,
        last_name: event.last_name,
        role: event.role,
        department: event.department,
        club: event.club,
        professional_society: event.professional_society
      }
    };
    
    res.json(mappedEvent);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new event
 */
const createEvent = async (req, res, next) => {
  try {
    const eventData = req.body;
    const userId = req.user.userId;
    const { v4: uuidv4 } = require('uuid');
    const eventId = uuidv4();

    // Generate unique code (6 chars)
    const uniqueCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const fields = [
      'id', 'title', 'description', 'academic_year', 'program_driven_by', 
      'quarter', 'program_type', 'program_theme', 'event_date', 'end_date',
      'start_time', 'end_time', 'expected_audience', 'department_club',
      'coordinator_name', 'coordinator_contact', 'mode_of_event', 'category',
      'objective', 'sdg_alignment', 'target_audience', 'proposed_outcomes',
      'speakers', 'speaker_details', 'speaker_contacts', 'budget_estimate',
      'funding_source', 'promotion_strategy', 'venue_id', 'other_venue_details',
      'poster_url', 'unique_code', 'submitted_by', 'status'
    ];

    const jsonFields = [
      'coordinator_name', 'coordinator_contact', 'category', 'sdg_alignment',
      'target_audience', 'speakers', 'speaker_details', 'speaker_contacts',
      'funding_source', 'promotion_strategy'
    ];

    // 5. Determine initial status
    const [userProfiles] = await db.query(
      'SELECT department, club, professional_society FROM profiles WHERE id = ?',
      [userId]
    );

    const profile = userProfiles[0] || {};
    const hasAssignment = profile.department || profile.club || profile.professional_society;
    const initialStatus = hasAssignment ? 'pending_hod' : 'pending_dean';

    const values = [];
    fields.forEach(field => {
      if (field === 'id') {
        values.push(eventId);
      } else if (field === 'unique_code') {
        values.push(uniqueCode);
      } else if (field === 'submitted_by') {
        values.push(userId);
      } else if (field === 'status') {
        values.push(initialStatus);
      } else if (jsonFields.includes(field)) {
        values.push(JSON.stringify(eventData[field] || []));
      } else {
        values.push(eventData[field] === undefined ? null : eventData[field]);
      }
    });

    const placeholders = fields.map(() => '?').join(', ');
    
    await db.query(
      `INSERT INTO events (${fields.join(', ')}) VALUES (${placeholders})`,
      values
    );

    // 6. Notify appropriate roles
    if (initialStatus === 'pending_hod') {
      // Notify HOD of new event in their department
      const [hods] = await db.query(
        "SELECT id FROM profiles WHERE role = 'hod' AND department = ?",
        [profile.department]
      );

      for (const hod of hods) {
        await createNotification(
          hod.id,
          eventId,
          `New event submission: "${eventData.title}" requires your approval.`
        );
      }
    } else {
      // Notify Deans of new event (Skipped HOD)
      const [deans] = await db.query("SELECT id FROM profiles WHERE role = 'dean'");
      for (const dean of deans) {
        await createNotification(
          dean.id,
          eventId,
          `New direct submission (No HOD): "${eventData.title}" requires your review.`
        );
      }
    }

    res.status(201).json({ id: eventId, uniqueCode, message: 'Event created successfully', status: initialStatus });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event
 */
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventData = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if event exists and user has permission
    const [events] = await db.query('SELECT submitted_by FROM events WHERE id = ?', [id]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (events[0].submitted_by !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const jsonFields = [
      'coordinator_name', 'coordinator_contact', 'category', 'sdg_alignment',
      'target_audience', 'speakers', 'speaker_details', 'speaker_contacts',
      'funding_source', 'promotion_strategy'
    ];

    const fields = [];
    const values = [];

    // Fields that are allowed to be updated
    const updatableFields = [
      'title', 'description', 'academic_year', 'program_driven_by', 
      'quarter', 'program_type', 'program_theme', 'event_date', 'end_date',
      'start_time', 'end_time', 'expected_audience', 'department_club',
      'coordinator_name', 'coordinator_contact', 'mode_of_event', 'category',
      'objective', 'sdg_alignment', 'target_audience', 'proposed_outcomes',
      'speakers', 'speaker_details', 'speaker_contacts', 'budget_estimate',
      'funding_source', 'promotion_strategy', 'venue_id', 'other_venue_details',
      'poster_url', 'coordinator_resubmission_reason', 'status', 'remarks'
    ];

    updatableFields.forEach(field => {
      if (eventData[field] !== undefined) {
        fields.push(`${field} = ?`);
        if (jsonFields.includes(field)) {
          values.push(JSON.stringify(eventData[field] || []));
        } else {
          values.push(eventData[field]);
        }
      }
    });

    if (fields.length === 0) {
      return res.json({ message: 'No fields to update' });
    }

    values.push(id);
    
    await db.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check permission
    const [events] = await db.query('SELECT submitted_by FROM events WHERE id = ?', [id]);
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (events[0].submitted_by !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }
    
    await db.query('DELETE FROM events WHERE id = ?', [id]);
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve/Reject event
 */
const updateEventStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const userRole = req.user.role;
    const userId = req.user.userId;

    // Check if event exists
    const [events] = await db.query('SELECT submitted_by FROM events WHERE id = ?', [id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if user is owner
    const isOwner = events[0].submitted_by === userId;

    // Get current event data to check if HOD was skipped
    const [eventDetails] = await db.query('SELECT hod_approval_at FROM events WHERE id = ?', [id]);
    const hodSkipped = eventDetails[0]?.hod_approval_at === null;

    // Role-based status transitions
    const allowedStatuses = {
      coordinator: isOwner ? ['cancelled'] : [],
      hod: ['pending_dean', 'returned_to_coordinator'],
      dean: ['pending_principal', hodSkipped ? 'returned_to_coordinator' : 'returned_to_hod'],
      principal: ['approved', 'rejected', 'returned_to_dean'],
      admin: ['approved', 'rejected', 'cancelled', 'pending_hod', 'pending_dean', 'pending_principal']
    };
    
    // Merge roles if user has multiple (e.g. coordinator and admin)
    let userAllowedStatuses = allowedStatuses[userRole] || [];
    if (isOwner && userRole !== 'coordinator') {
      userAllowedStatuses = [...new Set([...userAllowedStatuses, 'cancelled'])];
    }
    
    if (!userAllowedStatuses.includes(status)) {
      return res.status(403).json({ error: 'Not authorized for this status change' });
    }
    
    let timestampField = null;
    if (status === 'pending_dean') timestampField = 'hod_approval_at';
    if (status === 'pending_principal') timestampField = 'dean_approval_at';
    if (status === 'approved') timestampField = 'principal_approval_at';
    
    let query = 'UPDATE events SET status = ?';
    const params = [status];
    
    if (timestampField) {
      query += `, ${timestampField} = NOW()`;
    }
    
    if (remarks) {
      query += ', remarks = ?';
      params.push(remarks);
    }
    
    query += ' WHERE id = ?';
    params.push(id);
    
    await db.query(query, params);
    
    // Record in history
    await db.query(
      `INSERT INTO event_history (event_id, changed_by, old_status, new_status, remarks)
       VALUES (?, ?, ?, ?, ?)`,
      [id, req.user.userId, null, status, remarks]
    );

    // Notify Coordinator of status update
    const [eventRow] = await db.query('SELECT title, submitted_by FROM events WHERE id = ?', [id]);
    if (eventRow.length > 0) {
      const event = eventRow[0];
      const statusText = status.replace(/_/g, ' ');
      await createNotification(
        event.submitted_by,
        id,
        `Your event "${event.title}" status has been updated to "${statusText}".`
      );

      // If it moves to next approver, notify them (optional, but good for UX)
      if (status === 'pending_dean') {
        const [deans] = await db.query("SELECT id FROM profiles WHERE role = 'dean'");
        for (const dean of deans) {
          await createNotification(dean.id, id, `New event "${event.title}" requires your review (HOD approved).`);
        }
      } else if (status === 'pending_principal') {
        const [principals] = await db.query("SELECT id FROM profiles WHERE role = 'principal'");
        for (const principal of principals) {
          await createNotification(principal.id, id, `New event "${event.title}" requires your final approval (Dean approved).`);
        }
      }
    }
    
    res.json({ message: 'Event status updated successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event history
 */
const getEventHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [history] = await db.query(
      `SELECT eh.*, p.first_name, p.last_name, p.role
       FROM event_history eh
       LEFT JOIN profiles p ON eh.changed_by = p.id
       WHERE eh.event_id = ?
       ORDER BY eh.created_at DESC`,
      [id]
    );
    
    res.json(history);
  } catch (error) {
    next(error);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { venueId, startDate, endDate, startTime, endTime, eventId } = req.body;
    
    // If venue is "other", it's always available (or not tracked)
    if (!venueId || venueId === 'other') {
      return res.json({ available: true });
    }

    const [conflicts] = await db.query(
      `SELECT id FROM events 
       WHERE venue_id = ? 
       AND status NOT IN ('rejected', 'cancelled', 'returned_to_coordinator')
       AND id != ?
       AND (
         (event_date <= ? AND end_date >= ?) -- Date overlap
       )
       AND (
         (start_time < ? AND end_time > ?) -- Time overlap
       )`,
      [venueId, eventId || '', endDate, startDate, endTime, startTime]
    );

    res.json({ available: conflicts.length === 0 });
  } catch (error) {
    next(error);
  }
};

/**
 * Get event by unique code
 */
const getEventByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const [events] = await db.query(
      `SELECT e.*, 
       v.name as venue_name, v.location as venue_location,
       p.first_name, p.last_name, p.role, p.department, p.club, p.professional_society
       FROM events e 
       LEFT JOIN venues v ON e.venue_id = v.id 
       LEFT JOIN profiles p ON e.submitted_by = p.id
       WHERE e.unique_code = ?`,
      [code]
    );

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Parse JSON fields
    const jsonFields = [
      'coordinator_name', 'coordinator_contact', 'category', 'sdg_alignment',
      'target_audience', 'speakers', 'speaker_details', 'speaker_contacts',
      'funding_source', 'promotion_strategy'
    ];

    jsonFields.forEach(field => {
      if (typeof event[field] === 'string') {
        try {
          event[field] = JSON.parse(event[field]);
        } catch (e) {
          event[field] = [];
        }
      }
    });

    const mappedEvent = {
      ...event,
      venues: event.venue_id ? {
        name: event.venue_name,
        location: event.venue_location
      } : null,
      profiles: {
        first_name: event.first_name,
        last_name: event.last_name,
        role: event.role,
        department: event.department,
        club: event.club,
        professional_society: event.professional_society
      }
    };
    
    res.json(mappedEvent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventHistory,
  checkAvailability,
  getEventByCode
};

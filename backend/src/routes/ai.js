const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/ai/generate-objective
 * @desc    Generate report objective using AI (Mocked)
 * @access  Private
 */
router.post('/generate-objective', authenticate, (req, res) => {
  const { title, objective, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Event title is required' });
  }

  // MOCK AI LOGIC: Construct a polished objective based on input
  let generatedObjective = '';
  
  if (objective) {
    generatedObjective = `The primary objective of "${title}" was ${objective.charAt(0).toLowerCase() + objective.slice(1)}. `;
  } else {
    generatedObjective = `The event "${title}" was organized to provide students with practical insights and hands-on experience in the field. `;
  }

  if (description) {
    generatedObjective += `Through this program, participants explored various aspects of ${description.length > 50 ? description.substring(0, 50) + '...' : description}, enabling them to bridge the gap between theoretical knowledge and industry practices. `;
  } else {
    generatedObjective += `The session focused on enhancing technical competencies and fostering an environment of innovation and collaborative learning. `;
  }

  generatedObjective += `Overall, the event successfully empowered attendees with valuable skills and a deeper understanding of the subject matter.`;

  res.json({ objective: generatedObjective });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const HEADCOUNT_SERVICE_URL = process.env.HEADCOUNT_SERVICE_URL || 'http://127.0.0.1:5001';

router.post('/detect-batch', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    const formData = new FormData();
    req.files.forEach((file) => {
      formData.append('files[]', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    });

    const response = await axios.post(`${HEADCOUNT_SERVICE_URL}/detect-batch`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Headcount service error:', error.message);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to communicate with headcount service',
      details: error.message 
    });
  }
});

module.exports = router;

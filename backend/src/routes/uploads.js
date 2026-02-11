const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate } = require('../middleware/auth');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: File upload only supports images (jpeg, jpg, png)!'));
  }
});

/**
 * @route   POST /api/upload
 * @desc    Upload a single file
 * @access  Private
 */
router.post('/', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a file' });
  }
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ 
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.filename
  });
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple files
 * @access  Private
 */
router.post('/multiple', authenticate, upload.array('files', 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Please upload files' });
  }
  
  const urls = req.files.map(file => `${req.protocol}://${req.get('host')}/uploads/${file.filename}`);
  res.json({ 
    message: 'Files uploaded successfully',
    urls: urls
  });
});

module.exports = router;

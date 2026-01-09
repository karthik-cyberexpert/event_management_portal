const express = require('express');
const router = express.Router();
const { getSocieties, createSociety, updateSociety, deleteSociety } = require('../controllers/societiesController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getSocieties);
router.post('/', authorize('admin'), createSociety);
router.put('/:id', authorize('admin'), updateSociety);
router.delete('/:id', authorize('admin'), deleteSociety);

module.exports = router;

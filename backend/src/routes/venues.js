const express = require('express');
const router = express.Router();
const { getVenues, createVenue, updateVenue, deleteVenue } = require('../controllers/venuesController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getVenues);
router.post('/', authorize('admin'), createVenue);
router.put('/:id', authorize('admin'), updateVenue);
router.delete('/:id', authorize('admin'), deleteVenue);

module.exports = router;

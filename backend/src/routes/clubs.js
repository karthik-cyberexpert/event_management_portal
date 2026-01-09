const express = require('express');
const router = express.Router();
const { getClubs, createClub, updateClub, deleteClub } = require('../controllers/clubsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getClubs);
router.post('/', authorize('admin'), createClub);
router.put('/:id', authorize('admin'), updateClub);
router.delete('/:id', authorize('admin'), deleteClub);

module.exports = router;

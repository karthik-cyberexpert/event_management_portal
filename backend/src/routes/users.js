const express = require('express');
const router = express.Router();
const { getUsers, createUser, bulkCreateUsers, updateUser, resetPassword } = require('../controllers/usersController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin')); // All user management requires admin

router.get('/', getUsers);
router.post('/', createUser);
router.post('/bulk', bulkCreateUsers);
router.put('/:id', updateUser);
router.put('/:id/reset-password', resetPassword);

module.exports = router;

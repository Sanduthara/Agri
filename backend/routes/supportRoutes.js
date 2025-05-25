const express = require('express');
const supportController = require('../controllers/supportController');
const upload = require('../controllers/multerConfig');
const router = express.Router();

// Create a new support entry
router.post('/', upload.single('attachment'), supportController.createSupport);

// Get all support entries
router.get('/', supportController.getAllSupport);

// Update a support entry
router.put('/:id', upload.single('attachment'), supportController.updateSupport);

// Delete a support entry
router.delete('/:id', supportController.deleteSupport);

// Reply to a support entry (added)
router.patch('/reply/:id', supportController.replyToSupport);

module.exports = router;

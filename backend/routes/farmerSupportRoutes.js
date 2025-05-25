const express = require('express');
const farmerSupportController = require('../controllers/farmerSupportController');
const upload = require('../controllers/multerConfig');
const router = express.Router();

// Create a new farmer support entry
router.post('/', upload.single('attachment'), farmerSupportController.createFarmerSupport);

// Get all farmer support entries
router.get('/', farmerSupportController.getAllFarmerSupport);

// Update a farmer support entry
router.put('/:id', upload.single('attachment'), farmerSupportController.updateFarmerSupport);

// Delete a farmer support entry
router.delete('/:id', farmerSupportController.deleteFarmerSupport);

// Reply to a farmer support entry (added)
router.patch('/reply/:id', farmerSupportController.replyToFarmerSupport);

module.exports = router;

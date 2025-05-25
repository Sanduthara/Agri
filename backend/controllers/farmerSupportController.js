const FarmerSupport = require('../models/farmerSupport');
const upload = require('./multerConfig');
const multer = require('multer');

// Create a new farmer support entry
exports.createFarmerSupport = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { subject, category, description, priority, farmerId } = req.body;
    const attachmentPath = req.file ? req.file.path : '';

    const newFarmerSupport = new FarmerSupport({
      subject,
      category,
      description,
      priority: priority || 'Medium',
      farmerId,
      attachment: attachmentPath,
    });

    await newFarmerSupport.save();
    res.status(201).json(newFarmerSupport);
  } catch (error) {
    console.error('Error creating farmer support entry:', error);
    res.status(500).json({ error: 'Failed to create farmer support entry' });
  }
};

// Get all farmer support entries
exports.getAllFarmerSupport = async (req, res) => {
  try {
    const farmerSupportEntries = await FarmerSupport.find();

    const mappedEntries = farmerSupportEntries.map(entry => ({
      id: entry._id,
      subject: entry.subject,
      category: entry.category,
      description: entry.description,
      priority: entry.priority,
      farmerId: entry.farmerId,
      attachment: entry.attachment,
      createdAt: entry.createdAt,
    }));

    res.status(200).json(mappedEntries);
  } catch (error) {
    console.error('Error fetching farmer support entries:', error);
    res.status(500).json({ error: 'Failed to fetch farmer support entries' });
  }
};

// Update a farmer support entry
exports.updateFarmerSupport = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const farmerSupportId = req.params.id;

    if (!farmerSupportId || farmerSupportId === 'undefined') {
      return res.status(400).json({ error: 'Invalid farmer support ID provided' });
    }

    const { subject, category, description, priority } = req.body;

    const updateData = {
      subject,
      category,
      description,
      priority: priority || 'Medium',
    };

    if (req.file) {
      updateData.attachment = req.file.path;
    }

    const updatedFarmerSupport = await FarmerSupport.findByIdAndUpdate(
      farmerSupportId,
      updateData,
      { new: true }
    );

    if (!updatedFarmerSupport) {
      return res.status(404).json({ error: 'Farmer support entry not found' });
    }

    const mappedSupport = {
      id: updatedFarmerSupport._id,
      subject: updatedFarmerSupport.subject,
      category: updatedFarmerSupport.category,
      description: updatedFarmerSupport.description,
      priority: updatedFarmerSupport.priority,
      farmerId: updatedFarmerSupport.farmerId,
      attachment: updatedFarmerSupport.attachment,
      createdAt: updatedFarmerSupport.createdAt,
    };

    res.status(200).json(mappedSupport);
  } catch (error) {
    console.error('Error updating farmer support entry:', error);
    res.status(500).json({ error: 'Failed to update farmer support entry' });
  }
};

// Delete a farmer support entry
exports.deleteFarmerSupport = async (req, res) => {
  try {
    const farmerSupportId = req.params.id;

    if (!farmerSupportId || farmerSupportId === 'undefined') {
      return res.status(400).json({ error: 'Invalid farmer support ID provided' });
    }

    const deletedFarmerSupport = await FarmerSupport.findByIdAndDelete(farmerSupportId);

    if (!deletedFarmerSupport) {
      return res.status(404).json({ error: 'Farmer support entry not found' });
    }

    res.status(200).json({ message: 'Farmer support entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting farmer support entry:', error);
    res.status(500).json({ error: 'Failed to delete farmer support entry' });
  }
};

// Reply to a farmer support entry
exports.replyToFarmerSupport = async (req, res) => {
  try {
    const farmerSupportId = req.params.id;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const updatedFarmerSupport = await FarmerSupport.findByIdAndUpdate(
      farmerSupportId,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!updatedFarmerSupport) {
      return res.status(404).json({ error: 'Farmer support entry not found' });
    }

    res.status(200).json(updatedFarmerSupport);
  } catch (error) {
    console.error('Error replying to farmer support entry:', error);
    res.status(500).json({ error: 'Failed to reply to farmer support entry' });
  }
};

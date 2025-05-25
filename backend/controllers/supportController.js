const Support = require('../models/Support');
const upload = require('./multerConfig');
const multer = require('multer');

// Create a new support entry
exports.createSupport = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('Uploaded File:', req.file); // Log the uploaded file

    const { subject, category, description, priority, farmerId } = req.body;
    const attachmentPath = req.file ? req.file.path : '';  // File handling

    const newSupport = new Support({
      subject,
      category,
      description,
      priority: priority || 'Medium',  // Default to 'Medium' if not provided
      farmerId,
      attachment: attachmentPath,  // Attach file if provided
    });

    await newSupport.save();
    res.status(201).json(newSupport);
  } catch (error) {
    console.error('Error creating support entry:', error);
    res.status(500).json({ error: 'Failed to create support entry' });
  }
};

// Get all support entries
exports.getAllSupport = async (req, res) => {
  try {
    const supportEntries = await Support.find();
    
    // Map _id to id for frontend compatibility
    const mappedEntries = supportEntries.map(entry => ({
      id: entry._id,
      subject: entry.subject,
      category: entry.category,
      description: entry.description,
      priority: entry.priority,
      farmerId: entry.farmerId,
      attachment: entry.attachment,  // Optional file path
      createdAt: entry.createdAt,
    }));

    res.status(200).json(mappedEntries);
  } catch (error) {
    console.error('Error fetching support entries:', error);
    res.status(500).json({ error: 'Failed to fetch support entries' });
  }
};

// Update a support entry
exports.updateSupport = async (req, res) => {
  try {
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const supportId = req.params.id;
    
    if (!supportId || supportId === 'undefined') {
      return res.status(400).json({ error: 'Invalid support ID provided' });
    }

    const { subject, category, description, priority } = req.body;

    // Create update object
    const updateData = {
      subject,
      category,
      description,
      priority: priority || 'Medium',  // Default to 'Medium' if not provided
    };

    // Only update the attachment if a new file was uploaded
    if (req.file) {
      updateData.attachment = req.file.path;
    }

    const updatedSupport = await Support.findByIdAndUpdate(
      supportId,
      updateData,
      { new: true }  // Return the updated object
    );

    if (!updatedSupport) {
      return res.status(404).json({ error: 'Support entry not found' });
    }

    // Map _id to id for frontend compatibility
    const mappedSupport = {
      id: updatedSupport._id,
      subject: updatedSupport.subject,
      category: updatedSupport.category,
      description: updatedSupport.description,
      priority: updatedSupport.priority,
      farmerId: updatedSupport.farmerId,
      attachment: updatedSupport.attachment,
      createdAt: updatedSupport.createdAt,
    };

    res.status(200).json(mappedSupport);
  } catch (error) {
    console.error('Error updating support entry:', error);
    res.status(500).json({ error: 'Failed to update support entry' });
  }
};

// Delete a support entry
exports.deleteSupport = async (req, res) => {
  try {
    const supportId = req.params.id;

    // Add validation to prevent "undefined" being passed
    if (!supportId || supportId === 'undefined') {
      return res.status(400).json({ error: 'Invalid support ID provided' });
    }

    const deletedSupport = await Support.findByIdAndDelete(supportId);

    if (!deletedSupport) {
      return res.status(404).json({ error: 'support entry not found' });
    }

    res.status(200).json({ message: 'Support entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting support entry:', error);
    res.status(500).json({ error: 'Failed to delete support entry' });
  }
};

// Reply to a support entry
exports.replyToSupport = async (req, res) => {
  try {
    const supportId = req.params.id;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ error: 'Reply content is required' });
    }

    const updatedSupport = await Support.findByIdAndUpdate(
      supportId,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!updatedSupport) {
      return res.status(404).json({ error: 'Support entry not found' });
    }

    res.status(200).json(updatedSupport);
  } catch (error) {
    console.error('Error replying to support entry:', error);
    res.status(500).json({ error: 'Failed to reply to support entry' });
  }
};

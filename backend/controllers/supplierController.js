// controllers/supplierController.js
const Supplier = require('../models/Supplier');

// @desc Get all suppliers
// @route GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get a single supplier by ID
// @route GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create a new supplier
// @route POST /api/suppliers
const createSupplier = async (req, res) => {
  const { supplier, contact, email, collectedAmount, deliveryCount, qualityRating, lastDeliveryDate } = req.body;

  try {
    const newSupplier = new Supplier({
      supplier,
      contact,
      email,
      collectedAmount,
      deliveryCount,
      qualityRating,
      lastDeliveryDate,
    });

    await newSupplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update an existing supplier
// @route PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  const { supplier, contact, email, collectedAmount, deliveryCount, qualityRating, lastDeliveryDate } = req.body;

  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { supplier, contact, email, collectedAmount, deliveryCount, qualityRating, lastDeliveryDate },
      { new: true }
    );

    if (!updatedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a supplier
// @route DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);

    if (!deletedSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};

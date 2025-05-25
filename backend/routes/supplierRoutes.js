// routes/supplierRoutes.js
const express = require('express');
const { 
  getSuppliers, 
  getSupplierById, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} = require('../controllers/supplierController');

const router = express.Router();

// Get all suppliers
router.get('/', getSuppliers);

// Get a single supplier by ID
router.get('/:id', getSupplierById);

// Create a new supplier
router.post('/', createSupplier);

// Update an existing supplier
router.put('/:id', updateSupplier);

// Delete a supplier
router.delete('/:id', deleteSupplier);

module.exports = router;

const Inventory = require('../models/inventory.js');

// @desc Fetch all inventory items
// @route GET /api/inventory
const getInventory = async (req, res, next) => {
    try {
        const inventory = await Inventory.find();
        res.status(200).json(inventory);
    } catch (error) {
        next(error);
    }
};

// @desc Fetch single inventory item by ID
// @route GET /api/inventory/:id
const getInventoryById = async (req, res, next) => {
    try {
        const inventoryItem = await Inventory.findById(req.params.id);
        if (!inventoryItem) {
            return res.status(404).json({ message: "Inventory item not found" });
        }
        res.status(200).json(inventoryItem);
    } catch (error) {
        next(error);
    }
};

// @desc Add new inventory item
// @route POST /api/inventory
const addInventory = async (req, res, next) => {
    const { item_name, quantity, warehouse_location, stored_date, expiration_date } = req.body;

    try {
        const newInventory = new Inventory({
            item_name,
            quantity,
            warehouse_location,
            stored_date,
            expiration_date
        });

        const savedInventory = await newInventory.save();
        res.status(201).json(savedInventory);
    } catch (error) {
        next(error);
    }
};

// @desc Update an inventory item
// @route PUT /api/inventory/:id
const updateInventory = async (req, res, next) => {
    try {
        const updatedInventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedInventory) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.status(200).json(updatedInventory);
    } catch (error) {
        next(error);
    }
};

// @desc Delete an inventory item
// @route DELETE /api/inventory/:id
const deleteInventory = async (req, res, next) => {
    try {
        const deletedInventory = await Inventory.findByIdAndDelete(req.params.id);

        if (!deletedInventory) {
            return res.status(404).json({ message: "Inventory item not found" });
        }

        res.status(200).json({ message: "Inventory item deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getInventory,
    getInventoryById,
    addInventory,
    updateInventory,
    deleteInventory
};

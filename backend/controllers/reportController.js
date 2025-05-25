import Inventory from "../models/inventory.js";

// Generate Inventory Report
export const getInventoryReport = async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.json({ inventory });  // <-- this change
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

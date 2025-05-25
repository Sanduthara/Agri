const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        item_name: { type: String, required: true },
        quantity: { type: Number, required: true },
        warehouse_location: { type: String, required: true },
        stored_date: { type: Date, required: true, default: Date.now },
        expiration_date: { type: Date }
    },
    { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);
module.exports = Inventory;
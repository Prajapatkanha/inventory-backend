const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    item: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    supplier: { type: String, required: true },
    brand: { type: String, required: true },
    size: { type: String, required: true },  // Small, Medium, Large
    color: { type: String, required: true }
});

module.exports = mongoose.model('Inventory', InventorySchema);

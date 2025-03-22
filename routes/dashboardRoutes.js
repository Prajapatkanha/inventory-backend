const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Inventory = require('../models/inventory');
const Supplier = require('../models/supplier');
const Category = require('../models/category');

// ✅ Get Dashboard Data API
router.get('/', async (req, res) => {
    try {
        const totalInventory = await Inventory.countDocuments();
        const lowStockItems = await Inventory.countDocuments({ quantity: { $lt: 5 } });
        const totalCategories = await Category.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalSuppliers = await Supplier.countDocuments();
        const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);

        // ✅ Fetch Low Stock List (जिनकी quantity < 5 है)
        const lowStockList = await Inventory.find({ quantity: { $lt: 5 } }).select("item quantity category");

        res.json({
            totalInventory,
            lowStockItems,
            lowStockList,  // ✅ Low Stock Items List Add किया
            totalCategories,
            totalOrders,
            totalSuppliers,
            totalRevenue: totalRevenue[0]?.total || 0
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error });
    }
});

module.exports = router;
